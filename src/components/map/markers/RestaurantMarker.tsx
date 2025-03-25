'use client';

import { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { HappyHourVenue } from 'src/server/db/schema';
import DealsDisplay from './DealsDisplay';
import { HappyHour, Deal } from 'src/types/happy-hour';
import formatHappyHours from 'src/utils/formatters';
import { 
  Instagram, 
  Globe, 
  Map as MapIcon, 
  Star 
} from 'react-feather';

interface RestaurantMarkerProps {
  restaurant: HappyHourVenue;
}

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({ restaurant }) => {
  if (!restaurant.latitude || !restaurant.longitude) {
    return null;
  }

  const position: [number, number] = [restaurant.latitude, restaurant.longitude];

  return (
    <Marker position={position} icon={restaurantIcon}>
      <Popup className="dark-theme-popup">
        <div className="w-72 rounded bg-gray-800 p-3 text-white">
          <h3 className="mb-2 text-lg font-bold text-white">{restaurant.name}</h3>
          
          <p className="mb-2 text-sm text-gray-300">
            {restaurant.address || 'Address not available'}
          </p>
          
          <div className="mb-3 rounded bg-gray-700 p-2">
            <h4 className="mb-1 text-sm font-medium text-blue-300">Hours</h4>
              <p 
              className="text-xs text-gray-300 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: formatHappyHours(restaurant.happyHours as HappyHour[]) }}
            />
          </div>

          <div className="mb-3">
            <h4 className="mb-1 text-sm font-medium text-blue-300">Deals</h4>
            <DealsDisplay deals={restaurant.deals as Deal[] | null} />
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-4">
            {restaurant.websiteUrl && (
              <a
                href={restaurant.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                title="Visit Website"
              >
                <Globe size={20} />
              </a>
            )}
            
            {restaurant.instagramUrl && (
              <a
                href={restaurant.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
            )}
            
            {restaurant.googlemapsUrl && (
              <a
                href={restaurant.googlemapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                title="View on Google Maps"
              >
                <MapIcon size={20} />
              </a>
            )}
            
            {restaurant.yelpUrl && (
              <a
                href={restaurant.yelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                title="Read Reviews"
              >
                <Star size={20} />
              </a>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const restaurantIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default RestaurantMarker;