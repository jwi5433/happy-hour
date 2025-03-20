import { db } from 'src/server/db';
import { happyHourVenues } from 'src/server/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const restaurants = await db.select().from(happyHourVenues);
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}
