'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { happyHourVenues, HappyHourVenue } from 'src/server/db/schema';

import LocationButton from './map/controls/locationButton';
import LocationTracker from './map/tracking/locationTracker';
import SearchControl from './map/controls/searchControls';
import ZoomFilterControl from './map/controls/zoomFilterControls';
import { UserLocationMarker, RestaurantMarkers } from './map/markers/mapMarkers';

interface MapComponentProps {
  className?: string;
  restaurants: HappyHourVenue[];
}

const MapComponent = ({ className = '', restaurants = [] }: MapComponentProps) => {
  const center: [number, number] = [30.2672, -97.7431];
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [visibleRestaurants, setVisibleRestaurants] = useState<HappyHourVenue[]>([]);

  // Request location on app load
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
        },
        (error) => {
          console.log('Location permission not granted');
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Initialize with a small set of restaurants for faster initial load
  useEffect(() => {
    if (restaurants.length > 0) {
      setVisibleRestaurants(restaurants.slice(0, 50));
    }
  }, [restaurants]);

  const handleLocationFound = (position: [number, number]) => {
    setUserPosition(position);
  };

  const handleLocationError = (errorMessage: string) => {
    setLocationError(errorMessage);
  };

  const handleLocationRequest = () => {
    setLocationError(null);
  };

  return (
    <div className={`h-[70vh] w-full ${className}`}>
      <MapContainer
        center={userPosition || center}
        zoom={13}
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

        {/* Only show the filtered restaurants */}
        <RestaurantMarkers restaurants={visibleRestaurants} />

        {/* Use the zoom filter component */}
        <ZoomFilterControl
          restaurants={restaurants}
          setVisibleRestaurants={setVisibleRestaurants}
          userPosition={userPosition}
        />
      </MapContainer>

      {locationError && (
        <div className="absolute bottom-4 left-4 right-4 z-40 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>{locationError}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
