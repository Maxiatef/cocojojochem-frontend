import { ScientificHeader } from '@/components/scientific/ScientificHeader';
import { ScientificFooter } from '@/components/scientific/ScientificFooter';
import { VisitorTracker } from '@/components/commerce/VisitorTracker';
import { SCI_FONT_VARS } from '@/lib/fonts';

/**
 * Route group for pages migrated to the COCOJOJO "Scientific edition" design.
 *
 * It exists as its own group rather than as a change to `(shop)/layout.tsx`
 * because the rebrand is landing page by page: everything still on the old
 * sand/olive design keeps `(shop)`'s header, footer and fonts until it moves
 * across. Both groups map to the same URL space, so nothing about the site's
 * routing changes as pages migrate.
 *
 * The typefaces themselves live in `@/lib/fonts` — the admin dashboard is
 * outside this group and needs the same two families.
 */

export default function ScientificLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${SCI_FONT_VARS} flex min-h-screen flex-col bg-white font-sci-body text-sci-navy`}
    >
      <VisitorTracker />
      <ScientificHeader />
      <main className="flex-1">{children}</main>
      <ScientificFooter />
    </div>
  );
}
