'use client';

import { useState } from 'react';
import { Tabs, Text, Paper, Group, useMantineTheme } from '@mantine/core';
import { Deal } from '../../../types/happy-hour';

interface DealsDisplayProps {
  deals: Deal[] | null;
}

const DealsDisplay: React.FC<DealsDisplayProps> = ({ deals = null }) => {
  const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState<string | null>('drinks');

  if (!deals || deals.length === 0) {
    return (
      <Text size="xs" c={theme.colors.gray[5]}>
        No deals listed
      </Text>
    );
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
    return (
      <Text size="xs" c={theme.colors.gray[5]}>
        No valid deals available
      </Text>
    );
  }

  const uniqueDeals = validDeals.filter(
    (deal, index, self) =>
      index ===
      self.findIndex(
        (d) => d.category === deal.category && d.name === deal.name && d.price === deal.price
      )
  );

  const drinkDeals = uniqueDeals.filter((deal) => deal.category !== 'Food');
  const foodDeals = uniqueDeals.filter((deal) => deal.category === 'Food');

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
  };

  return (
    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      styles={{
        tab: {
          padding: '4px 8px',
          fontSize: '14px',
          fontWeight: 500,
          color: theme.white, 
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: theme.colors.blue[7],
            transform: 'scale(1.05)',
          },
        },
        list: { marginBottom: 2 },
        panel: { paddingTop: 2 },
      }}
    >
      <Tabs.List grow>
        <Tabs.Tab
          value="drinks"
          style={{
            backgroundColor: activeTab === 'drinks' ? theme.colors.blue[7] : undefined,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.blue[7];
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            if (activeTab !== 'drinks') {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          Drinks ({drinkDeals.length})
        </Tabs.Tab>
        <Tabs.Tab
          value="food"
          style={{
            backgroundColor: activeTab === 'food' ? theme.colors.blue[7] : undefined,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.blue[7];
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            if (activeTab !== 'food') {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          Food ({foodDeals.length})
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="drinks">
        {drinkDeals.length > 0 ? (
          <Paper bg={theme.colors.dark[5]} p={2} withBorder={false}>
            <div
              style={{
                maxHeight: '14rem',
                overflowY: 'auto',
              }}
            >
              {drinkDeals.map((deal, index) => (
                <Group key={index} justify="space-between" wrap="nowrap" mb={2}>
                  <Text
                    fw={500}
                    size="sm"
                    c={theme.colors.gray[0]}
                    style={{
                      maxWidth: '65%',
                      wordBreak: 'break-word',
                      lineHeight: 1.3,
                    }}
                  >
                    {deal.name}
                  </Text>
                  <div
                    style={{
                      backgroundColor: theme.colors.blue[8], 
                      color: theme.white,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      minWidth: '55px',
                      textAlign: 'center',
                      lineHeight: 1.5,
                    }}
                  >
                    {deal.price}
                  </div>
                </Group>
              ))}
            </div>
          </Paper>
        ) : (
          <Text size="xs" c={theme.colors.gray[5]}>
            No drink deals available
          </Text>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="food">
        {foodDeals.length > 0 ? (
          <Paper bg={theme.colors.dark[5]} p={2} withBorder={false}>
            <div
              style={{
                maxHeight: '14rem',
                overflowY: 'auto',
              }}
            >
              {foodDeals.map((deal, index) => (
                <Group key={index} justify="space-between" wrap="nowrap" mb={2}>
                  <Text
                    fw={500}
                    size="sm"
                    c={theme.colors.gray[0]}
                    style={{
                      maxWidth: '65%',
                      wordBreak: 'break-word',
                      lineHeight: 1.3,
                    }}
                  >
                    {deal.name}
                  </Text>
                  <div
                    style={{
                      backgroundColor: theme.colors.blue[8], 
                      color: theme.white,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      minWidth: '55px',
                      textAlign: 'center',
                      lineHeight: 1.5,
                    }}
                  >
                    {deal.price}
                  </div>
                </Group>
              ))}
            </div>
          </Paper>
        ) : (
          <Text size="xs" c={theme.colors.gray[5]}>
            No food deals available
          </Text>
        )}
      </Tabs.Panel>
    </Tabs>
  );
};

export default DealsDisplay;
