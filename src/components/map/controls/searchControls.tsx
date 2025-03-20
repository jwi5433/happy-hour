// components/map/controls/SearchControl.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { happyHourVenues } from 'src/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

interface SearchControlProps {
  restaurants: Restaurant[];
  onSearchResults?: (results: Restaurant[]) => void; 
}

const SearchControl: React.FC<SearchControlProps> = ({ restaurants, onSearchResults }) => {
  const map = useMap();

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState<Restaurant[]>([]);
  const [showResults, setShowResults] = useState(false);


  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const filteredResults = findMatchingRestaurants(restaurants, searchTerm);
      setMatches(filteredResults);
      setShowResults(filteredResults.length > 0);
    } else {
      setMatches([]);
      setShowResults(false);
    }
  }, [searchTerm, restaurants]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const findMatchingRestaurants = (allRestaurants: Restaurant[], term: string): Restaurant[] => {
    if (!term.trim() || term.trim().length < 2) {
      return [];
    }

    const normalizedTerm = term.toLowerCase().trim();

    return allRestaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(normalizedTerm)
    );
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    const lat = Number(restaurant.latitude);
    const lng = Number(restaurant.longitude);

    map.flyTo([lat, lng], 16);

    setShowResults(false);

    setSearchTerm(restaurant.name);
  };

  const toggleSearch = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    if (!newExpandedState) {
      setShowResults(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.trim().length >= 2 && matches.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '10px', marginLeft: '10px' }}>
      <div className="leaflet-control">
        <div
          className={`flex items-center rounded-md bg-white shadow-md transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-10'} relative overflow-visible`}
        >
          <button
            onClick={toggleSearch}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-blue-600 focus:outline-none"
            aria-label={isExpanded ? 'Close search' : 'Open search'}
            title={isExpanded ? 'Close search' : 'Search happy hours'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>

          {isExpanded && (
            <>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                className="w-full px-1 py-2 text-sm focus:outline-none"
                placeholder="Search happy hours..."
                aria-label="Search happy hours"
              />

              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {showResults && matches.length > 0 && (
                <div
                  ref={resultsRef}
                  className="absolute left-0 top-full z-[1000] mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white shadow-lg"
                >
                  <ul className="py-1">
                    {matches.map((restaurant) => (
                      <li
                        key={restaurant.id}
                        onClick={() => handleRestaurantClick(restaurant)}
                        className="cursor-pointer px-4 py-2 text-sm hover:bg-blue-50"
                      >
                        {restaurant.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchControl;
