// components/map/markers/MapMarkers.tsx
'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { happyHourVenues, HappyHourVenue } from 'src/server/db/schema';
import { HappyHour, Deal } from 'src/types/happy-hour';

interface UserLocationMarkerProps {
  position: [number, number]; 
}

interface RestaurantMarkersProps {
  restaurants: HappyHourVenue[];
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


export const RestaurantMarkers: React.FC<RestaurantMarkersProps> = ({ restaurants }) => {
  const formatHappyHours = (happyHours: HappyHour[] | null) => {
    if (!happyHours || happyHours.length === 0) return 'No happy hours listed';

    const formattedHours = happyHours
      .map((hour) => `${hour.day}: ${hour.start_time}-${hour.end_time}`)
      .join(`,`);

    return formattedHours;
  };

const formatDeals = (deals: Deal[] | null) => {
  if (!deals || deals.length == 0) return 'No deals listed';

  const uniqueDeals = deals.filter(
    (deal, index, self) =>
      index ===
      self.findIndex(
        (d) => d.category === deal.category && d.name === deal.name && d.price === deal.price
      )
  );

  const formattedDeals = uniqueDeals
    .map((deal) => {
      let displayPrice = deal.price;

      if (typeof deal.price === 'string' && deal.price.includes('%')) {
        const percentMatch = deal.price.match(/(\d+)%/);
        if (percentMatch && percentMatch[1]) {
          const percentValue = parseInt(percentMatch[1], 10);
          if (percentValue > 99) {
            displayPrice = 'Special deal';
          }
        }
      }

      return `${deal.category}: ${deal.name} (${displayPrice})`;
    })
    .join(', ');

  return formattedDeals;
};
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

              {/* Display website and social links if available */}
              {(restaurant.websiteUrl ||
                restaurant.instagramUrl ||
                restaurant.yelpUrl ||
                restaurant.googlemapsUrl) && (
                <div className="mb-2 flex space-x-2">
                  {restaurant.websiteUrl && (
                    <a
                      href={restaurant.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Website
                    </a>
                  )}
                  {restaurant.instagramUrl && (
                    <a
                      href={restaurant.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Instagram
                    </a>
                  )}
                  {restaurant.googlemapsUrl && (
                    <a
                      href={restaurant.googlemapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Directions
                    </a>
                  )}
                </div>
              )}

              <div className="mb-2">
                <h4 className="text-sm font-semibold">Happy Hour:</h4>
                <p className="text-sm">
                  {formatHappyHours(restaurant.happyHours as unknown as HappyHour[])}
                </p>
              </div>

              <div className="mb-2">
                <h4 className="text-sm font-semibold">Deals:</h4>
                <p className="text-sm">{formatDeals(restaurant.deals as unknown as Deal[])}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};