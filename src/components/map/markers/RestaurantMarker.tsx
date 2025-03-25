'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Star,
  Clock 
} from 'react-feather';
import { useMap } from 'react-leaflet';
import { Icon } from 'leaflet';

interface RestaurantMarkerProps {
  restaurant: HappyHourVenue;
  isSelected?: boolean;
}

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({ 
  restaurant,
  isSelected
}) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  
  if (!restaurant.latitude || !restaurant.longitude) {
    return null;
  }

  const position: [number, number] = [restaurant.latitude, restaurant.longitude];

  const handleMarkerClick = () => {
    map.closePopup();

    const targetLatLng = L.latLng(
      position[0] + 0.0035,
      position[1]
    );

    map.setView(targetLatLng, 15, {
      animate: true,
      duration: 1,
      easeLinearity: 0.25
    });

    setTimeout(() => {
      markerRef.current?.openPopup();
    }, 1000);
  };

  useEffect(() => {
    if (isSelected && restaurant.latitude && restaurant.longitude) {
      handleMarkerClick();
    }
  }, [isSelected]); 

  const restaurantIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <Marker 
      ref={markerRef}
      position={position} 
      icon={restaurantIcon}
      eventHandlers={{
        click: handleMarkerClick
      }}
    >
      <Popup 
        className="dark-theme-popup"
        minWidth={280}
      >
        <div className="w-72 rounded-xl overflow-hidden shadow-md" style={{ backgroundColor: 'var(--dark-bg-primary)' }}>
          <div className="p-3 text-center" style={{ borderBottom: '1px solid var(--dark-border)' }}>
            <h3 className="text-xl font-bold" style={{ color: 'var(--dark-text-primary)' }}>{restaurant.name}</h3>
          </div>

          <div className="p-3">
            <div className="mb-3">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 mr-1.5" style={{ color: 'white' }} />
                <h4 className="font-medium text-sm" style={{ color: 'white' }}>Hours</h4>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--dark-bg-secondary)' }}>
                <p className="text-sm whitespace-pre-line" 
                  style={{ color: 'var(--dark-text-secondary)' }}
                  dangerouslySetInnerHTML={{ 
                    __html: formatHappyHours(restaurant.happyHours as HappyHour[]) 
                  }}
                />
              </div>
            </div>

            <DealsDisplay deals={restaurant.deals as Deal[] | null} />
          
            <div className="mt-3 flex justify-center gap-2 restaurant-links">
              {restaurant.websiteUrl && (
                <a
                  href={restaurant.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center rounded-lg transition-all duration-200 py-2 px-1 border"
                  style={{ 
                    borderColor: 'var(--dark-border)',
                    backgroundColor: 'var(--dark-bg-secondary)',
                    color: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dark-accent)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dark-bg-secondary)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  title="Visit Website"
                >
                  <Globe className="h-4 w-4 mr-1.5" style={{ color: 'white' }} />
                  <span className="text-xs font-medium">Website</span>
                </a>
              )}
              
              {restaurant.instagramUrl && (
                <a
                  href={restaurant.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center rounded-lg transition-all duration-200 py-2 px-1 border"
                  style={{ 
                    borderColor: 'var(--dark-border)',
                    backgroundColor: 'var(--dark-bg-secondary)',
                    color: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dark-accent)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dark-bg-secondary)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4 mr-1.5" style={{ color: 'white' }} />
                  <span className="text-xs font-medium">Instagram</span>
                </a>
              )}
              
              {restaurant.googlemapsUrl && (
                <a
                  href={restaurant.googlemapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center rounded-lg transition-all duration-200 py-2 px-1 border"
                  style={{ 
                    borderColor: 'var(--dark-border)',
                    backgroundColor: 'var(--dark-bg-secondary)',
                    color: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dark-accent)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dark-bg-secondary)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  title="View on Google Maps"
                >
                  <MapIcon className="h-4 w-4 mr-1.5" style={{ color: 'white' }} />
                  <span className="text-xs font-medium">Directions</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;