// src/components/AiChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { HappyHourVenue } from 'src/server/db/schema';
import { HappyHour, Deal } from 'src/types/happy-hour';

interface AiChatProps {
  restaurants: HappyHourVenue[];
  userPosition: [number, number] | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RestaurantContext {
  name: string;
  address: string | null;
  distance?: string;
  happyHours: string;
  topDeals: string;
  currentlyOpen?: boolean;
  categories: string;
}

interface RestaurantWithDistance extends HappyHourVenue {
  distance?: number;
}

const AiChat: React.FC<AiChatProps> = ({ restaurants, userPosition, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! I can help you find happy hour spots in Austin. What are you looking for today?',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [debugMode, setDebugMode] = useState<boolean>(false);

  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatHappyHours = (happyHours: any): string => {
    if (!Array.isArray(happyHours)) return 'Unknown';

    return (happyHours as any[])
      .map((h) => {
        const day = h.day || '';
        const start = h.start_time || '';
        const end = h.end_time || '';
        return `${day} ${start}-${end}`.trim();
      })
      .filter((text) => text.length > 0)
      .join(', ');
  };

  const formatDeals = (deals: any): string => {
    if (!Array.isArray(deals)) return 'Unknown';

    return (deals as any[])
      .map((d) => {
        const name = d.name || '';
        const price = d.price || '';
        const category = d.category ? ` (${d.category})` : '';
        return `${name}: ${price}${category}`.trim();
      })
      .filter((text) => text.length > 0)
      .slice(0, 3)
      .join(', ');
  };

  const getRelevantRestaurants = (query: string): RestaurantContext[] => {
    const now = new Date();
    const currentDay = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isCurrentlyHappyHour = (restaurant: RestaurantWithDistance): boolean => {
      if (!Array.isArray(restaurant.happyHours)) return false;

      const happyHours = restaurant.happyHours as any[];
      return happyHours.some((hh) => {
        if (!hh || hh.day !== currentDay) return false;

        let startHour = 0;
        let startMinute = 0;
        if (typeof hh.start_time === 'string') {
          const parts = hh.start_time.split(':');
          startHour = parseInt(parts[0] || '0', 10);
          startMinute = parseInt(parts[1] || '0', 10);
        }

        let endHour = 0;
        let endMinute = 0;
        if (typeof hh.end_time === 'string') {
          const parts = hh.end_time.split(':');
          endHour = parseInt(parts[0] || '0', 10);
          endMinute = parseInt(parts[1] || '0', 10);
        }

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        const currentMinutes = currentHour * 60 + currentMinute;

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      });
    };

    const getDealCategories = (restaurant: RestaurantWithDistance): string[] => {
      if (!Array.isArray(restaurant.deals)) return [];

      return (restaurant.deals as any[]).map((d) => d.category || '').filter(Boolean);
    };

    const getDealItems = (restaurant: RestaurantWithDistance): string[] => {
      if (!Array.isArray(restaurant.deals)) return [];

      return (restaurant.deals as any[]).map((d) => d.name || '').filter(Boolean);
    };

    const restaurantsWithDistance: RestaurantWithDistance[] = userPosition
      ? restaurants.map((r) => {
          if (!r.latitude || !r.longitude) return { ...r, distance: Infinity };

          const lat1 = userPosition[0];
          const lon1 = userPosition[1];
          const lat2 = Number(r.latitude);
          const lon2 = Number(r.longitude);

          const R = 6371; 
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c; 

          return { ...r, distance };
        })
      : restaurants.map((r) => ({ ...r }));

    const queryLower = query.toLowerCase();
    let filteredRestaurants: RestaurantWithDistance[] = [];

    const isLocationQuery =
      queryLower.includes('near') ||
      queryLower.includes('close') ||
      queryLower.includes('nearby') ||
      queryLower.includes('walking');

    const isTimeQuery =
      queryLower.includes('now') ||
      queryLower.includes('open') ||
      queryLower.includes('current') ||
      queryLower.includes('tonight') ||
      queryLower.includes('today');

    const foodDrinkKeywords = [
      'beer',
      'wine',
      'cocktail',
      'margarita',
      'whiskey',
      'tequila',
      'vodka',
      'gin',
      'rum',
      'pizza',
      'burger',
      'taco',
      'appetizer',
      'nachos',
      'wings',
      'happy hour',
      'special',
      'deal',
    ];

    const mentionedFoodDrink = foodDrinkKeywords.filter((keyword) => queryLower.includes(keyword));

    if (isTimeQuery) {
      filteredRestaurants = restaurantsWithDistance.filter(isCurrentlyHappyHour);
    }

    if (mentionedFoodDrink.length > 0) {
      const keywordMatches = restaurantsWithDistance.filter((r) => {
        const dealItems = getDealItems(r).map((item) => item.toLowerCase());
        const dealCategories = getDealCategories(r).map((cat) => cat.toLowerCase());
        return mentionedFoodDrink.some(
          (keyword) =>
            dealItems.some((item) => item.includes(keyword)) ||
            dealCategories.some((cat) => cat.includes(keyword))
        );
      });

      if (filteredRestaurants.length > 0) {
        filteredRestaurants = filteredRestaurants.filter((r) =>
          keywordMatches.some((match) => match.id === r.id)
        );
      } else {
        filteredRestaurants = keywordMatches;
      }
    }

    if (filteredRestaurants.length === 0 || isLocationQuery) {
      filteredRestaurants = restaurantsWithDistance.sort(
        (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
      );
    }

    filteredRestaurants = filteredRestaurants.slice(0, 20);

    if (filteredRestaurants.length < 10) {
      const additionalCount = 10 - filteredRestaurants.length;
      const existingIds = new Set(filteredRestaurants.map((r) => r.id));

      const additionalRestaurants = restaurantsWithDistance
        .filter((r) => !existingIds.has(r.id))
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, additionalCount);

      filteredRestaurants = [...filteredRestaurants, ...additionalRestaurants];
    }

    return filteredRestaurants.map((r) => {
      const isOpen = isCurrentlyHappyHour(r);

      return {
        name: r.name,
        address: r.address,
        distance: r.distance ? `${r.distance.toFixed(1)} km` : 'Unknown',
        happyHours: formatHappyHours(r.happyHours),
        topDeals: formatDeals(r.deals),
        currentlyOpen: isOpen,
        categories: getDealCategories(r).join(', '),
      };
    });
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!input.trim() || isLoading || !API_KEY) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model: GenerativeModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction:
          'You are a friendly AI assistant for Austin happy hours. Keep your tone conversational and helpful.' +
          'When recommending places:' +
          '1. Provide 3 top recommendations in a clear, numbered list, but be concise' +
          "2. If you can't find exact matches, suggest alternatives that are close" +
          '3. If you cant help just take your best guess based on the info given and be friendly and conversational.',
      });

      const relevantRestaurants = getRelevantRestaurants(userMessage);

      const locationContext = userPosition
        ? `The user's current location is: latitude ${userPosition[0]}, longitude ${userPosition[1]}.`
        : "The user's location is unknown.";

      const now = new Date();
      const timeContext = `The current time is ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}.`;

      const prompt = `
        ${locationContext}
        ${timeContext}
        
        Here is information about Austin happy hour restaurants that are relevant to the user's query:
        ${JSON.stringify(relevantRestaurants)}
        
        The user asked: "${userMessage}"
        
        Please provide a helpful and accurate response based on the provided restaurant information.
        If the user is asking about specific food or drinks, recommend places that have those items.
        If they're asking about "open now" or current options, only recommend places that are currently open for happy hour.
        If they're asking about nearby places, prioritize recommendations based on distance.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-96 w-96 flex-col rounded-t-lg bg-white shadow-lg">
      <div className="flex items-center justify-between rounded-t-lg bg-blue-600 p-3 font-semibold text-white">
        <span>Happy Hour Assistant</span>
        <div className="flex items-center">
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="mr-3 text-xs text-white opacity-50 hover:opacity-100"
            >
              {debugMode ? 'Hide Debug' : 'Debug'}
            </button>
          )}
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block max-w-xs rounded-lg p-3 md:max-w-md ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="my-2 text-center text-gray-500">
            <div className="inline-block rounded-full bg-gray-100 p-2">
              <div className="flex space-x-1">
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {debugMode && (
        <div
          className="absolute bottom-16 left-0 right-0 overflow-auto bg-black bg-opacity-80 p-2 text-xs text-white"
          style={{ maxHeight: '200px' }}
        >
          <pre>{JSON.stringify(getRelevantRestaurants(input || 'default query'), null, 2)}</pre>
        </div>
      )}

      <div className="border-t bg-white p-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSendMessage()} // Changed from onKeyPress
            placeholder="Ask about happy hours..."
            className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={`rounded-lg p-2 ${
              isLoading || !input.trim()
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
