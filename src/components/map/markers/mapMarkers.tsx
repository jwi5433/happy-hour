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

// Tabs component for showing deals
// Improved DealsDisplay component with better filtering and styling
const DealsDisplay = ({ deals }: { deals: Deal[] | null }) => {
  const [activeTab, setActiveTab] = useState<'drinks' | 'food'>('drinks');

  if (!deals || deals.length === 0) {
    return <p className="text-sm text-gray-400">No deals listed</p>;
  }

  // Enhanced filter to catch more edge cases with unrealistic deals
  const validDeals = deals.filter((deal) => {
    // Skip deals with empty or null properties
    if (!deal.name || !deal.price) return false;
    
    // Check for percentage deals
    if (typeof deal.price === 'string') {
      // Match both formats: "50% off" and "50%"
      const percentMatch = deal.price.match(/(\d+)%/);
      if (percentMatch && percentMatch[1]) {
        const percentValue = parseInt(percentMatch[1], 10);
        
        // Filter out unrealistic percentage discounts (over 80%)
        // You could adjust this threshold as needed
        if (percentValue > 80) {
          return false;
        }
      }
      
      // Also filter out any "FREE" or "100% off" deals that might slip through
      if (
        deal.price.toLowerCase().includes('free') || 
        deal.price.toLowerCase().includes('100% off')
      ) {
        return false;
      }
    }
    
    return true;
  });

  // If all deals were filtered out
  if (validDeals.length === 0) {
    return <p className="text-sm text-gray-400">No valid deals available</p>;
  }

  // Remove duplicates with more comprehensive comparison
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

  // Group deals into Drinks and Food
  const drinkDeals = uniqueDeals.filter((deal) => deal.category !== 'Food');
  const foodDeals = uniqueDeals.filter((deal) => deal.category === 'Food');

  return (
    <div className="mt-2">
      {/* Sleeker Tab Design */}
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

      {/* Tab content with scrolling for long lists */}
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

// Helper function with fixed type errors
// Helper function with all TypeScript errors fixed
const formatHappyHours = (happyHours: HappyHour[] | null): string => {
  if (!happyHours || happyHours.length === 0) return 'No happy hours listed';

  // Define day order for sorting
  const dayOrder: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  // Group by time slot
  const timeGroups: Record<string, string[]> = {};

  happyHours.forEach((hour) => {
    if (!hour.day || !hour.start_time || !hour.end_time) return;

    const timeKey = `${hour.start_time}-${hour.end_time}`;
    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = [];
    }
    // Fixed line 210 - use non-null assertion
    if (hour.day) {
      timeGroups[timeKey].push(hour.day);
    }
  });

  // Format each time group with fixed types
  const formattedGroups = Object.entries(timeGroups).map(([timeSlot, days]) => {
    // Sort days by order - using nullish coalescing for safety
    days.sort((a, b) => {
      // Fixed lines 217-218
      const aOrder = typeof a === 'string' ? (dayOrder[a] ?? 0) : 0;
      const bOrder = typeof b === 'string' ? (dayOrder[b] ?? 0) : 0;
      return aOrder - bOrder;
    });

    // Find ranges with fixed types
    const ranges: string[] = [];

    if (days.length === 1) {
      // If only one day, no need for range processing
      const day = days[0];
      if (day) {
        ranges.push(day);
      }
    } else {
      let rangeStart: string | undefined = days[0];
      let prev: string | undefined = days[0];

      for (let i = 1; i < days.length; i++) {
        const current: string | undefined = days[i];
        
        // Fixed null safety
        if (!prev || !current) continue;
        
        // Fixed lines 217-218
        const prevDayOrder: number = typeof prev === 'string' ? (dayOrder[prev] ?? 0) : 0;
        const currentDayOrder: number = typeof current === 'string' ? (dayOrder[current] ?? 0) : 0;

        // Check if days are consecutive
        if (currentDayOrder - prevDayOrder === 1) {
          // Current day is consecutive with previous
          prev = current;

          // If this is the last day, complete the range
          if (i === days.length - 1) {
            // Fixed line 227
            if (rangeStart && prev) {
              ranges.push(rangeStart === prev ? rangeStart : `${rangeStart}-${prev}`);
            }
          }
        } else {
          // Not consecutive, end the current range
          // Fixed line 231
          if (rangeStart && prev) {
            ranges.push(rangeStart === prev ? rangeStart : `${rangeStart}-${prev}`);
          }

          // Start a new range
          rangeStart = current;
          prev = current;

          // If this is the last day, add as a single day
          if (i === days.length - 1) {
            // Fixed line 239
            if (current) {
              ranges.push(current);
            }
          }
        }
      }
    }

    // Join ranges with comma and return formatted time slot
    return `${ranges.join(', ')}: ${timeSlot}`;
  });

  // Join all time groups with semicolon
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
              {/* Header section */}
              <div className="bg-gray-900 p-3">
                <h3 className="text-lg font-bold text-white">{restaurant.name}</h3>
                {restaurant.address && (
                  <p className="mb-2 text-sm text-gray-400">{restaurant.address}</p>
                )}
              </div>

              {/* Main content with scrollable sections */}
              <div className="p-3">
                {/* Happy Hours - Enhanced with better scrolling */}
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

                {/* Deals with tabs */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300">Deals:</h4>
                  <DealsDisplay deals={restaurant.deals as unknown as Deal[]} />
                </div>
              </div>

              {/* Links section at the bottom with icons */}
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
                        {/* Instagram Camera Icon */}
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
                        {/* Google Maps Icon - Matching style */}
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
                        {/* Simple Star Icon for Yelp - Matching Style */}
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
