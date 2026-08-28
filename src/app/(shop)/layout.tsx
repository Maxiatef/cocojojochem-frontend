import localFont from 'next/font/local';
import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';
import { VisitorTracker } from '@/components/storefront/VisitorTracker';

const display = localFont({
  src: [
    { path: '../../fonts/Fraunces-400.ttf', weight: '400', style: 'normal' },
    { path: '../../fonts/Fraunces-500.ttf', weight: '500', style: 'normal' },
    { path: '../../fonts/Fraunces-600.ttf', weight: '600', style: 'normal' },
    { path: '../../fonts/Fraunces-Italic-400.ttf', weight: '400', style: 'italic' },
    { path: '../../fonts/Fraunces-Italic-500.ttf', weight: '500', style: 'italic' },
  ],
  variable: '--font-display',
});

const storefront = localFont({
  src: [
    { path: '../../fonts/Manrope-400.ttf', weight: '400', style: 'normal' },
    { path: '../../fonts/Manrope-500.ttf', weight: '500', style: 'normal' },
    { path: '../../fonts/Manrope-600.ttf', weight: '600', style: 'normal' },
    { path: '../../fonts/Manrope-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-storefront',
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${storefront.variable} flex min-h-screen flex-col bg-sand-50 font-storefront text-ink`}
    >
      <VisitorTracker />
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
