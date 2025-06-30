'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMantineTheme, Text, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';

interface UserLocationMarkerProps {
  position: [number, number];
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  const theme = useMantineTheme();
  const [icon, setIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    const userLocationIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="marker-container" style="
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          transition: transform 0.3s ease, filter 0.3s ease;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${theme.colors.dark[6]};
          border: 1px solid ${theme.colors.dark[4]};
          border-radius: 100%;
          position: relative;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: ${theme.colors.blue[5]}">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
          </svg>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -35],
    });

    setIcon(userLocationIcon);
  }, [theme]);

  if (!icon) return null;

  const handleMouseOver = (e: L.LeafletMouseEvent) => {
    const markerElement = (e.target as L.Marker).getElement();
    if (markerElement) {
      const container = markerElement.querySelector('.marker-container') as HTMLElement | null;
      if (container) {
        container.style.transform = 'scale(1.05)';
        container.style.filter = 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.3))';
        container.style.backgroundColor = theme.colors.blue[7];

        const svg = container.querySelector('svg') as SVGElement | null;
        if (svg) svg.style.color = theme.white;
      }
    }
  };

  const handleMouseOut = (e: L.LeafletMouseEvent) => {
    const markerElement = (e.target as L.Marker).getElement();
    if (markerElement) {
      const container = markerElement.querySelector('.marker-container') as HTMLElement | null;
      if (container) {
        container.style.transform = 'scale(1)';
        container.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))';
        container.style.backgroundColor = theme.colors.dark[6];

        const svg = container.querySelector('svg') as SVGElement | null;
        if (svg) svg.style.color = theme.colors.blue[5];
      }
    }
  };

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
      }}
    >
      <Popup className="dark-theme-popup">
        <Paper
          p="xs"
          radius="md"
          bg={theme.colors.dark[6]}
          withBorder={false}
          style={{
            border: `1px solid ${theme.colors.dark[4]}`,
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          <Text fw={500} c={theme.colors.gray[0]}>
            You are here
          </Text>
        </Paper>
      </Popup>
    </Marker>
  );
};

export default UserLocationMarker;
