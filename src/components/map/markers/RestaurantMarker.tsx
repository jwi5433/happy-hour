'use client';

import { useRef, useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Icon } from 'leaflet'; 
import { HappyHourVenue } from 'src/server/db/schema';
import DealsDisplay from './DealsDisplay';
import { HappyHour } from 'src/types/happy-hour';
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
  onSelect: (restaurantId: string) => void;
  selectionSource: 'search' | 'marker' | null;
}

const restaurantIconOptions = {
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41] as L.PointExpression,
  iconAnchor: [12, 41] as L.PointExpression,
  popupAnchor: [1, -34] as L.PointExpression,
  shadowSize: [41, 41] as L.PointExpression,
};
const restaurantIcon = new L.Icon(restaurantIconOptions);

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({
  restaurant,
  isSelected,
  onSelect,
  selectionSource,
}) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  const theme = useMantineTheme();
  const popupOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!restaurant.latitude || !restaurant.longitude) {
    return null;
  }
  const position: [number, number] = [restaurant.latitude, restaurant.longitude];
  const markerLatLng = L.latLng(position);

  const handleMarkerClick = () => {
    if (!map) return;
    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, 15);
    const desiredTopPaddingPixels = 150;
    const zoomDiff = Math.abs(targetZoom - currentZoom);
    const flyDuration = Math.max(0.5, Math.min(1.2, 1.2 - zoomDiff * 0.1));
    const markerPoint = map.latLngToContainerPoint(markerLatLng);
    const targetCenterPoint = L.point(markerPoint.x, markerPoint.y - desiredTopPaddingPixels);
    const targetLatLng = map.containerPointToLatLng(targetCenterPoint);

    map.flyTo(targetLatLng, targetZoom, { animate: true, duration: flyDuration });
    onSelect(restaurant.id);
  };

  useEffect(() => {
    if (popupOpenTimeoutRef.current) {
      clearTimeout(popupOpenTimeoutRef.current);
    }

    if (isSelected && markerRef.current) {
      let openDelay: number;

      if (selectionSource === 'search') {
        openDelay = 100; 
      } else {
        const flyDuration = 1.2;
      }

      popupOpenTimeoutRef.current = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      });

      return () => {
        if (popupOpenTimeoutRef.current) {
          clearTimeout(popupOpenTimeoutRef.current);
        }
      };
    }
  }, [isSelected, selectionSource]);

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
    return { days, times };
  });

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={restaurantIcon} 
      eventHandlers={{ click: handleMarkerClick }}
    >
      <Popup className="custom-mantine-popup" autoPan={false} closeOnClick={true}>
        <Paper
          p={0}
          radius="md"
          bg={theme.colors.dark[6]}
          withBorder={false}
          style={{
            overflow: 'hidden',
          }}
        >
          <Box
            py="xs"
            px="sm"
            ta="center"
            style={{ borderBottom: `1px solid ${theme.colors.dark[4]}` }}
          >
            <Title order={5} c={theme.colors.gray[0]} lineClamp={2}>
              {restaurant.name}
            </Title>
          </Box>
          <Box py="xs" px="sm">
            <Stack gap="xs">
              <Box>
                <Group gap={6} mb={4} wrap="nowrap">
                  <IconClock size={16} color={theme.colors.gray[0]} style={{ flexShrink: 0 }} />
                  <Text fw={500} size="sm" c={theme.colors.gray[0]}>
                    Hours
                  </Text>
                </Group>
                {parsedHappyHours?.length > 0 &&
                parsedHappyHours[0]?.days !== 'No happy hours listed' ? (
                  <Paper
                    bg={theme.colors.dark[5]}
                    p="xs"
                    radius="sm"
                    withBorder={false}
                    style={{
                      maxHeight: '90px',
                      overflowY: 'auto',
                      border: `1px solid ${theme.colors.dark[4]}`,
                    }}
                  >
                    <Stack gap={4}>
                      {parsedHappyHours.map((hour, index) => (
                        <Flex key={index} justify="space-between" align="flex-start" gap="xs">
                          <Text
                            fw={500}
                            c={theme.colors.gray[1]}
                            size="xs"
                            style={{ flexShrink: 0 }}
                          >
                            {hour.days}
                          </Text>
                          {hour.times && (
                            <Text c={theme.colors.blue[4]} size="xs" fw={500} ta="right">
                              {hour.times}
                            </Text>
                          )}
                        </Flex>
                      ))}
                    </Stack>
                  </Paper>
                ) : (
                  <Text size="xs" c={theme.colors.gray[4]} p="xs">
                    No happy hours listed
                  </Text>
                )}
              </Box>
              {Array.isArray(restaurant.deals) && restaurant.deals.length > 0 && (
                <DealsDisplay deals={restaurant.deals} />
              )}
              <Group justify="center" gap="sm" mt="xs">
                {restaurant.websiteUrl && (
                  <ActionIcon
                    component="a"
                    href={restaurant.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    color="blue"
                    radius="xl"
                    size="lg"
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
                    <IconWorld size="1.25rem" />
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
                    size="lg"
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
                    <IconBrandInstagram size="1.25rem" />
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
                    size="lg"
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
                    <IconMap size="1.25rem" />
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
