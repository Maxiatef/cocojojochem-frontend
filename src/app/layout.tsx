import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'CocoJojoChem Wholesale',
    template: '%s',
  },
  description: 'Wholesale cosmetic ingredient supply for brands, formulators, and manufacturers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
