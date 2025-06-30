'use client';

import { useState, useRef, useEffect } from 'react';
import { happyHourVenues } from 'src/server/db/schema'; // FIXED: Import the 'happyHourVenues' table object, not the type.
import { InferSelectModel } from 'drizzle-orm';
import { ActionIcon, TextInput, Paper, List, Text, useMantineTheme } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

// This correctly infers the 'Restaurant' type from the 'happyHourVenues' table object.
type Restaurant = InferSelectModel<typeof happyHourVenues>;

interface SearchControlProps {
  restaurants: Restaurant[];
  onRestaurantSelect: (restaurant: Restaurant) => void;
}

const SearchControl: React.FC<SearchControlProps> = ({ restaurants, onRestaurantSelect }) => {
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
      const filteredResults = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
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

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setShowResults(false);
    setSearchTerm('');
    setIsExpanded(false);
    onRestaurantSelect(restaurant);
  };

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setShowResults(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
            width: isExpanded ? '18rem' : '50px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <ActionIcon
            onClick={toggleSearch}
            variant="transparent"
            color="blue"
            size="xl"
            radius="xl"
            style={{
              width: '56px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                placeholder="Search happy hours..."
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
                  bg="dark.7"
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
                        <Text size="sm" c="gray.0">
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
