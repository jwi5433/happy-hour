import { db } from 'src/server/db';
import { happyHourVenues } from 'src/server/db/schema';
import Map from '../components/Map';

export default async function HomePage() {
  const restaurants = await db.select().from(happyHourVenues);

  return (
    <main className="h-screen w-screen overflow-hidden">
      <Map restaurants={restaurants} className="h-full w-full" />
    </main>
  );
}
