import { sql } from 'drizzle-orm';
import { db } from 'src/server/db';
import { happyHourVenues } from 'src/server/db/schema';
import { NextResponse } from 'next/server';
import { env } from 'happy/env'; // Add this import

export async function GET() {
  try {
    // Test if we can connect to the database at all
    console.log('Testing database connection...');
    try {
      const connectionTest = await db.execute(sql`SELECT 1 as test`);
      console.log('Database connection working:', connectionTest);
    } catch (connError) {
      console.error('Database connection failed:', connError);
      return NextResponse.json(
        { error: 'Database connection failed', details: String(connError) },
        { status: 500 }
      );
    }

    // Check if the table exists
    console.log('Checking if table exists...');
    try {
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'happy_venue'
        )
      `);
      console.log('Table existence check:', tableCheck);
    } catch (tableError) {
      console.error('Table check failed:', tableError);
      return NextResponse.json(
        { error: 'Table check failed', details: String(tableError) },
        { status: 500 }
      );
    }

    // Now try to query the actual table
    console.log('Attempting to fetch venues...');
    const restaurants = await db.select().from(happyHourVenues);
    console.log('Query successful, found restaurants:', restaurants.length);
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch venues',
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
      },
      { status: 500 }
    );
  }
}
