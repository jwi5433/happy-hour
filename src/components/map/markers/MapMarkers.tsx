'use client';

import { HappyHourVenue } from 'src/server/db/schema';
import RestaurantMarker from './RestaurantMarker';
import UserLocationMarker from './UserLocationMarker';

interface RestaurantMarkersProps {
  restaurants: HappyHourVenue[];
  selectedRestaurantId?: string | null;
}

export const RestaurantMarkers: React.FC<RestaurantMarkersProps> = ({ 
  restaurants,
  selectedRestaurantId 
}) => {
  return (
    <>
      {restaurants.map((restaurant) => (
        <RestaurantMarker 
          key={restaurant.id} 
          restaurant={restaurant} 
          isSelected={selectedRestaurantId === restaurant.id}
        />
      ))}
    </>
  );
};
