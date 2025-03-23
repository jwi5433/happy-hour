'use client';

import { useMapEvents } from 'react-leaflet';

interface LocationTrackerProps {
  onLocationFound: (position: [number, number]) => void;
  onLocationError: (errorMessage: string) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ onLocationFound, onLocationError }) => {
  useMapEvents({
    locationfound(e) {
      const { lat, lng } = e.latlng;
      console.log('Map found location:', lat, lng);
      onLocationFound([lat, lng]);
    },
    locationerror(e) {
      console.log('Map location error:', e.message, e.code);
      const errorMessage =
        e.code === 1
          ? 'Permission denied. Please enable location access in your browser settings.'
          : 'Could not find your location. Please try again.';
      onLocationError(errorMessage);
    },
  });

  return null;
};

export default LocationTracker;
