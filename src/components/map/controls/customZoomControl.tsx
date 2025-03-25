'use client';

import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { Plus, Minus } from 'react-feather';

interface CustomZoomControlProps {
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
}

const CustomZoomControl: React.FC<CustomZoomControlProps> = ({ position = 'topright' }) => {
  const map = useMap();

  useEffect(() => {
    const ZoomControl = L.Control.extend({
      options: {
        position: position,
      },

      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.margin = '10px 10px 0 0';
        container.style.backgroundColor = 'transparent';
        container.style.backdropFilter = 'none';
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.gap = '0';
        container.style.padding = '0';
        container.style.border = 'none';
        container.style.borderRadius = '8px';
        container.style.overflow = 'hidden';
        container.style.filter = 'drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3))';
        
        const zoomInButton = L.DomUtil.create('a', 'zoom-in', container);
        zoomInButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--dark-accent)"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        
        zoomInButton.title = 'Zoom in';
        zoomInButton.href = '#';
        zoomInButton.style.display = 'flex';
        zoomInButton.style.alignItems = 'center';
        zoomInButton.style.justifyContent = 'center';
        zoomInButton.style.width = '42px';
        zoomInButton.style.height = '42px';
        zoomInButton.style.backgroundColor = 'var(--dark-bg-primary)';
        zoomInButton.style.borderRadius = '8px 0 0 8px';
        zoomInButton.style.border = 'none';
        zoomInButton.style.boxShadow = 'none';
        zoomInButton.style.transition = 'background-color 0.3s ease';
        
        const zoomOutButton = L.DomUtil.create('a', 'zoom-out', container);
        zoomOutButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--dark-accent)"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        
        zoomOutButton.title = 'Zoom out';
        zoomOutButton.href = '#';
        zoomOutButton.style.display = 'flex';
        zoomOutButton.style.alignItems = 'center';
        zoomOutButton.style.justifyContent = 'center';
        zoomOutButton.style.width = '42px';
        zoomOutButton.style.height = '42px';
        zoomOutButton.style.backgroundColor = 'var(--dark-bg-primary)';
        zoomOutButton.style.borderRadius = '0 8px 8px 0';
        zoomOutButton.style.borderLeft = '1px solid var(--dark-border)';
        zoomOutButton.style.border = 'none';
        zoomOutButton.style.boxShadow = 'none';
        zoomOutButton.style.transition = 'background-color 0.3s ease';
        
        zoomInButton.addEventListener('mouseover', function() {
          this.style.backgroundColor = 'var(--dark-accent)';
          const svg = this.querySelector('svg');
          if (svg) svg.style.color = 'white';
        });
        
        zoomInButton.addEventListener('mouseout', function() {
          this.style.backgroundColor = 'var(--dark-bg-primary)';
          const svg = this.querySelector('svg');
          if (svg) svg.style.color = 'var(--dark-accent)';
        });
        
        zoomOutButton.addEventListener('mouseover', function() {
          this.style.backgroundColor = 'var(--dark-accent)';
          const svg = this.querySelector('svg');
          if (svg) svg.style.color = 'white';
        });
        
        zoomOutButton.addEventListener('mouseout', function() {
          this.style.backgroundColor = 'var(--dark-bg-primary)';
          const svg = this.querySelector('svg');
          if (svg) svg.style.color = 'var(--dark-accent)';
        });
        
        zoomInButton.addEventListener('click', function(e) {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          map.zoomIn();
        });
        
        zoomOutButton.addEventListener('click', function(e) {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          map.zoomOut();
        });
        
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        
        return container;
      },
    });

    const zoomControl = new ZoomControl();
    zoomControl.addTo(map);

    return () => {
      zoomControl.remove();
    };
  }, [map, position]);

  return null;
};

export default CustomZoomControl; 