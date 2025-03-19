'use client';

import { useEffect, useState } from 'react';
import HappyHourMap from '../components/Map';
import { InferSelectModel } from 'drizzle-orm';
import { happyHourVenues } from 'src/server/db/schema';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/venues');
        const data = await response.json();
        setRestaurants(data.restaurants);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <main className="h-screen w-screen">
      <HappyHourMap restaurants={restaurants} loading={loading} className="h-full w-full" />
    </main>
  );
}
