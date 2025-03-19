// components/map/markers/MapMarkers.tsx
'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { happyHourVenues } from 'src/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

interface UserLocationMarkerProps {
  position: [number, number]; 
}

interface RestaurantMarkersProps {
  restaurants: Restaurant[];
  getDescription: (jsonField: any) => string;
}

const userLocationIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const restaurantIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  return (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div className="text-center">
          <strong>You are here</strong>
        </div>
      </Popup>
    </Marker>
  );
};


export const RestaurantMarkers: React.FC<RestaurantMarkersProps> = ({
  restaurants,
  getDescription,
}) => {
  return (
    <>
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[Number(restaurant.latitude), Number(restaurant.longitude)]}
          icon={restaurantIcon}
        >
          <Popup>
            <div className="max-w-xs">
              <h3 className="text-lg font-bold">{restaurant.name}</h3>
              {restaurant.address && <p className="mb-2 text-sm">{restaurant.address}</p>}

              <div className="mb-2">
                <h4 className="text-sm font-semibold">Happy Hour:</h4>
                <p className="text-sm">{getDescription(restaurant.timeFrames)}</p>
              </div>

              <div className="mb-2">
                <h4 className="text-sm font-semibold">Deals:</h4>
                <p className="text-sm">{getDescription(restaurant.deals)}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};
