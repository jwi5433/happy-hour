'use client';

import dynamic from 'next/dynamic';
import { happyHourVenues } from 'src/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { Box } from '@mantine/core';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => null,
});

interface MapProps {
  className?: string;
  restaurants: Restaurant[];
  loading?: boolean;
  initialUserPosition?: [number, number] | null;
}

export default function Map({
  className = '',
  restaurants = [],
  loading = false,
  initialUserPosition = null,
}: MapProps) {
  return (
    <Box className={className} style={{ height: '100%', width: '100%' }}>
      <MapComponent className="h-full w-full" restaurants={restaurants} loading={loading} />
    </Box>
  );
}
