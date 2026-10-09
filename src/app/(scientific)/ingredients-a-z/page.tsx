import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { LibraryMolecularScroll } from '@/components/ocean/motion/library-molecular-scroll';
import { Catalog, isReferenceView, toSearchParams } from '@/components/ocean/catalog/Catalog';
import { getOurProducts } from '@/components/ocean/catalog/ourProducts';

/**
 * Ingredients A to Z in the ocean design: the reference wraps its catalog
 * (A–Z list view, 36 per page) in `LibraryMolecularScroll`. OUR products come
 * from the API, merged with the supplier reference library. Filtering,
 * letter and paging are plain GET parameters, so the page works without
 * JavaScript and the reference list never ships to the browser.
 *
 * Views that list only supplier references (?source=references or a
 * supplier id, e.g. the old ?source=makingcosmetics) are noindex,follow.
 */

export const revalidate = 3600;

const PATH = '/ingredients-a-z';

type SearchParams = Record<string, string | string[] | undefined>;

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const isReference = isReferenceView(toSearchParams(searchParams));
  const base = pageMetadata({
    title: isReference ? 'Supplier Reference Library A–Z' : 'Ingredients A–Z',
    description: isReference
      ? 'Supplier reference library: cosmetic raw materials COCOJOJO can source on request. Reference only — COCOJOJO stock and grade are not confirmed.'
      : 'Every COCOJOJO wholesale cosmetic ingredient from A to Z, with INCI names and categories. Browse by letter, filter by category and open the product page for pack sizes and pricing.',
    path: PATH,
    keywords: ['cosmetic ingredients a-z', 'ingredient glossary', 'INCI names', 'wholesale cosmetic raw materials'],
  });
  // The reference view lists other suppliers' catalogs: keep it out of the
  // index, but let crawlers follow its links back into ours.
  return isReference ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function IngredientsAzPage({ searchParams }: { searchParams: SearchParams }) {
  const ours = await getOurProducts();
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Ingredients A–Z', path: PATH },
        ])}
      />
      <LibraryMolecularScroll>
        <Catalog path={PATH} params={toSearchParams(searchParams)} ours={ours} />
      </LibraryMolecularScroll>
    </>
  );
}
