'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { happyHourVenues } from 'src/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';

const MapComponent = dynamic(
  () => import('./MapComponent'), 
  { ssr: false } 
);

type Restaurant = InferSelectModel<typeof happyHourVenues>;

interface MapProps {
  className?: string;
  restaurants: Restaurant[];
  loading?: boolean;
}

export default function HappyHourMap({
  className = '',
  restaurants = [],
  loading = false,
}: MapProps) {

  if (loading) {
    return <div className="flex h-96 items-center justify-center">Loading map...</div>;
  }

  return <MapComponent className={className} restaurants={restaurants} />;
}

  