'use client';

import { HappyHourVenue } from 'src/server/db/schema';
import RestaurantMarker from './RestaurantMarker';
import UserLocationMarker from './UserLocationMarker';

interface RestaurantMarkersProps {
  restaurants: HappyHourVenue[];
}

export const RestaurantMarkers: React.FC<RestaurantMarkersProps> = ({ restaurants }) => {
  return (
    <>
      {restaurants.map((restaurant) => (
        <RestaurantMarker key={restaurant.id} restaurant={restaurant} />
      ))}
    </>
  );
};
