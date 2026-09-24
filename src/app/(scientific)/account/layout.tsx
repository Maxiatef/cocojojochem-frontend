import type { Metadata } from 'next';
import localFont from 'next/font/local';

// Sign-in, sign-up and the signed-in account pages are not search results.
// robots.txt already disallows /account, but a disallowed URL can still be
// indexed from links elsewhere — noindex is what actually keeps it out.
// No canonical either: these pages used to inherit the root layout's
// canonical of "/", telling crawlers the login form was the homepage.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

/**
 * The account section used to declare its own display face (Space Grotesk)
 * alongside a mono, giving the site a third type system next to the
 * storefront's and the Scientific edition's. The display face is gone: these
 * pages now use `font-sci-heading` like every other migrated page.
 *
 * The mono stays. Order numbers, account ids and tracking codes are strings
 * you read character by character and compare against a printed label, and a
 * proportional face makes that genuinely harder — `0`/`O` and `1`/`l` stop
 * being distinguishable. `TrackingTimeline` reads the same variable.
 */
const mono = localFont({
  src: [
    { path: '../../../fonts/JetBrainsMono-400.ttf', weight: '400', style: 'normal' },
    { path: '../../../fonts/JetBrainsMono-500.ttf', weight: '500', style: 'normal' },
    { path: '../../../fonts/JetBrainsMono-600.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-account-mono',
});

export default function AccountSectionLayout({ children }: { children: React.ReactNode }) {
  return <div className={mono.variable}>{children}</div>;
}
