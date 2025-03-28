import { createTheme, CSSVariablesResolver } from '@mantine/core';

export const theme = createTheme({

  primaryColor: 'blue',

  colors: {
    blue: [
      '#e7f5ff',
      '#d0ebff',
      '#a5d8ff',
      '#74c0fc',
      '#4dabf7',
      '#339af0',
      '#228be6',
      '#1c7ed6',
      '#1971c2',
      '#1864ab',
    ],
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
    gray: [
      '#F8F9FA',
      '#F1F3F5',
      '#E9ECEF',
      '#DEE2E6',
      '#CED4DA',
      '#ADB5BD',
      '#868E96',
      '#495057',
      '#343A40',
      '#212529',
    ],
  },

  components: {
    Paper: {
      defaultProps: {
        p: 'md',
        shadow: 'xl',
        radius: 'md',
        withBorder: true,
      },
    },
    Card: {
      defaultProps: {
        p: 'xl',
        shadow: 'xl',
        radius: 'var(--mantine-radius-default)',
        withBorder: true,
      },
    },
    Select: {
      defaultProps: {
        checkIconPosition: 'right',
      },
    },
    Tabs: {
      defaultProps: {
        color: 'blue',
      },
    },
    Badge: {
      defaultProps: {
        variant: 'filled',
        color: 'blue',
      },
    },
    List: {
      defaultProps: {
        spacing: 'sm',
      },
    },
  },
});

export const mantineTheme = theme;

export const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
  variables: {
    '--dark-bg-primary': theme.colors.dark[6],
    '--dark-bg-secondary': theme.colors.dark[5],
    '--dark-border': theme.colors.dark[4],
    '--dark-text-primary': theme.colors.gray[0],
    '--dark-text-secondary': theme.colors.gray[2],
    '--dark-accent': theme.colors.blue[5],
    '--dark-accent-hover': theme.colors.blue[4],
  },
  light: {},
  dark: {},
});
