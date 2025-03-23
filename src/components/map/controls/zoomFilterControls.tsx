'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { HappyHourVenue } from 'src/server/db/schema';

interface ZoomFilterControlProps {
  restaurants: HappyHourVenue[];
  setVisibleRestaurants: (restaurants: HappyHourVenue[]) => void;
  userPosition: [number, number] | null;
}

const ZoomFilterControl = ({
  restaurants,
  setVisibleRestaurants,
  userPosition,
}: ZoomFilterControlProps) => {
  const map = useMap();
  const isProcessing = useRef(false);

  useEffect(() => {
    const filterRestaurants = () => {
      if (isProcessing.current) return;
      isProcessing.current = true;
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      const inBounds = restaurants.filter((r) => {
        if (!r.latitude || !r.longitude) return false;
        return bounds.contains([Number(r.latitude), Number(r.longitude)]);
      });

      if (zoom >= 16) {
        const maxRestaurants = 300;
        if (inBounds.length > maxRestaurants) {
          setVisibleRestaurants(inBounds.slice(0, maxRestaurants));
        } else {
          setVisibleRestaurants(inBounds);
        }
        return;
      }

      const gridSize = zoom <= 12 ? 0.006 : zoom <= 14 ? 0.003 : 0.0015;

      const grid: Record<string, HappyHourVenue> = {};

      for (const restaurant of inBounds) {
        if (!restaurant.latitude || !restaurant.longitude) continue;

        const lat = Number(restaurant.latitude);
        const lng = Number(restaurant.longitude);
        const gridX = Math.floor(lng / gridSize);
        const gridY = Math.floor(lat / gridSize);
        const gridKey = `${gridX},${gridY}`;

        if (!grid[gridKey]) {
          grid[gridKey] = restaurant;
        }
      }

      const filtered = Object.values(grid);

      const maxMarkers = zoom <= 12 ? 100 : zoom <= 14 ? 150 : 200;
      if (filtered.length > maxMarkers) {
        setVisibleRestaurants(filtered.slice(0, maxMarkers));
      } else {
        setVisibleRestaurants(filtered);
      }

      setTimeout(() => {
        isProcessing.current = false;
      }, 100);
    };

    map.on('zoomend', filterRestaurants);
    map.on('moveend', filterRestaurants);

    filterRestaurants();

    return () => {
      map.off('zoomend', filterRestaurants);
      map.off('moveend', filterRestaurants);
    };
  }, [map, restaurants, setVisibleRestaurants, userPosition]);

  return null;
};

export default ZoomFilterControl;
