import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { Catalog, isReferenceView, toSearchParams } from '@/components/ocean/catalog/Catalog';
import { getOurProducts } from '@/components/ocean/catalog/ourProducts';

/**
 * /shop — the ocean design's shop (reference retail-page.tsx `Catalog` with
 * path "/shop"): OUR products by default (`source` defaults to cocojojo),
 * with the same filters as /products. Supplier-reference views stay
 * noindex,follow.
 */

type SearchParams = Record<string, string | string[] | undefined>;

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const base = pageMetadata({
    title: 'Shop Wholesale Cosmetic Ingredients',
    description:
      'Shop COCOJOJO wholesale cosmetic ingredients — choose a published pack size and add it to your cart, or request the size you need.',
    path: '/shop',
    keywords: ['buy cosmetic ingredients online', 'wholesale cosmetic ingredients shop', 'cosmetic raw materials'],
  });
  return isReferenceView(toSearchParams(searchParams)) ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const ours = await getOurProducts();
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
        ])}
      />
      <Catalog path="/shop" params={toSearchParams(searchParams)} ours={ours} />
    </>
  );
}
