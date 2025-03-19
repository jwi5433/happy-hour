'use client';

import { useMap, useMapEvents } from 'react-leaflet';

interface LocationTrackerProps {
  onLocationFound: (positon: [number, number]) => void;
  onLocationError: (errorMessage: string) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  onLocationFound,
  onLocationError
}) => {
  const map = useMap();
  useMapEvents({
    locationfound(e) {
      const { lat, lng } = e.latlng;

      onLocationFound([lat, lng]);

      map.flyTo(e.latlng, Math.max(map.getZoom(), 16));
    },

    locationerror(e) {
      const errorMessage =
        e.code === 1
          ? 'Permission denied. Please enable location access in your browser settings.'
          : 'Could not find your location. Please try again.';
      onLocationError(errorMessage);
    }
  });
  return null;
};

export default LocationTracker;