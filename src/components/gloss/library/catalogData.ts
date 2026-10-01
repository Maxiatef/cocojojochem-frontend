import { unstable_cache } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import { Paginated, Product, ProductDocType } from '@/lib/types';
import { productImage } from '@/lib/gloss/images';
import { DOC_TYPE_LABEL } from './docTypes';

/**
 * Server-side data for the library pages (/ingredients-a-z, /documents).
 *
 * Both pages need "every published product", which the API serves through
 * /wholesale/products/az-index — unpaginated and already behind the backend's
 * publish/visibility gate (the same source the sitemap uses). That index only
 * carries id/name/slug, so the A–Z list enriches it from the paginated list
 * (category, INCI, photo) and the document library reads each product's
 * detail record (the only endpoint that includes `documents`).
 *
 * Each aggregate is wrapped in unstable_cache for an hour: the result is
 * small, while the requests behind it are not. A failure throws inside the
 * cached function — errors are never cached — and degrades to an empty list
 * outside it, so a backend hiccup is not pinned for an hour.
 */

const REVALIDATE = 3600;
// Upper bounds, so a very large catalog can never turn one page render into
// thousands of API calls.
const LIST_PAGE_SIZE = 50;
const MAX_LIST_PAGES = 40; // 2,000 products
const MAX_DETAIL_FETCHES = 600;
const DETAIL_CONCURRENCY = 6;

type AzIndex = Record<string, { id: string; name: string; slug: string }[]>;

export interface CatalogEntry {
  id: string;
  name: string;
  slug: string;
  inci: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  image: string;
}

export interface CatalogDocument {
  id: string;
  url: string;
  type: ProductDocType;
  /** What the file is, e.g. "Safety data sheet" or a certification's name. */
  title: string;
  label: string | null;
  format: string;
  productName: string;
  productSlug: string;
}

async function fetchAzIndex(): Promise<{ id: string; name: string; slug: string }[]> {
  const index = await serverFetch<AzIndex>('/wholesale/products/az-index', { revalidate: REVALIDATE });
  if (!index) throw new Error('az-index unavailable');
  return Object.values(index).flat();
}

const loadCatalogIndex = unstable_cache(
  async (): Promise<CatalogEntry[]> => {
    const index = await fetchAzIndex();

    // Enrichment is best-effort: without it the entry still has a name and a
    // working link, just no category line.
    const details = new Map<string, Product>();
    for (let page = 1; page <= MAX_LIST_PAGES; page++) {
      const res = await serverFetch<Paginated<Product>>(
        `/wholesale/products?page=${page}&limit=${LIST_PAGE_SIZE}&sort=name_asc`,
        { revalidate: REVALIDATE },
      );
      if (!res?.data?.length) break;
      for (const p of res.data) details.set(p.id, p);
      const { hasNext, totalPages } = res.pagination;
      if (hasNext === false || (totalPages != null && page >= totalPages)) break;
    }

    return index.map((row) => {
      const p = details.get(row.id);
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        inci: p?.inciName || null,
        categoryName: p?.category?.name || null,
        categorySlug: p?.category?.slug || null,
        image: p ? productImage(p) : productImage({}),
      };
    });
  },
  ['gloss-library-catalog-index'],
  { revalidate: REVALIDATE },
);

/** Every published product, sorted by name, with category and INCI. */
export async function getCatalogIndex(): Promise<CatalogEntry[]> {
  try {
    const entries = await loadCatalogIndex();
    return [...entries].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  } catch {
    return [];
  }
}

function fileFormat(url: string): string {
  const ext = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'PDF';
  if (/^(png|jpe?g|webp|gif)$/.test(ext)) return 'Image';
  if (/^(docx?|odt)$/.test(ext)) return 'Word document';
  if (/^(xlsx?|csv)$/.test(ext)) return 'Spreadsheet';
  return 'File';
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const loadCatalogDocuments = unstable_cache(
  async (): Promise<CatalogDocument[]> => {
    const index = (await fetchAzIndex()).slice(0, MAX_DETAIL_FETCHES);
    const products = await mapWithConcurrency(index, DETAIL_CONCURRENCY, (row) =>
      serverFetch<Product>(`/wholesale/products/${encodeURIComponent(row.slug)}`, { revalidate: REVALIDATE }),
    );

    const docs: CatalogDocument[] = [];
    for (const p of products) {
      for (const d of p?.documents || []) {
        if (!d.url) continue;
        const title =
          d.type === 'CERTIFICATE' && d.certification?.name ? d.certification.name : DOC_TYPE_LABEL[d.type] || 'Document';
        docs.push({
          id: d.id,
          url: d.url,
          type: d.type,
          title,
          label: d.label && d.label !== title ? d.label : null,
          format: fileFormat(d.url),
          productName: p!.name,
          productSlug: p!.slug,
        });
      }
    }
    return docs.sort(
      (a, b) =>
        a.productName.localeCompare(b.productName, 'en', { sensitivity: 'base' }) || a.title.localeCompare(b.title),
    );
  },
  ['gloss-library-catalog-documents'],
  { revalidate: REVALIDATE },
);

/** Every document attached to a published product (SDS, COA, spec sheets…). */
export async function getCatalogDocuments(): Promise<CatalogDocument[]> {
  try {
    return await loadCatalogDocuments();
  } catch {
    return [];
  }
}
