'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HappyHourVenue } from 'src/server/db/schema';
import LocationButton from './map/controls/locationButton';
import LocationTracker from './map/tracking/locationTracker';
import SearchControl from './map/controls/searchControls';
import { UserLocationMarker, RestaurantMarkers } from './map/markers';
import AiChat from './AiChat';
import ChatButton from './map/controls/chatButton';

import L, { Map } from 'leaflet';
import { Notification } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

interface SelectionRequest {
  restaurant: HappyHourVenue;
  marker?: L.Marker;
}

const MapComponent = ({
  className = '',
  restaurants = [],
  loading = false,
}: {
  className?: string;
  restaurants: HappyHourVenue[];
  loading?: boolean;
}) => {
  const mapRef = useRef<Map | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectionRequest, setSelectionRequest] = useState<SelectionRequest | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectionRequest?.restaurant) return;

    const { restaurant } = selectionRequest;
    if (!restaurant.latitude || !restaurant.longitude) return;

    const latLng = L.latLng(restaurant.latitude, restaurant.longitude);
    const zoom = Math.max(map.getZoom(), 16);

    // --- The Definitive Centering Logic ---
    // 1. Get the pixel coordinates of the target marker
    const targetPoint = map.project(latLng, zoom);

    // 2. Define the vertical offset (half the popup's height) to move the center up
    const popupHeight = 350; // Approximate height of your popup
    const yOffset = popupHeight / 2;
    const adjustedPoint = targetPoint.subtract([0, yOffset]);

    // 3. Convert the adjusted pixel coordinate back to a geographic coordinate
    const targetLatLng = map.unproject(adjustedPoint, zoom);

    const onMoveEnd = () => {
      map.off('moveend', onMoveEnd);
      // Find the correct marker on the map and open its popup
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.getLatLng().equals(latLng)) {
          layer.openPopup();
        }
      });
    };

    map.on('moveend', onMoveEnd);
    map.flyTo(targetLatLng, zoom, { duration: 1.0 });
  }, [selectionRequest]);

  const handleRestaurantSelect = useCallback((restaurant: HappyHourVenue, marker?: L.Marker) => {
    setSelectionRequest({ restaurant, marker });
  }, []);

  useEffect(() => {
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
    const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.options.icon = iconDefault;
  }, []);

  return (
    <div className={className} style={{ height: '100%', width: '100%', position: 'relative' }}>
      {locationError && (
        <Notification
          icon={<IconX size="1.1rem" />}
          color="red"
          withCloseButton
          onClose={() => setLocationError(null)}
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 1001 }}
        >
          {locationError}
        </Notification>
      )}

      <MapContainer
        center={[30.2672, -97.7431]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="h-full w-full"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        
        <LocationButton onLocationRequest={() => setLocationError(null)} />
        <SearchControl
          restaurants={restaurants}
          onRestaurantSelect={(restaurant) => handleRestaurantSelect(restaurant)}
        />
        <LocationTracker onLocationFound={setUserPosition} onLocationError={setLocationError} />

        {userPosition && <UserLocationMarker position={userPosition} />}

        <RestaurantMarkers
          restaurants={restaurants}
          onMarkerSelect={handleRestaurantSelect}
          selectedRestaurantId={selectionRequest?.restaurant.id ?? null}
          selectionSource={selectionRequest ? 'map' : null}
        />

        {isChatOpen && <AiChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
        <ChatButton onClick={() => setIsChatOpen(!isChatOpen)} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
