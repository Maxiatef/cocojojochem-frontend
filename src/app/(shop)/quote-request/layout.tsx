import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

// Unlike cart/checkout this IS worth indexing — "request a quote for bulk
// ingredients" is exactly the commercial-intent query a B2B buyer types.
export const metadata: Metadata = pageMetadata({
  title: 'Request a Wholesale Quote',
  description:
    'Request wholesale pricing on bulk cosmetic ingredients. Build a quote list of the ingredients and pack sizes you need, and our team responds with trade pricing and lead times within one business day.',
  path: '/quote-request',
  keywords: [
    'request wholesale quote cosmetic ingredients',
    'bulk ingredient quote',
    'trade pricing request',
    'wholesale ingredient RFQ',
    'drum quantity quote',
  ],
});

export default function QuoteRequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
