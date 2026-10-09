import { serverFetch } from '@/lib/serverFetch';
import type { Paginated, Product } from '@/lib/types';

/**
 * Every published product from OUR backend, for the ocean catalog pages
 * (/shop, /products, /ingredients-a-z). The reference site filters its whole
 * catalog on the server; we do the same, merging these with the supplier
 * references (src/lib/ocean/references.ts).
 *
 * Each page of the list is cached by Next's fetch cache for five minutes.
 * Products are slimmed before they reach the client cards: the card needs
 * name, INCI, photo, category and variants, not the long-form copy.
 */

const PAGE_SIZE = 100;
const MAX_PAGES = 20; // 2,000 products
const REVALIDATE = 300;

export type CatalogOurProduct = Product & {
  /** Plain text used by the Application / Solubility / Physical form filters. */
  filterText: string;
};

function slim(p: Product): CatalogOurProduct {
  const specs = p.specs || [];
  const filterText = [p.shortDescription, p.description, ...specs.map((s) => s.key + ' ' + s.value)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return {
    ...p,
    description: null,
    shortDescription: null,
    chemicalDescriptions: null,
    specs: specs.filter((s) => /solub|appear|form/i.test(s.key)),
    seo: null,
    documents: undefined,
    certifications: undefined,
    gallery: (p.gallery || []).slice(0, 1),
    category: p.category
      ? ({ id: p.category.id, name: p.category.name, slug: p.category.slug } as Product['category'])
      : undefined,
    filterText,
  };
}

export async function getOurProducts(): Promise<CatalogOurProduct[]> {
  const out: CatalogOurProduct[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await serverFetch<Paginated<Product>>(
      `/wholesale/products?page=${page}&limit=${PAGE_SIZE}&sort=name_asc`,
      { revalidate: REVALIDATE },
    );
    if (!res?.data?.length) break;
    out.push(...res.data.map(slim));
    const { hasNext, totalPages } = res.pagination;
    if (hasNext === false || (totalPages != null && page >= totalPages)) break;
  }
  return out;
}

/** Strip the server-only filter text before a product goes to a client card. */
export function cardProduct(p: CatalogOurProduct): Product {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { filterText, specs, ...rest } = p;
  return { ...rest, specs: [] };
}
