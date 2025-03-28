'use client';

import { Tabs, Text, Paper, Group, useMantineTheme } from '@mantine/core';
import { Deal } from '../../../types/happy-hour';
import { useState } from 'react';

interface DealsDisplayProps {
  deals: Deal[] | null;
}

const DealsDisplay: React.FC<DealsDisplayProps> = ({ deals = null }) => {
  const theme = useMantineTheme();
  const [hoverTab, setHoverTab] = useState<string | null>(null);

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

  return (
    <Tabs
      defaultValue="drinks"
      styles={(theme) => ({
        tab: {
          padding: '4px 8px',
          fontSize: '14px',
          fontWeight: 500,
          color: 'white',
          transition: 'all 0.3s ease',
          '&[data-active="true"]': {
            backgroundColor: theme.colors.blue[7],
            color: 'white',
            fontWeight: 500,
          },
        },
        list: { 
          marginBottom: 2,
          borderBottom: `2px solid ${theme.colors.dark[4]}`
        },
        panel: { paddingTop: 2 },
      })}
    >
      <Tabs.List grow>
        <Tabs.Tab
          value="drinks"
          onMouseEnter={() => setHoverTab('drinks')}
          onMouseLeave={() => setHoverTab(null)}
          style={{
            backgroundColor: hoverTab === 'drinks' ? theme.colors.blue[7] : undefined,
            color: hoverTab === 'drinks' ? 'white' : 'white',
            transform: hoverTab === 'drinks' ? 'scale(1.05)' : undefined,
            boxShadow: hoverTab === 'drinks' ? theme.shadows.sm : 'none',
          }}
        >
          Drinks ({drinkDeals.length})
        </Tabs.Tab>
        <Tabs.Tab
          value="food"
          onMouseEnter={() => setHoverTab('food')}
          onMouseLeave={() => setHoverTab(null)}
          style={{
            backgroundColor: hoverTab === 'food' ? theme.colors.blue[7] : undefined,
            color: hoverTab === 'food' ? 'white' : 'white',
            transform: hoverTab === 'food' ? 'scale(1.05)' : undefined,
            boxShadow: hoverTab === 'food' ? theme.shadows.sm : 'none',
          }}
        >
          Food ({foodDeals.length})
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="drinks">
        {drinkDeals.length > 0 ? (
          <Paper bg={theme.colors.dark[5]} p={1} withBorder={false}>
            <div
              style={{
                maxHeight: '14rem',
                overflowY: 'auto',
              }}
            >
              {drinkDeals.map((deal, index) => (
                <Group key={index} justify="space-between" wrap="nowrap" mb={1}>
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
                      backgroundColor: theme.colors.blue[9],
                      color: theme.colors.gray[0],
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      minWidth: '45px',
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
          <Paper bg={theme.colors.dark[5]} p={1} withBorder={false}>
            <div
              style={{
                maxHeight: '14rem',
                overflowY: 'auto',
              }}
            >
              {foodDeals.map((deal, index) => (
                <Group key={index} justify="space-between" wrap="nowrap" mb={1}>
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
                      backgroundColor: theme.colors.blue[6],
                      color: theme.colors.gray[0],
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
