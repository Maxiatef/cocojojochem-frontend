import type { Metadata } from 'next';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, pageMetadata } from '@/lib/seo';

// The contact page itself is a client component ('use client'), and a client
// component cannot export `metadata` — so it had NO title, description or
// canonical at all and inherited the site defaults. A layout is a server
// component, so the metadata lives here instead.
export const metadata: Metadata = pageMetadata({
  title: 'Contact Sales',
  description: `Talk to the ${SITE_NAME} wholesale team about bulk pricing, drum quantities, lead times, COA and SDS documentation, or a custom ingredient request. We reply within one business day.`,
  path: '/contact',
  keywords: [
    'contact cosmetic ingredient supplier',
    'wholesale ingredient quote',
    'bulk ingredient pricing request',
    'cosmetic ingredient sales team',
    'request COA SDS',
  ],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      {children}
    </>
  );
}
