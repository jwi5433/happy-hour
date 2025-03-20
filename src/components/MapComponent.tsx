// src/components/MapComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { happyHourVenues } from 'src/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';

import LocationButton from './map/controls/locationButton';
import LocationTracker from './map/tracking/locationTracker';
import SearchControl from './map/controls/searchControls';
import { UserLocationMarker, RestaurantMarkers } from './map/markers/mapMarkers';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

interface MapComponentProps {
  className?: string;
  restaurants: Restaurant[];
}

const MapComponent = ({ className = '', restaurants = [] }: MapComponentProps) => {
  const center: [number, number] = [30.2672, -97.7431];
  const [isMounted, setIsMounted] = useState(false);

  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLocationFound = (position: [number, number]) => {
    setUserPosition(position);
  };

  const handleLocationError = (errorMessage: string) => {
    setLocationError(errorMessage);
  };

  const handleLocationRequest = () => {
    setLocationError(null);
  };

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
        maxBounds={[
          [30.05, -98.05],
          [30.55, -97.45],
        ]}
        minZoom={11}
        maxBoundsViscosity={0.8}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <SearchControl restaurants={restaurants} />
        <LocationTracker
          onLocationFound={handleLocationFound}
          onLocationError={handleLocationError}
        />
        <LocationButton onLocationRequest={handleLocationRequest} />
        {userPosition && <UserLocationMarker position={userPosition} />}
        <RestaurantMarkers restaurants={restaurants} getDescription={getDescription} />
      </MapContainer>

      {locationError && (
        <div className='mt-2" role="alert rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
          <p>{locationError}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
