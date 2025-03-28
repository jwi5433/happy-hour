import { db } from 'src/server/db';
import { happyHourVenues } from 'src/server/db/schema';
import Map from '../components/Map';
import { Box } from '@mantine/core';

export default async function HomePage() {
  const restaurants = await db.select().from(happyHourVenues);

  return (
    <Box component="main" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Map restaurants={restaurants} className="h-full w-full" />
    </Box>
  );
}
