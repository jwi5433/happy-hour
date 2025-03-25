'use client';

import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { MapPin } from 'react-feather';

interface LocationButtonProps {
  onLocationRequest: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ onLocationRequest }) => {
  const map = useMap();

  useEffect(() => {
    const LocationControl = L.Control.extend({
      options: {
        position: 'topright',
      },

      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.margin = '5px 10px 0 0';
        container.style.backgroundColor = 'transparent';
        container.style.backdropFilter = 'none';
        container.style.filter = 'drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3))';
        container.style.transition = 'transform 0.3s ease, filter 0.3s ease';
        container.style.borderRadius = '16px';
        container.style.padding = '0';
        
        const button = L.DomUtil.create('a', 'location-button', container);

        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--dark-accent)"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        `;
        button.title = 'Find my location';
        button.href = '#';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.width = '50px';
        button.style.height = '50px';
        button.style.backgroundColor = 'var(--dark-bg-primary)';
        button.style.borderRadius = '12px';
        
        button.addEventListener('mouseover', function() {
          button.style.transform = 'scale(1.05)';
          button.style.backgroundColor = 'var(--dark-accent)';
          const svg = button.querySelector('svg');
          if (svg) svg.style.color = 'white';
          container.style.filter = 'drop-shadow(0 6px 10px rgba(93, 95, 239, 0.4))';
        });
        
        button.addEventListener('mouseout', function() {
          button.style.transform = 'scale(1)';
          button.style.backgroundColor = 'var(--dark-bg-primary)';
          const svg = button.querySelector('svg');
          if (svg) svg.style.color = 'var(--dark-accent)';
          container.style.filter = 'drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3))';
        });

        L.DomEvent.on(button, 'click', function (e) {
          L.DomEvent.preventDefault(e);
          onLocationRequest();

          map.locate({
            setView: true,
            maxZoom: 16,
            enableHighAccuracy: true,
          });
        });

        return container;
      },
    });

    const locationControl = new LocationControl();
    locationControl.addTo(map);

    return () => {
      if (locationControl) {
        locationControl.remove();
      }
    };
  }, [map, onLocationRequest]);

  return null;
};

export default LocationButton;
