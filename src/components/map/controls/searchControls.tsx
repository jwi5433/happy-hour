// components/map/controls/SearchControl.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { happyHourVenues } from 'src/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import L from 'leaflet';
import { Search, X } from 'react-feather';

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
    setShowResults(false);
    setSearchTerm('');

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.getLatLng().equals([
        restaurant.latitude ?? 0,
        restaurant.longitude ?? 0
      ])) {
        layer.fire('click');
      }
    });
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
      <div className="leaflet-control" style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3))',
        transition: 'transform 0.3s ease, filter 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.filter = 'drop-shadow(0 6px 10px rgba(93, 95, 239, 0.4))';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3))';
      }}>
        <div
          className={`flex items-center rounded-2xl transition-all duration-300 ease-in-out ${isExpanded ? 'w-full sm:w-72' : 'w-14'} relative overflow-visible`}
          style={{ 
            height: '50px',
            backgroundColor: 'var(--dark-bg-primary)'
          }}
        >
          <button
            onClick={toggleSearch}
            className="flex-shrink-0 p-2 focus:outline-none h-full"
            aria-label={isExpanded ? "Close search" : "Open search"}
            title={isExpanded ? "Close search" : "Open search"}
            style={{ 
              width: '56px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--dark-accent)',
              transition: 'color 0.3s ease, background-color 0.3s ease',
              borderRadius: '12px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--dark-accent)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'scale(1.05)';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--dark-accent)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Search className="h-7 w-7" />
          </button>

          {isExpanded && (
            <>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Search happy hours..."
                aria-label="Search happy hours"
                style={{
                  width: '100%',
                  padding: '8px 4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'transparent',
                  color: 'var(--dark-text-primary)',
                  border: 'none',
                  outline: 'none'
                }}
              />

              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="flex-shrink-0 p-2 text-blue-400 hover:text-blue-300 focus:outline-none"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
              {showResults && matches.length > 0 && (
                <div
                  ref={resultsRef}
                  className="absolute left-0 top-full z-[1000] mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-gray-800 shadow-lg"
                >
                  <ul className="py-1">
                    {matches.map((restaurant) => (
                      <li
                        key={restaurant.id}
                        onClick={() => handleRestaurantClick(restaurant)}
                        className="cursor-pointer px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
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
