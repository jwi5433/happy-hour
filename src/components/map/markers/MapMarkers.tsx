// Example: components/map/markers/mapMarkers.tsx

import React from 'react';
import { HappyHourVenue } from 'src/server/db/schema';
import RestaurantMarker from './RestaurantMarker';

interface RestaurantMarkersProps {
  restaurants: HappyHourVenue[];
  selectedRestaurantId: string | null;
  selectionSource: 'search' | 'marker' | null; 
  onMarkerSelect: (restaurantId: string | null) => void;
}

const RestaurantMarkers: React.FC<RestaurantMarkersProps> = ({
  restaurants,
  selectedRestaurantId,
  selectionSource, 
  onMarkerSelect,
}) => {
  return (
    <>
      {restaurants.map((restaurant) => {
        const isSelected = selectedRestaurantId === restaurant.id;
        return (
          <RestaurantMarker
            key={restaurant.id}
            restaurant={restaurant}
            isSelected={isSelected}
            selectionSource={isSelected ? selectionSource : null}
            onSelect={onMarkerSelect}
          />
        );
      })}
    </>
  );
};

export { RestaurantMarkers };
