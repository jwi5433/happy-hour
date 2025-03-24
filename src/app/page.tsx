'use client';

import { useEffect, useState } from 'react';
import HappyHourMap from '../components/Map';
import type { InferSelectModel } from 'drizzle-orm';
import type { happyHourVenues } from 'src/server/db/schema';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Location error:', error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/venues');
        const data = await response.json();

        if (Array.isArray(data)) {
          setRestaurants(data);
        } else if (data.restaurants && Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
        } else {
          console.error('Unexpected response format:', data);
          setRestaurants([]);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden">
      <HappyHourMap
        restaurants={restaurants}
        loading={loading}
        className="h-full w-full"
        initialUserPosition={userPosition}
      />
    </main>
  );
}
