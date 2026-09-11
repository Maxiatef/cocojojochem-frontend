import localFont from 'next/font/local';
import { ScientificHeader } from '@/components/scientific/ScientificHeader';
import { ScientificFooter } from '@/components/scientific/ScientificFooter';
import { VisitorTracker } from '@/components/storefront/VisitorTracker';

/**
 * Route group for pages migrated to the COCOJOJO "Scientific edition" design.
 *
 * It exists as its own group rather than as a change to `(shop)/layout.tsx`
 * because the rebrand is landing page by page: everything still on the old
 * sand/olive design keeps `(shop)`'s header, footer and fonts until it moves
 * across. Both groups map to the same URL space, so nothing about the site's
 * routing changes as pages migrate.
 *
 * Both faces are variable fonts — one file each, covering every weight the
 * design uses (Manrope ExtraBold 800 for the wordmark down to DM Sans Regular
 * 400 for body copy).
 */

const sciHeading = localFont({
  src: '../../fonts/Manrope-Variable.ttf',
  weight: '200 800',
  variable: '--font-sci-heading',
  display: 'swap',
});

const sciBody = localFont({
  src: '../../fonts/DMSans-Variable.ttf',
  weight: '100 900',
  variable: '--font-sci-body',
  display: 'swap',
});

export default function ScientificLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${sciHeading.variable} ${sciBody.variable} flex min-h-screen flex-col bg-white font-sci-body text-sci-navy`}
    >
      <VisitorTracker />
      <ScientificHeader />
      <main className="flex-1">{children}</main>
      <ScientificFooter />
    </div>
  );
}
