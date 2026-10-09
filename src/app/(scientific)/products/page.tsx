import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { Catalog, isReferenceView, toSearchParams } from '@/components/ocean/catalog/Catalog';
import { getOurProducts } from '@/components/ocean/catalog/ourProducts';

/**
 * The full catalog in the ocean design (reference retail-page.tsx `Catalog`,
 * path "/products"): OUR products from the API merged with the supplier
 * reference library, filtered on the server by ?q= (or our older ?search=),
 * ?source=, ?category=, ?letter=, ?function=, ?application=, ?solubility=,
 * ?form=, ?sort= and ?page=. Views that list only supplier references are
 * noindex,follow.
 */

type SearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_METADATA: Metadata = {
  title: 'All Wholesale Cosmetic Ingredients',
  description:
    'Browse our full range of wholesale cosmetic ingredients — carrier oils, butters, waxes, emulsifiers, surfactants and actives in bulk and drum sizes, with trade pricing.',
};

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
    // Cached for 5 minutes rather than no-store. no-store made the whole page
    // render per request (~1.4 s on the server), and Next streamed the loading
    // spinner first with the real hero after it — a 1.7 s LCP render delay on
    // /functions. SEO text edited in the admin still shows within 5 minutes.
  const seo = await serverFetch<SeoPage>(
    `/seo-pages/by-path?path=${encodeURIComponent('/products')}`,
    { revalidate: 300 },
  );
  const base = pageMetadata({
    title: seo?.metaTitle || (DEFAULT_METADATA.title as string),
    description: clampDescription(seo?.metaDescription, DEFAULT_METADATA.description as string),
    path: '/products',
    keywords: [
      'wholesale cosmetic ingredients catalog',
      'bulk cosmetic ingredients list',
      'buy cosmetic raw materials online',
      'cosmetic ingredient price list',
      'bulk ingredients by the gallon',
      'drum quantity cosmetic ingredients',
    ],
    images: [seo?.ogImageUrl],
  });
  return isReferenceView(toSearchParams(searchParams)) ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const ours = await getOurProducts();
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
        ])}
      />
      <Catalog path="/products" params={toSearchParams(searchParams)} ours={ours} />
    </>
  );
}
