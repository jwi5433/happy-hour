'use client';

import { useState } from 'react';
import { Deal } from '../../../types/happy-hour';

interface DealsDisplayProps {
  deals: Deal[] | null;
}

const DealsDisplay: React.FC<DealsDisplayProps> = ({ deals = null }) => {
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
              ? 'bg-blue-600 text-white'
              : 'text-gray-200 hover:text-white hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('drinks')}
        >
          Drinks ({drinkDeals.length})
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 rounded-t-md ml-1 ${
            activeTab === 'food'
              ? 'bg-blue-600 text-white'
              : 'text-gray-200 hover:text-white hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('food')}
        >
          Food ({foodDeals.length})
        </button>
      </div>
      {activeTab === 'drinks' && drinkDeals.length > 0 && (
        <div className="rounded-lg bg-gray-600 p-2.5 shadow-sm">
          <div className="max-h-32 overflow-y-auto pr-1 scrollbar-thin">
            <ul className="space-y-1">
              {drinkDeals.map((deal, index) => (
                <li key={index} className="flex items-center justify-between py-0.5 border-b border-gray-600 last:border-b-0">
                  <span className="text-sm text-gray-200" style={{ maxWidth: '70%', wordBreak: 'break-word' }}>
                    {deal.name}
                  </span>
                  <span className="rounded-md px-2 py-1 text-sm font-bold whitespace-nowrap ml-2"
                    style={{ 
                      backgroundColor: 'var(--dark-bg-primary)',
                      color: 'white'
                    }}>
                    {deal.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'food' && foodDeals.length > 0 && (
        <div className="rounded-lg bg-gray-700 p-2.5 shadow-sm">
          <div className="max-h-32 overflow-y-auto pr-1 scrollbar-thin">
            <ul className="space-y-1">
              {foodDeals.map((deal, index) => (
                <li key={index} className="flex items-center justify-between py-0.5 border-b border-gray-600 last:border-b-0">
                  <span className="text-sm text-gray-200" style={{ maxWidth: '70%', wordBreak: 'break-word' }}>
                    {deal.name}
                  </span>
                  <span className="rounded-md px-2 py-1 text-sm font-bold whitespace-nowrap ml-2"
                    style={{ 
                      backgroundColor: 'var(--dark-bg-primary)',
                      color: 'white'
                    }}>
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

export default DealsDisplay;