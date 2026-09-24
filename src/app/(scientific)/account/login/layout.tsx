import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

// The one part of /account that search engines may list: people do search
// for a shop's sign-in and sign-up pages by name. Overrides the account
// layout's noindex, and gives the page its own canonical and description
// (the page itself is a client component, so it can't export metadata).
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Sign in to your account',
    description: 'Sign in to your CocoJojoChem trade account to reorder wholesale cosmetic ingredients, track orders and see your saved quote list.',
    path: '/account/login',
  }),
  // Explicit, because metadata merges down: without it this page inherits
  // the account layout's noindex.
  robots: { index: true, follow: true },
};

export default function IndexableAccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
