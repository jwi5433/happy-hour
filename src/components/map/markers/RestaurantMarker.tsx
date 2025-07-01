'use client';

import { Marker, Popup } from 'react-leaflet';
import { useRef, useEffect } from 'react';
import L from 'leaflet';
import { HappyHourVenue } from 'src/server/db/schema';
import DealsDisplay from './DealsDisplay';
import { HappyHour } from 'src/types/happy-hour';
import formatHappyHours from 'src/utils/formatters';
import { Text, Card, Group, Box, Stack, ActionIcon, useMantineTheme } from '@mantine/core';
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

  if (!restaurant.latitude || !restaurant.longitude) {
    return null; // Don't render if we don't have a location
  }

  const position: [number, number] = [restaurant.latitude, restaurant.longitude];

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
      <Popup className="custom-mantine-popup" autoPanPadding={L.point(50, 50)}>
        <Card shadow="sm" padding={0} radius="md" withBorder>
          {/* Title */}
          <Box
            px="sm"
            py={6}
            style={{
              borderBottom: `1px solid ${theme.colors.dark[4]}`,
            }}
          >
            <Text fw={600} size="lg" truncate>
              {restaurant.name}
            </Text>
          </Box>

          {/* Hours */}
          <Box mt="m" px="m">
            <Group gap={4} mb={2}>
              <IconClock size={18} />
              <Text size="s" fw={500}>
                Hours
              </Text>
            </Group>
            {parsedHappyHours?.length > 0 &&
            parsedHappyHours[0]?.days !== 'No happy hours listed' ? (
              <Stack gap={1}>
                {parsedHappyHours.map((hour, idx) => (
                  <Group key={idx} justify="space-between" wrap="nowrap">
                    <Text size="xs" c="blue.4" fw={500}>
                      {hour.days}
                    </Text>
                    {hour.times && (
                      <Text size="xs" fw={500}>
                        {hour.times}
                      </Text>
                    )}
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text size="xs" c="gray.5">
                No happy hours listed
              </Text>
            )}
          </Box>

          {/* Deals */}
          {Array.isArray(restaurant.deals) && restaurant.deals.length > 0 && (
            <Box mt="sm" px="sm">
              <DealsDisplay deals={restaurant.deals} />
            </Box>
          )}

          {/* Action Icons */}
          <Group justify="center" gap="lg" mt="lg" px="lg" pb="sm">
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
                <IconWorld size="1rem" />
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
                size="sm"
                title="Instagram"
              >
                <IconBrandInstagram size="1rem" />
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
                size="sm"
                title="Directions"
              >
                <IconMap size="1rem" />
              </ActionIcon>
            )}
          </Group>
        </Card>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;
