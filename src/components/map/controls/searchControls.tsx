// components/map/controls/SearchControl.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { happyHourVenues } from 'src/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import L from 'leaflet';
import { ActionIcon, TextInput, Paper, List, Text, useMantineTheme } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

type Restaurant = InferSelectModel<typeof happyHourVenues>;

interface SearchControlProps {
  restaurants: Restaurant[];
  onSearchResults?: (results: Restaurant[]) => void;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
}

const SearchControl: React.FC<SearchControlProps> = ({ restaurants, onSearchResults, onRestaurantSelect }) => {
  const map = useMap();
  const theme = useMantineTheme();

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

    if (restaurant.latitude !== null && restaurant.longitude !== null) {
      const restaurantCoords: L.LatLngTuple = [restaurant.latitude, restaurant.longitude];

      map.flyTo(restaurantCoords, 15, {
        duration: 1.2
      });

      if (onRestaurantSelect) {
        onRestaurantSelect(restaurant);
      }
    }
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
        <Paper
          shadow="md"
          radius="xl"
          p={0}
          style={{
            backgroundColor: theme.colors.dark[6],
            transition: 'all 0.3s ease',
            height: '50px',
            width: isExpanded ? '18rem' : '56px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'visible',
            position: 'relative',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = theme.shadows.lg;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = theme.shadows.md;
          }}
        >
          <ActionIcon
            onClick={toggleSearch}
            variant="transparent"
            color={theme.primaryColor}
            size="xl"
            radius="xl"
            style={{
              width: '56px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.blue[7];
              e.currentTarget.style.color = theme.white;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.colors.blue[5];
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label={isExpanded ? 'Close search' : 'Open search'}
          >
            <IconSearch size={24} />
          </ActionIcon>

          {isExpanded && (
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
              <TextInput
                ref={inputRef}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="  Search happy hours..."
                aria-label="Search happy hours"
                variant="unstyled"
                style={{
                  flex: 1,
                }}
                styles={{
                  input: {
                    color: theme.colors.gray[0],
                    '&::placeholder': {
                      color: theme.colors.gray[5],
                    },
                  },
                }}
                rightSection={
                  searchTerm ? (
                    <ActionIcon onClick={handleClearSearch} variant="transparent" color="gray">
                      <IconX size={16} />
                    </ActionIcon>
                  ) : null
                }
              />

              {showResults && matches.length > 0 && (
                <Paper
                  ref={resultsRef}
                  shadow="md"
                  radius="md"
                  p="xs"
                  bg={theme.colors.dark[7]}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: '15rem',
                    overflow: 'auto',
                  }}
                >
                  <List spacing="xs">
                    {matches.map((restaurant) => (
                      <List.Item
                        key={restaurant.id}
                        onClick={() => handleRestaurantClick(restaurant)}
                        style={{
                          padding: theme.spacing.xs,
                          borderRadius: theme.radius.sm,
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.dark[5];
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Text size="sm" c={theme.colors.gray[0]}>
                          {restaurant.name}
                        </Text>
                      </List.Item>
                    ))}
                  </List>
                </Paper>
              )}
            </div>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default SearchControl;
