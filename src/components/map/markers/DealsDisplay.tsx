'use client';

import { useState } from 'react';
import { Tabs, Text, Paper, Group, Stack } from '@mantine/core';
import { Deal } from '../../../types/happy-hour';

interface DealsDisplayProps {
  deals: Deal[] | null;
}

const DealsDisplay: React.FC<DealsDisplayProps> = ({ deals = null }) => {
  const [activeTab, setActiveTab] = useState<string | null>('drinks');

  if (!deals || deals.length === 0) {
    return null;
  }

  const validDeals = deals.filter((deal) => deal.name && deal.price);
  const uniqueDeals = Array.from(new Set(validDeals.map((d) => JSON.stringify(d)))).map((s) =>
    JSON.parse(s)
  );
  const drinkDeals = uniqueDeals.filter((deal) => deal.category !== 'Food');
  const foodDeals = uniqueDeals.filter((deal) => deal.category === 'Food');

  return (
    <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="lg">
      <Tabs.List grow>
        <Tabs.Tab
          value="drinks"
          style={{ fontSize: 'var(--mantine-font-size-xs)', padding: '1px 6px' }}
        >
          Drinks ({drinkDeals.length})
        </Tabs.Tab>
        <Tabs.Tab
          value="food"
          style={{ fontSize: 'var(--mantine-font-size-xs)', padding: '1px 6px' }}
        >
          Food ({foodDeals.length})
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="drinks" pt={2}>
        {drinkDeals.length > 0 ? (
          <Stack gap={1}>
            {drinkDeals.map((deal, index) => (
              <Group key={index} justify="space-between" wrap="nowrap">
                <Text size="xs" style={{ maxWidth: '70%' }}>
                  {deal.name}
                </Text>
                <Text size="xs" fw={600} c="blue.4">
                  {deal.price}
                </Text>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed" ta="center" pt="md">
            No drink deals
          </Text>
        )}
      </Tabs.Panel>
      <Tabs.Panel value="food" pt={2}>
        {foodDeals.length > 0 ? (
          <Stack gap={1}>
            {foodDeals.map((deal, index) => (
              <Group key={index} justify="space-between" wrap="nowrap">
                <Text size="xs" style={{ maxWidth: '70%' }}>
                  {deal.name}
                </Text>
                <Text size="xs" fw={600} c="blue.4">
                  {deal.price}
                </Text>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed" ta="center" pt="md">
            No food deals
          </Text>
        )}
      </Tabs.Panel>
    </Tabs>
  );
};

export default DealsDisplay;
