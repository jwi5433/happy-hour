'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface UserLocationMarkerProps {
  position: [number, number];
}

const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div class="marker-container" style="
      filter: drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3));
      transition: transform 0.3s ease, filter 0.3s ease;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--dark-bg-primary);
      border-radius: 12px;
      position: relative;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" style="color: #f87171;">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -35]
});

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  return (
    <Marker 
      position={position} 
      icon={userLocationIcon}
      eventHandlers={{
        mouseover: (e) => {
          const element = e.target.getElement();
          const container = element.querySelector('.marker-container');
          if (container) {
            container.style.transform = 'scale(1.05)';
            container.style.filter = 'drop-shadow(0 6px 10px rgba(93, 95, 239, 0.4))';
          }
        },
        mouseout: (e) => {
          const element = e.target.getElement();
          const container = element.querySelector('.marker-container');
          if (container) {
            container.style.transform = 'scale(1)';
            container.style.filter = 'drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3))';
          }
        }
      }}
    >
      <Popup className="dark-theme-popup">
        <div className="rounded p-3 text-center shadow-sm" 
          style={{ 
            backgroundColor: 'var(--dark-bg-primary)', 
            color: 'var(--dark-text-primary)'
          }}>
          <strong>You are here</strong>
        </div>
      </Popup>
    </Marker>
  );
};

export default UserLocationMarker;
