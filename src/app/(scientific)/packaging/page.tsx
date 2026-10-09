import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { PackagingCatalog } from '@/components/ocean/packaging/PackagingPages';

type Props = { searchParams: Record<string, string | string[] | undefined> };

export function generateMetadata({ searchParams }: Props): Metadata {
  const filtered = Object.keys(searchParams).some((k) => k !== 'type');
  return pageMetadata({
    title: 'Cosmetic Packaging',
    description:
      'Cosmetic bottles, jars, dispensers and closures. Build your packaging shortlist, then confirm specifications and quantities with our team.',
    path: '/packaging',
    keywords: ['cosmetic packaging', 'cosmetic bottles', 'cosmetic jars', 'airless pumps', 'dispensers', 'closures'],
    noIndex: filtered,
  });
}

export default function PackagingPage({ searchParams }: Props) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) if (typeof v === 'string') params.set(k, v);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Packaging', path: '/packaging' },
        ])}
      />
      <PackagingCatalog params={params} />
    </>
  );
}
