'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    // Simple filter function
    const filterRestaurants = () => {
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      // Only include restaurants in the current view
      const inBounds = restaurants.filter((r) => {
        if (!r.latitude || !r.longitude) return false;
        return bounds.contains([Number(r.latitude), Number(r.longitude)]);
      });

      // For high zoom levels, show all restaurants in view
      if (zoom >= 16) {
        const maxRestaurants = 300;
        if (inBounds.length > maxRestaurants) {
          setVisibleRestaurants(inBounds.slice(0, maxRestaurants));
        } else {
          setVisibleRestaurants(inBounds);
        }
        return;
      }

      // For lower zoom levels, use a grid to prevent too many markers
      const gridSize = zoom <= 12 ? 0.006 : zoom <= 14 ? 0.003 : 0.0015;

      // Track one restaurant per grid cell
      const grid: Record<string, HappyHourVenue> = {};

      // Add each restaurant to its grid cell
      for (const restaurant of inBounds) {
        if (!restaurant.latitude || !restaurant.longitude) continue;

        // Calculate grid cell
        const lat = Number(restaurant.latitude);
        const lng = Number(restaurant.longitude);
        const gridX = Math.floor(lng / gridSize);
        const gridY = Math.floor(lat / gridSize);
        const gridKey = `${gridX},${gridY}`;

        // If cell is not occupied, add restaurant
        if (!grid[gridKey]) {
          grid[gridKey] = restaurant;
        }
      }

      // Convert grid back to array
      const filtered = Object.values(grid);

      // Cap the max restaurants to show at each zoom level
      const maxMarkers = zoom <= 12 ? 100 : zoom <= 14 ? 150 : 200;
      if (filtered.length > maxMarkers) {
        setVisibleRestaurants(filtered.slice(0, maxMarkers));
      } else {
        setVisibleRestaurants(filtered);
      }
    };

    // Register event handlers
    map.on('zoomend', filterRestaurants);
    map.on('moveend', filterRestaurants);

    // Initial filter
    filterRestaurants();

    // Cleanup
    return () => {
      map.off('zoomend', filterRestaurants);
      map.off('moveend', filterRestaurants);
    };
  }, [map, restaurants, setVisibleRestaurants, userPosition]);

  return null;
};

export default ZoomFilterControl;
