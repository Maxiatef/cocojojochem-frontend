import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Paginated, Product, ProductFunction } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import {
  CategoryCatalog,
  readCatalogQuery,
  redirectToPickedGroup,
  type CatalogGroupOption,
} from '@/components/ocean/categories/CategoryCatalog';

/**
 * Every material we stock that performs one formulation function, as a real,
 * indexable page — in the ocean design, drawn like a category page: the
 * reference's filtered catalog (/products?function=<tag>) via `CategoryCatalog`.
 *
 * Functions used to have no page of their own: every link went to
 * /products?functionSlug=<slug>, which could never rank (robots.txt disallows
 * `/products?`, its canonical is plain /products, and its grid is fetched
 * client-side). This page lists the whole function server-side, A–Z, with the
 * filtered catalogue linked for anyone who wants to sort or narrow it.
 */

// Same cap as the category directory: one page, but never an unbounded response.
const MAX_RECORDS = 300;

async function loadFunction(slug: string) {
  // The backend 404s an unknown slug; serverFetch turns that into null.
  return serverFetch<ProductFunction>(`/wholesale/functions/${encodeURIComponent(slug)}`, {
    revalidate: 300,
  });
}

async function loadProducts(slug: string) {
  // The public list endpoint, not /functions/:slug/products — that one checks
  // isPublished only, while this applies the full public visibility gate
  // (schedule + visibility) that the sitemap and every other listing use.
  return serverFetch<Paginated<Product>>(
    `/wholesale/products?functionSlug=${encodeURIComponent(slug)}&page=1&limit=${MAX_RECORDS}&sort=name_asc`,
    { revalidate: 300 },
  );
}

function functionKeywords(name: string): string[] {
  const lower = name.toLowerCase();
  return [
    `${lower} ingredients`,
    `${lower} cosmetic ingredients`,
    `wholesale ${lower} ingredients`,
    `bulk ${lower} ingredients`,
    `${lower} ingredients supplier`,
    `${lower} raw materials`,
  ];
}

export async function generateMetadata({
  params,
  searchParams = {},
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  redirectToPickedGroup(searchParams, 'function', params.slug, '/functions');
  const [fn, productsRes] = await Promise.all([
    loadFunction(params.slug),
    loadProducts(params.slug),
  ]);

  // See products/[slug]: a real 404 has to be decided before the stream opens.
  if (!fn) notFound();

  const total = productsRes?.pagination.total ?? 0;
  return pageMetadata({
    title: `${fn.name} Ingredients — Wholesale & Bulk`,
    description: clampDescription(
      fn.description,
      `${total > 0 ? `${total} ` : ''}${fn.name.toLowerCase()} cosmetic ingredients, wholesale in bulk and drum quantities. INCI and CAS data, trade pricing and fast US shipping from ${SITE_NAME}.`,
    ),
    path: `/functions/${fn.slug}`,
    keywords: functionKeywords(fn.name),
    // A function with nothing published is a heading and a quote link — thin
    // enough to be a soft-404 risk. It still renders (the /functions index
    // names it), but stays out of the index until it has material behind it.
    // The sitemap applies the same productCount > 0 rule.
    noIndex: total === 0,
  });
}

export default async function FunctionDetailPage({
  params,
  searchParams = {},
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  redirectToPickedGroup(searchParams, 'function', params.slug, '/functions');

  const [fn, productsRes, allRes] = await Promise.all([
    loadFunction(params.slug),
    loadProducts(params.slug),
    serverFetch<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=300', { revalidate: 300 }),
  ]);
  if (!fn) notFound();

  const products = productsRes?.data || [];
  // Sorted locally as well, as on the category page: the page promises A–Z.
  const records = [...products].sort((a, b) => a.name.localeCompare(b.name));
  const lower = fn.name.toLowerCase();

  const options: CatalogGroupOption[] = (allRes?.data || [])
    .filter((f) => (f.productCount ?? 0) > 0 || f.slug === fn.slug)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((f) => ({ slug: f.slug, label: f.name, count: f.productCount }));
  if (!options.some((o) => o.slug === fn.slug)) options.unshift({ slug: fn.slug, label: fn.name });

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Functions', path: '/functions' },
            { name: fn.name, path: `/functions/${fn.slug}` },
          ]),
          ...(records.length
            ? [
                itemListSchema({
                  name: `${fn.name} Cosmetic Ingredients`,
                  path: `/functions/${fn.slug}`,
                  items: records.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
                }),
              ]
            : []),
        ]}
      />

      {/* Every function page shares the fallback sentence; unique copy belongs
          in the admin's description field (Admin → Functions), which replaces it. */}
      <CategoryCatalog
        path={`/functions/${fn.slug}`}
        title={fn.name}
        intro={
          fn.description ||
          `Materials we stock that are used for their ${lower} function in cosmetic and personal care formulations, with INCI names, pack sizes, wholesale pricing and current stock.`
        }
        products={records}
        query={readCatalogQuery(searchParams)}
        groupLabel="Function"
        groupParam="function"
        groupOptions={options}
        currentGroup={fn.slug}
        groupChip={{ label: fn.name, removeHref: '/functions' }}
      />
    </>
  );
}
