'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HappyHourVenue } from 'src/server/db/schema';
import LocationButton from './map/controls/locationButton';
import LocationTracker from './map/tracking/locationTracker';
import SearchControl from './map/controls/searchControls';
import ZoomFilterControl from './map/controls/zoomFilterControls';
import { UserLocationMarker, RestaurantMarkers } from './map/markers';
import AiChat from './AiChat';
import ChatButton from './map/controls/chatButton';
import CustomZoomControl from './map/controls/customZoomControl';
import L from 'leaflet';

interface MapComponentProps {
  className?: string;
  restaurants: HappyHourVenue[];
  loading?: boolean;
  initialUserPosition?: [number, number] | null;
}

const MapComponent = ({
  className = '',
  restaurants = [],
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
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

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

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

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

  const handleRestaurantSelect = (restaurant: HappyHourVenue) => {
    setSelectedRestaurantId(restaurant.id);
  };

  return (
    <div className={className} style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        key={mapKey}
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CustomZoomControl position="topright" />

        <LocationButton onLocationRequest={handleLocationRequest} />

        <SearchControl 
          restaurants={restaurants} 
          onRestaurantSelect={handleRestaurantSelect} 
        />

        <LocationTracker
          onLocationFound={handleLocationFound}
          onLocationError={handleLocationError}
        />

        <ZoomFilterControl
          restaurants={restaurants}
          setVisibleRestaurants={setVisibleRestaurants}
          userPosition={userPosition}
        />

        {userPosition && <UserLocationMarker position={userPosition} />}

        <RestaurantMarkers 
          restaurants={visibleRestaurants} 
          selectedRestaurantId={selectedRestaurantId}
        />

        {isChatOpen && <AiChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
        <ChatButton onClick={() => setIsChatOpen(!isChatOpen)} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
