import '@mantine/core/styles.css';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import './global.css';
import { type Metadata } from 'next';
import { MantineProvider } from '../components/MantineProvider';

export const metadata: Metadata = {
  title: 'Austin Happy Hours',
  description: 'Find the best happy hour spots in Austin, TX',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
