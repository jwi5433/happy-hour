// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  jsonb,
  doublePrecision,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

export const happyHourVenues = pgTable(
  'happy_venue', 
  {
    name: text('name').notNull(),
    address: text('address'),
    latitude: doublePrecision('latitude'), 
    longitude: doublePrecision('longitude'), 
    happyHours: jsonb('happy_hours'),
    deals: jsonb('deals'),
    websiteUrl: text('website_url'),
    instagramUrl: text('instagram_url'),
    yelpUrl: text('yelp_url'),
    googlemapsUrl: text('googlemaps_url'),
    phoneNumber: text('phone_number'), 
    description: text('description'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$onUpdate(() => new Date()),
    id: uuid('id').primaryKey(), 
  }
);


export type HappyHourVenue = typeof happyHourVenues.$inferSelect;
export type NewHappyHourVenue = typeof happyHourVenues.$inferInsert;