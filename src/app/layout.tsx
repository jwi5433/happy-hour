import 'happy/styles/globals.css';
import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
