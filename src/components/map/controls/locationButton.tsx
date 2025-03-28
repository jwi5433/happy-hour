'use client';

import { useMap } from 'react-leaflet';
import { ActionIcon, useMantineTheme } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';

interface LocationButtonProps {
  onLocationRequest: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ onLocationRequest }) => {
  const map = useMap();
  const theme = useMantineTheme();

  const handleLocationClick = () => {
    console.log('Location button clicked');
    onLocationRequest();

    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
    });
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
      <div className="leaflet-control">
        <ActionIcon
          onClick={handleLocationClick}
          variant="outline"
          color="blue"
          radius="xl"
          size={55}
          bg={theme.colors.dark[6]}
          style={{
            border: `1px solid ${theme.colors.dark[4]}`,
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.blue[7];
            e.currentTarget.style.color = theme.white;
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = theme.shadows.sm;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.dark[6];
            e.currentTarget.style.color = theme.colors.blue[5];
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <IconMapPin size={26} />
        </ActionIcon>
      </div>
    </div>
  );
};

export default LocationButton;
