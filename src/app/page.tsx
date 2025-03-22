'use client';

import { useEffect, useState } from 'react';
import HappyHourMap from '../components/Map';
import type { InferSelectModel } from 'drizzle-orm';
import type { happyHourVenues } from 'src/server/db/schema';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [visibleRestaurants, setVisibleRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  // Request location on load
  useEffect(() => {
    const requestLocationOnLoad = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserPosition([latitude, longitude]);
          },
          (error) => {
            console.log('Location permission not granted on load');
          },
          { timeout: 5000 }
        );
      }
    };

    requestLocationOnLoad();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // First load just a limited set for immediate display (faster initial load)
        const initialResponse = await fetch('/api/venues?limit=50');
        const initialData = await initialResponse.json();

        let data = [];
        if (Array.isArray(initialData)) {
          data = initialData;
        } else if (initialData.restaurants && Array.isArray(initialData.restaurants)) {
          data = initialData.restaurants;
        }

        setRestaurants(data);
        setVisibleRestaurants(data);
        setLoading(false);

        // Then load the full dataset in the background
        const fullResponse = await fetch('/api/venues');
        const fullData = await fullResponse.json();

        let allData = [];
        if (Array.isArray(fullData)) {
          allData = fullData;
        } else if (fullData.restaurants && Array.isArray(fullData.restaurants)) {
          allData = fullData.restaurants;
        }

        setRestaurants(allData);

        // Only update visible restaurants if user is not near any initial restaurants
        if (userPosition && data.length < 10) {
          // Show restaurants closest to user
          const sortedByDistance = [...allData].sort((a, b) => {
            if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;

            const distA = calculateDistance(
              userPosition[0],
              userPosition[1],
              Number(a.latitude),
              Number(a.longitude)
            );

            const distB = calculateDistance(
              userPosition[0],
              userPosition[1],
              Number(b.latitude),
              Number(b.longitude)
            );

            return distA - distB;
          });

          setVisibleRestaurants(sortedByDistance.slice(0, 100));
        } else {
          setVisibleRestaurants(allData);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setLoading(false);
      }
    };

    void fetchRestaurants();
  }, [userPosition]);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  return (
    <main className="h-screen w-screen">
      <HappyHourMap
        restaurants={visibleRestaurants}
        loading={loading}
        className="h-full w-full"
      />
    </main>
  );
}
