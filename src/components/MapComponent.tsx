'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HappyHourVenue } from 'src/server/db/schema';
import LocationButton from './map/controls/locationButton';
import LocationTracker from './map/tracking/locationTracker';
import SearchControl from './map/controls/searchControls';
import ZoomFilterControl from './map/controls/zoomFilterControls';
import { UserLocationMarker, RestaurantMarkers } from './map/markers/mapMarkers';
import AiChat from './AiChat';
import ChatButton from './map/controls/chatButton';

interface MapComponentProps {
  className?: string;
  restaurants: HappyHourVenue[];
  loading?: boolean;
  initialUserPosition?: [number, number] | null;
}

const MapComponent = ({
  className = '',
  restaurants = [],
  loading = false,
  initialUserPosition = null,
}: MapComponentProps) => {
  const defaultCenter: [number, number] = [30.2672, -97.7431]; // Austin coordinates
  const [userPosition, setUserPosition] = useState<[number, number] | null>(initialUserPosition);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [visibleRestaurants, setVisibleRestaurants] = useState<HappyHourVenue[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialUserPosition || defaultCenter
  );
  const [mapKey, setMapKey] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialUserPosition) {
      setUserPosition(initialUserPosition);
      setMapCenter(initialUserPosition);
    }
  }, [initialUserPosition]);

  useEffect(() => {
    if (restaurants.length > 0) {
      setVisibleRestaurants(restaurants.slice(0, 50));
    }
  }, [restaurants]);

  const handleLocationFound = (position: [number, number]) => {
    setUserPosition(position);

    const [lat, lng] = position;
    const isInAustin = lat > 30.05 && lat < 30.55 && lng > -98.05 && lng < -97.45;

    if (isInAustin) {
      setMapCenter(position);
    } else {
      console.log('User location is outside Austin area');
    }
  };

  const handleLocationError = (errorMessage: string) => {
    setLocationError(errorMessage);
  };

  const handleLocationRequest = () => {
    setLocationError(null);
  };

  return (
    <>
      <div className={`h-[70vh] w-full ${className} relative`}>
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          maxBounds={undefined}
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

          <RestaurantMarkers restaurants={visibleRestaurants} />

          <ZoomFilterControl
            restaurants={restaurants}
            setVisibleRestaurants={setVisibleRestaurants}
            userPosition={userPosition}
          />

          <ChatButton onClick={() => setIsChatOpen(true)} />
        </MapContainer>

        {locationError && (
          <div className="absolute bottom-4 left-4 right-4 z-40 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p>{locationError}</p>
          </div>
        )}
      </div>
      <AiChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default MapComponent;
