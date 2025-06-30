import React from 'react';
import { HappyHourVenue } from 'src/server/db/schema';
import RestaurantMarker from './RestaurantMarker';

interface RestaurantMarkersProps {
  restaurants: HappyHourVenue[];
  selectedRestaurantId: string | null;
  selectionSource: 'search' | 'marker' | null;
  onMarkerSelect: (restaurant: HappyHourVenue) => void; // FIXED: Now expects the full object
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
