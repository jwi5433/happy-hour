'use client';

import { useRef, useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Icon } from 'leaflet';
import { HappyHourVenue } from 'src/server/db/schema';
import DealsDisplay from './DealsDisplay';
import { HappyHour, Deal } from 'src/types/happy-hour';
import formatHappyHours from 'src/utils/formatters';
import {
  Text,
  Paper,
  Group,
  Title,
  Stack,
  ActionIcon,
  Box,
  useMantineTheme,
  Flex,
} from '@mantine/core';
import { IconWorld, IconBrandInstagram, IconMap, IconClock } from '@tabler/icons-react';

interface RestaurantMarkerProps {
  restaurant: HappyHourVenue;
  isSelected?: boolean;
}

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({ restaurant, isSelected }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  const theme = useMantineTheme();

  if (!restaurant.latitude || !restaurant.longitude) {
    return null;
  }

  const position: [number, number] = [restaurant.latitude, restaurant.longitude];

  const handleMarkerClick = () => {
    map.closePopup();

    const targetLatLng = L.latLng(position[0] + 0.0035, position[1]);

    map.setView(targetLatLng, 15, {
      animate: true,
      duration: 1,
      easeLinearity: 0.25,
    });

    setTimeout(() => {
      markerRef.current?.openPopup();
    }, 1000);
  };

  useEffect(() => {
    if (isSelected && restaurant.latitude && restaurant.longitude) {
      handleMarkerClick();
    }
  }, [isSelected]);

  const restaurantIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const happyHours = (restaurant.happyHours as HappyHour[]) || [];
  const rawHappyHours = formatHappyHours ? formatHappyHours(happyHours) : '';
  const happyHoursLines = rawHappyHours
    ? rawHappyHours.split('\n').filter((line) => line.trim() !== '')
    : [];

  const parsedHappyHours = happyHoursLines.map((line) => {
    const parts = line.split('•');
    if (parts.length < 2) return { days: line, times: '' };

    const days = parts[0]?.replace(/<\/?[^>]+(>|$)/g, '').trim() || '';
    const times = parts[1]?.replace(/<\/?[^>]+(>|$)/g, '').trim() || '';
    
    return {
      days,
      times,
    };
  });

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={restaurantIcon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup className="dark-theme-popup" minWidth={500} maxWidth={550} pane="popupPane">
        <Paper
          p={0}
          w="100%"
          radius="md"
          bg={theme.colors.dark[6]}
          withBorder={false}
          style={{
            overflow: 'hidden',
            boxShadow: 'none',
            border: 'none'
          }}
        >
          <Box
            py="xs"
            px="md"
            ta="center"
            style={{ borderBottom: `1px solid ${theme.colors.dark[4]}` }}
          >
            <Title order={4} c={theme.colors.gray[0]}>
              {restaurant.name}
            </Title>
          </Box>

          <Box py="xs" px="sm">
            <Stack gap={2}>
              <Box
                py={4}
                px={8}
                style={{
                  borderRadius: theme.radius.sm,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <IconClock size={16} color={theme.colors.gray[0]} style={{ marginRight: 6 }} />
                <Text fw={500} size="14px" c={theme.colors.gray[0]}>
                  Hours
                </Text>
              </Box>

              {parsedHappyHours?.length > 0 && parsedHappyHours[0]?.days !== 'No happy hours listed' ? (
                <Paper bg={theme.colors.dark[5]} p="xs" mb={2} withBorder={false} style={{ border: 'none' }}>
                  <Stack gap={4} w="100%">
                    {parsedHappyHours.map((hour, index) => (
                      <Flex key={index} align="center" justify="space-between" w="100%">
                        <Text fw={500} c={theme.colors.gray[1]} size="xs" style={{ marginRight: 'auto' }}>
                          {hour.days}
                        </Text>
                        {hour.times && (
                          <Text c={theme.colors.blue[4]} size="xs" fw={500} style={{ textAlign: 'right', minWidth: '120px' }}>
                            {hour.times}
                          </Text>
                        )}
                      </Flex>
                    ))}
                  </Stack>
                </Paper>
              ) : (
                <Text size="sm" c={theme.colors.gray[4]} p="xs">
                  No happy hours listed
                </Text>
              )}

              {Array.isArray(restaurant.deals) && restaurant.deals.length > 0 && (
                <DealsDisplay deals={restaurant.deals} />
              )}

              <Group justify="center" gap="xs" mt={2}>
                {restaurant.websiteUrl && (
                  <ActionIcon
                    component="a"
                    href={restaurant.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    color="blue"
                    radius="xl"
                    size={44}
                    bg={theme.colors.dark[5]}
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
                      e.currentTarget.style.backgroundColor = theme.colors.dark[5];
                      e.currentTarget.style.color = theme.colors.blue[5];
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="Website"
                  >
                    <IconWorld size={24} />
                  </ActionIcon>
                )}

                {restaurant.instagramUrl && (
                  <ActionIcon
                    component="a"
                    href={restaurant.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    color="blue"
                    radius="xl"
                    size={44}
                    bg={theme.colors.dark[5]}
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
                      e.currentTarget.style.backgroundColor = theme.colors.dark[5];
                      e.currentTarget.style.color = theme.colors.blue[5];
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="Instagram"
                  >
                    <IconBrandInstagram size={24} />
                  </ActionIcon>
                )}

                {restaurant.googlemapsUrl && (
                  <ActionIcon
                    component="a"
                    href={restaurant.googlemapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    color="blue"
                    radius="xl"
                    size={44}
                    bg={theme.colors.dark[5]}
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
                      e.currentTarget.style.backgroundColor = theme.colors.dark[5];
                      e.currentTarget.style.color = theme.colors.blue[5];
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="Directions"
                  >
                    <IconMap size={24} />
                  </ActionIcon>
                )}
              </Group>
            </Stack>
          </Box>
        </Paper>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;
