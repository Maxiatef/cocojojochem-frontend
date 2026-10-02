import type { Metadata } from 'next';

// A customer's private quote: never indexed, never followed.
export const metadata: Metadata = {
  title: 'Your quote',
  robots: { index: false, follow: false },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
