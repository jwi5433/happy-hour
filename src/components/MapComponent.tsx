// src/components/MapComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { happyHourVenues } from 'src/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

interface MapComponentProps {
  className?: string;
  restaurants: Restaurant[];
}

const MapComponent = ({ className = '', restaurants = [] }: MapComponentProps) => {
  const center: [number, number] = [30.2672, -97.7431];
  const [isMounted, setIsMounted] = useState(false);

  const austinBounds = L.latLngBounds([30.12, -97.95], [30.45, -97.55]);

  const restaurantIcon = L.icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getDescription = (jsonField: any): string => {
    return jsonField[0]?.description || '';
  };

  if (!isMounted) {
    return (
      <div className={`h-[70vh] w-full ${className} flex items-center justify-center`}>
        Loading map...
      </div>
    );
  }

  return (
    <div className={`h-[70vh] w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
      </MapContainer>
    </div>
  );
};

export default MapComponent;
