'use client';

import { MantineProvider as BaseMantineProvider } from '@mantine/core';
import { theme, cssVariablesResolver } from '../theme';

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseMantineProvider
      theme={theme}
      defaultColorScheme="dark"
      cssVariablesResolver={cssVariablesResolver}
    >
      {children}
    </BaseMantineProvider>
  );
}
