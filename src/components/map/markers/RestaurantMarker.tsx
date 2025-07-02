'use client';

import { Marker, Popup } from 'react-leaflet';
import { useRef, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { HappyHourVenue } from 'src/server/db/schema';
import DealsDisplay from './DealsDisplay';
import { HappyHour } from 'src/types/happy-hour';
import formatHappyHours from 'src/utils/formatters';
import { Text, Card, Group, Box, Stack, ActionIcon, Divider, ScrollArea } from '@mantine/core';
import { IconWorld, IconBrandInstagram, IconMap, IconClock } from '@tabler/icons-react';

interface RestaurantMarkerProps {
  restaurant: HappyHourVenue;
  isSelected: boolean;
  selectionSource: 'search' | 'marker' | null;
  onSelect: (restaurant: HappyHourVenue) => void;
}

// ✅ Corrected anchor to perfectly center the popup
const restaurantIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowSize: [41, 41],
});

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({
  restaurant,
  isSelected,
  selectionSource,
  onSelect,
}) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isSelected && selectionSource === 'search' && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected, selectionSource]);

  const parsedHappyHours = useMemo(() => {
    const happyHours = (restaurant.happyHours as HappyHour[]) ?? [];
    const rawHappyHours = formatHappyHours(happyHours);
    if (!rawHappyHours) return [];

    return rawHappyHours
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const parts = line.split('•');
        const days = parts[0]?.trim() ?? '';
        const times = parts[1]?.trim() ?? '';
        return { days, times };
      });
  }, [restaurant.happyHours]);

  const actionLinks = [
    { href: restaurant.websiteUrl, title: 'Website', Icon: IconWorld },
    { href: restaurant.instagramUrl, title: 'Instagram', Icon: IconBrandInstagram },
    { href: restaurant.googlemapsUrl, title: 'Directions', Icon: IconMap },
  ].filter((link) => link.href);

  if (!restaurant.latitude || !restaurant.longitude) {
    return null;
  }
  const position: [number, number] = [restaurant.latitude, restaurant.longitude];

  return (
    <Marker
      position={position}
      icon={restaurantIcon}
      ref={markerRef}
      eventHandlers={{ click: () => onSelect(restaurant) }}
    >
      <Popup className="custom-mantine-popup" autoPanPadding={L.point(50, 50)}>
        <Card
          shadow="xl"
          padding="sm"
          radius="xl"
          style={{
            width: '320px',
            maxHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card.Section withBorder inheritPadding>
            <Text fw={600} size="md" ta="center" truncate>
              {restaurant.name}
            </Text>
          </Card.Section>

          <Box
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            <Stack gap={0} mt="xs" mb="xs">
              <Group gap="xs" mb={2}>
                <IconClock size={16} color="teal" />
                <Text size="xs" fw={500}>
                  Happy Hour
                </Text>
              </Group>
              <ScrollArea h={150} type="auto" scrollbarSize={6} scrollHideDelay={0}>
                <Stack gap={0}>
                  {parsedHappyHours.length > 0 &&
                  parsedHappyHours[0]?.days !== 'No happy hours listed' ? (
                    parsedHappyHours.map((hour, idx) => (
                      <Group key={idx} justify="space-between" wrap="nowrap" gap={0}>
                        <Text c="dimmed" style={{ fontSize: '11px' }}>
                          {hour.days}
                        </Text>
                        <Text fw={500} style={{ fontSize: '11px' }}>
                          {hour.times}
                        </Text>
                      </Group>
                    ))
                  ) : (
                    <Text size="xs" c="dimmed">
                      No happy hours listed
                    </Text>
                  )}
                </Stack>
              </ScrollArea>
            </Stack>

            {Array.isArray(restaurant.deals) && restaurant.deals.length > 0 && (
              <Box style={{ flex: 1, minHeight: 0 }}>
                <ScrollArea h={150} type="auto" scrollbarSize={6} scrollHideDelay={0}>
                  <DealsDisplay deals={restaurant.deals} />
                </ScrollArea>
              </Box>
            )}
          </Box>

          {actionLinks.length > 0 && (
            <Card.Section withBorder inheritPadding py={4}>
              <Group justify="space-around" gap={0}>
                {actionLinks.map(({ href, title, Icon }) => (
                  <ActionIcon
                    key={title}
                    component="a"
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    radius="xl"
                    size="md"
                    title={title}
                  >
                    <Icon size="1.4rem" />
                  </ActionIcon>
                ))}
              </Group>
            </Card.Section>
          )}
        </Card>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;
