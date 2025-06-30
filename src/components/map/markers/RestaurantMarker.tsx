'use client';


import { Marker, Popup } from 'react-leaflet';
import { useRef, useEffect } from 'react';
import L from 'leaflet';
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
  Card,
} from '@mantine/core';
import { IconWorld, IconBrandInstagram, IconMap, IconClock } from '@tabler/icons-react';

interface RestaurantMarkerProps {
  restaurant: HappyHourVenue;
  isSelected: boolean;
  selectionSource: 'search' | 'marker' | null;
  onSelect: (restaurant: HappyHourVenue) => void;
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
  selectionSource,
  onSelect,
}) => {
  const theme = useMantineTheme();

  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isSelected && selectionSource === 'search' && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected, selectionSource]);

  const position: [number, number] = [restaurant.latitude, restaurant.longitude];

  if (!restaurant.latitude || !restaurant.longitude) {
    return null;
  }

  const happyHours = (restaurant.happyHours as HappyHour[]) ?? [];
  const rawHappyHours = formatHappyHours(happyHours);
  const happyHoursLines = rawHappyHours
    ? rawHappyHours.split('\n').filter((line) => line.trim() !== '')
    : [];

  const parsedHappyHours = happyHoursLines.map((line) => {
    const parts = line.split('•');
    if (parts.length < 2) return { days: line, times: '' };
    const days = parts[0]?.replace(/<\/?[^>]+(>|$)/g, '').trim() ?? '';
    const times = parts[1]?.replace(/<\/?[^>]+(>|$)/g, '').trim() ?? '';
    return { days, times };
  });

  return (
    <Marker
      position={position}
      icon={restaurantIcon}
      ref={markerRef}
      eventHandlers={{
        click: () => {
          onSelect(restaurant);
        },
      }}
    >
      {/* This popup is now self-contained. Leaflet handles opening it on click. */}
      {/* autoPanPadding fixes the "cut-off" issue. */}
      <Popup className="custom-mantine-popup" autoPanPadding={L.point(50, 50)}>
        <Card shadow="sm" padding="none" radius="md" withBorder>
          <Box
            py="xs"
            px="sm"
            ta="center"
            style={{ borderBottom: `1px solid ${theme.colors.dark[4]}` }}
          >
            <Title order={5} c="gray.0" lineClamp={2}>
              {restaurant.name}
            </Title>
          </Box>
          <Box py="xs" px="sm">
            <Stack gap="xs">
              <Box>
                <Group gap="xs" mb={4}>
                  <IconClock size={16} color={theme.colors.gray[0]} />
                  <Text fw={500} size="sm" c="gray.0">
                    Hours
                  </Text>
                </Group>
                {parsedHappyHours?.length > 0 &&
                parsedHappyHours[0]?.days !== 'No happy hours listed' ? (
                  <Paper
                    bg="dark.5"
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
                          <Text fw={500} c="gray.1" size="xs" style={{ flexShrink: 0 }}>
                            {hour.days}
                          </Text>
                          {hour.times && (
                            <Text c="blue.4" size="xs" fw={500} ta="right">
                              {hour.times}
                            </Text>
                          )}
                        </Flex>
                      ))}
                    </Stack>
                  </Paper>
                ) : (
                  <Text size="xs" c="gray.4" p="xs">
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
                    title="Directions"
                  >
                    <IconMap size="1.25rem" />
                  </ActionIcon>
                )}
              </Group>
            </Stack>
          </Box>
        </Card>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;
