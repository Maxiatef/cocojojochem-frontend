import '@/styles/gloss.css';
import '@/styles/gloss-overrides.css';
import '@/styles/gloss-home.css';
import '@/styles/gloss-catalog.css';
import '@/styles/gloss-categories.css';
import '@/styles/gloss-library.css';
import '@/styles/gloss-content.css';
import '@/styles/gloss-workspace.css';
import '@/styles/gloss-account.css';
import { GlossShell } from '@/components/gloss/GlossShell';
import { VisitorTracker } from '@/components/commerce/VisitorTracker';
import { ConsentNotice } from '@/components/scientific/ConsentNotice';
import { SCI_FONT_VARS } from '@/lib/fonts';

/**
 * The storefront, in the Gloss Studio design.
 *
 * `gloss-theme` is the scope the ported stylesheet hangs off (see
 * src/styles/gloss.css): every rule in it is prefixed with `.gloss-theme`, so
 * the design applies here and nowhere else — the admin dashboard, which shares
 * the root layout, is untouched.
 *
 * SCI_FONT_VARS stays because a few older components still read the
 * Scientific-edition font variables while they are being migrated.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${SCI_FONT_VARS} gloss-theme antialiased`}>
      <VisitorTracker />
      <GlossShell>{children}</GlossShell>
      <ConsentNotice />
    </div>
  );
}
