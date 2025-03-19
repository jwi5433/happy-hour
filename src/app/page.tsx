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
    <main className="flex min-h-screen flex-col">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Austin Happy Hour Restaurants
          </h1>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-semibold">Find happy hours around Austin</h2>
        <HappyHourMap restaurants={restaurants} loading={loading} />
      </div>
    </main>
  );
}