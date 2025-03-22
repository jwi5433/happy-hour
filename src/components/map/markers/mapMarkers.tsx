'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { happyHourVenues, HappyHourVenue } from 'src/server/db/schema';
import { HappyHour, Deal } from 'src/types/happy-hour';
import { useState } from 'react';

interface UserLocationMarkerProps {
  position: [number, number];
}

interface RestaurantMarkersProps {
  restaurants: HappyHourVenue[];
}

const userLocationIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const restaurantIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DealsDisplay = ({ deals }: { deals: Deal[] | null }) => {
  const [activeTab, setActiveTab] = useState<'drinks' | 'food'>('drinks');

  if (!deals || deals.length === 0) {
    return <p className="text-sm text-gray-400">No deals listed</p>;
  }

  const validDeals = deals.filter((deal) => {
    if (!deal.name || !deal.price) return false;
    
    if (typeof deal.price === 'string') {
      const percentMatch = deal.price.match(/(\d+)%/);
      if (percentMatch && percentMatch[1]) {
        const percentValue = parseInt(percentMatch[1], 10);
        
        if (percentValue > 80) {
          return false;
        }
      }
      
      if (
        deal.price.toLowerCase().includes('free') || 
        deal.price.toLowerCase().includes('100% off')
      ) {
        return false;
      }
    }
    
    return true;
  });

  if (validDeals.length === 0) {
    return <p className="text-sm text-gray-400">No valid deals available</p>;
  }

  const uniqueDeals = validDeals.filter(
    (deal, index, self) =>
      index ===
      self.findIndex(
        (d) => 
          d.category === deal.category && 
          d.name === deal.name && 
          d.price === deal.price
      )
  );

  const drinkDeals = uniqueDeals.filter((deal) => deal.category !== 'Food');
  const foodDeals = uniqueDeals.filter((deal) => deal.category === 'Food');

  return (
    <div className="mt-2">
      <div className="flex border-b border-gray-600 mb-2">
        <button
          className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 rounded-t-md ${
            activeTab === 'drinks'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('drinks')}
        >
          Drinks ({drinkDeals.length})
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 rounded-t-md ml-1 ${
            activeTab === 'food'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('food')}
        >
          Food ({foodDeals.length})
        </button>
      </div>
      {activeTab === 'drinks' && drinkDeals.length > 0 && (
        <div className="rounded bg-gray-700 p-2 shadow-md">
          <div className="max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
            <ul className="space-y-1">
              {drinkDeals.map((deal, index) => (
                <li key={index} className="flex items-center justify-between py-1 border-b border-gray-600 last:border-b-0">
                  <span className="text-sm text-gray-300">{deal.name}</span>
                  <span className="rounded bg-gray-600 px-1.5 py-0.5 text-xs font-medium text-gray-200 whitespace-nowrap ml-2">
                    {deal.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'food' && foodDeals.length > 0 && (
        <div className="rounded bg-gray-700 p-2 shadow-md">
          <div className="max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
            <ul className="space-y-1">
              {foodDeals.map((deal, index) => (
                <li key={index} className="flex items-center justify-between py-1 border-b border-gray-600 last:border-b-0">
                  <span className="text-sm text-gray-300">{deal.name}</span>
                  <span className="rounded bg-gray-600 px-1.5 py-0.5 text-xs font-medium text-gray-200 whitespace-nowrap ml-2">
                    {deal.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'drinks' && drinkDeals.length === 0 && (
        <p className="text-sm text-gray-400">No drink deals available</p>
      )}

      {activeTab === 'food' && foodDeals.length === 0 && (
        <p className="text-sm text-gray-400">No food deals available</p>
      )}
    </div>
  );
};

const formatHappyHours = (happyHours: HappyHour[] | null): string => {
  if (!happyHours || happyHours.length === 0) return 'No happy hours listed';

  const dayOrder: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  const timeGroups: Record<string, string[]> = {};

  happyHours.forEach((hour) => {
    if (!hour.day || !hour.start_time || !hour.end_time) return;

    const timeKey = `${hour.start_time}-${hour.end_time}`;
    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = [];
    }
    if (hour.day) {
      timeGroups[timeKey].push(hour.day);
    }
  });

  const formattedGroups = Object.entries(timeGroups).map(([timeSlot, days]) => {
    days.sort((a, b) => {
      const aOrder = typeof a === 'string' ? (dayOrder[a] ?? 0) : 0;
      const bOrder = typeof b === 'string' ? (dayOrder[b] ?? 0) : 0;
      return aOrder - bOrder;
    });

    const ranges: string[] = [];

    if (days.length === 1) {
      const day = days[0];
      if (day) {
        ranges.push(day);
      }
    } else {
      let rangeStart: string | undefined = days[0];
      let prev: string | undefined = days[0];

      for (let i = 1; i < days.length; i++) {
        const current: string | undefined = days[i];
        
        if (!prev || !current) continue;

        const prevDayOrder: number = typeof prev === 'string' ? (dayOrder[prev] ?? 0) : 0;
        const currentDayOrder: number = typeof current === 'string' ? (dayOrder[current] ?? 0) : 0;

        if (currentDayOrder - prevDayOrder === 1) {
          prev = current;

          if (i === days.length - 1) {
            if (rangeStart && prev) {
              ranges.push(rangeStart === prev ? rangeStart : `${rangeStart}-${prev}`);
            }
          }
        } else {
          if (rangeStart && prev) {
            ranges.push(rangeStart === prev ? rangeStart : `${rangeStart}-${prev}`);
          }

          rangeStart = current;
          prev = current;

          if (i === days.length - 1) {
            if (current) {
              ranges.push(current);
            }
          }
        }
      }
    }

    return `${ranges.join(', ')}: ${timeSlot}`;
  });

  return formattedGroups.join('; ');
};

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  return (
    <Marker position={position} icon={userLocationIcon}>
      <Popup className="dark-theme-popup">
        <div className="rounded bg-gray-800 px-3 py-2 text-center text-white">
          <strong>You are here</strong>
        </div>
      </Popup>
    </Marker>
  );
};

export const RestaurantMarkers: React.FC<RestaurantMarkersProps> = ({ restaurants }) => {
  return (
    <>
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[Number(restaurant.latitude), Number(restaurant.longitude)]}
          icon={restaurantIcon}
        >
          <Popup className="dark-theme-popup">
            <div className="max-w-xs overflow-hidden rounded-lg bg-gray-800 text-gray-200 shadow-lg">
              <div className="bg-gray-900 p-3">
                <h3 className="text-lg font-bold text-white">{restaurant.name}</h3>
                {restaurant.address && (
                  <p className="mb-2 text-sm text-gray-400">{restaurant.address}</p>
                )}
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-300">Happy Hour:</h4>
                  <div className="scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 max-h-24 overflow-y-auto pr-1">
                    {formatHappyHours(restaurant.happyHours as unknown as HappyHour[]) ===
                    'No happy hours listed' ? (
                      <p className="text-sm text-gray-400">No happy hours listed</p>
                    ) : (
                      <div className="space-y-1 text-sm text-gray-300">
                        {formatHappyHours(restaurant.happyHours as unknown as HappyHour[])
                          .split(';')
                          .map((timeBlock, index) => (
                            <p key={index} className="rounded bg-gray-800 px-1 py-1">
                              {timeBlock.trim()}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-300">Deals:</h4>
                  <DealsDisplay deals={restaurant.deals as unknown as Deal[]} />
                </div>
              </div>

              {(restaurant.websiteUrl ||
                restaurant.instagramUrl ||
                restaurant.yelpUrl ||
                restaurant.googlemapsUrl) && (
                <div className="bg-gray-750 border-t border-gray-700 px-1 py-2">
                  <div className="flex items-center justify-center space-x-5">
                    {restaurant.websiteUrl && (
                      <a
                        href={restaurant.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-400 hover:text-blue-300"
                        title="Website"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </a>
                    )}
                    {restaurant.instagramUrl && (
                      <a
                        href={restaurant.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-400 hover:text-blue-300"
                        title="Instagram"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth={2} />
                          <circle cx="12" cy="12" r="4" strokeWidth={2} />
                          <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                        </svg>
                      </a>
                    )}
                    {restaurant.googlemapsUrl && (
                      <a
                        href={restaurant.googlemapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-400 hover:text-blue-300"
                        title="Directions"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </a>
                    )}
                    {restaurant.yelpUrl && (
                      <a
                        href={restaurant.yelpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-400 hover:text-blue-300"
                        title="Yelp"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};
