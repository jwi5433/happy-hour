// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  decimal,
  jsonb,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `happy_${name}`);

export const posts = createTable(
  'post',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 256 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (example) => ({
    nameIndex: index('name_idx').on(example.name),
  })
);
export const happyHourVenues = createTable(
  'venue',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    address: text('address'),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    happyHours: jsonb('happy_hours'),
    deals: jsonb('deals'),
    websiteUrl: text('website_url'),
    instagramUrl: text('instagram_url'),
    yelpUrl: text('yelp_url'),
    googlemapsUrl: text('googlemaps_url'),
    phoneNumber: varchar('phone_number', { length: 20 }),
    description: text('description'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (venue) => ({
    nameIndex: index('venue_name_idx').on(venue.name),
    locationIndex: index('venue_location_idx').on(venue.latitude, venue.longitude),
  })
);

export type HappyHourVenue = typeof happyHourVenues.$inferSelect;
export type NewHappyHourVenue = typeof happyHourVenues.$inferInsert;