'use client';

import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

interface LocationButtonProps {
  onLocationRequest: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ onLocationRequest }) => {
  const map = useMap();

  useEffect(() => {
    // Create a custom control
    const LocationControl = L.Control.extend({
      options: {
        position: 'topright',
      },

      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', 'location-button', container);

        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        `;
        button.title = 'Find my location';
        button.href = '#';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.width = '34px';
        button.style.height = '34px';
        button.style.backgroundColor = 'white';

        L.DomEvent.on(button, 'click', function (e) {
          L.DomEvent.preventDefault(e);
          onLocationRequest();
          map.locate({
            setView: true,
            maxZoom: 16,
          });
        });

        return container;
      },
    });

    // Add the control to the map
    const locationControl = new LocationControl();
    locationControl.addTo(map);

    // Cleanup function
    return () => {
      if (locationControl) {
        locationControl.remove();
      }
    };
  }, [map, onLocationRequest]);

  return null; // The component doesn't render anything directly
};

export default LocationButton;
