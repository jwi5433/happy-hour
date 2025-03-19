'use client';

import { useMap } from 'react-leaflet';

interface LocationButtonProps {
  onLocationRequest: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ onLocationRequest }) => {
  const map = useMap();

  const handleLocateClick = () => {
    onLocationRequest();

    map.locate({
      setView: true,
      maxZoom: 16
    });
  };
  return (
  <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}>
    <div className="leaflet-control leaflet-bar">
      <button 
        onClick={handleLocateClick}
        className="bg-white p-2 rounded shadow hover:bg-gray-100"
        title="Find my location"
        aria-label="Find my location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
);
};

export default LocationButton;

