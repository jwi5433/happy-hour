'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface UserLocationMarkerProps {
  position: [number, number];
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  return (
    <Marker position={position} icon={userLocationIcon}>
      <Popup className="dark-theme-popup">
        <div className="rounded bg-gray-800 px-3 py-2 text-center text-white">
          <strong>You are here</strong>
        </div>
      </Popup>
    </Marker>
  );
};

const userLocationIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default UserLocationMarker;
