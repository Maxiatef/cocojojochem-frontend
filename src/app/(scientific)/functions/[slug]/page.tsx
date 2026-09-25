import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Paginated, Product, ProductFunction } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { IngredientRow } from '@/components/scientific/IngredientRow';
import { ArrowLink, Container, Eyebrow, SciButton } from '@/components/scientific/primitives';

/**
 * Every material we stock that performs one formulation function, as a real,
 * indexable page.
 *
 * Functions used to have no page of their own: every link went to
 * /products?functionSlug=<slug>, which could never rank. robots.txt disallows
 * `/products?`, that page's canonical points at plain /products, and its
 * product grid is fetched client-side — so the server HTML had no products in
 * it. The sitemap listed those URLs anyway. Queries like "bulk emulsifiers"
 * or "wholesale humectants" had nowhere on the site to land.
 *
 * This page is the category directory's pattern applied to functions: the
 * whole list rendered server-side, A–Z, with the filtered catalogue linked for
 * anyone who wants to sort or narrow it. /products?functionSlug= still works
 * as that faceted view; it just isn't what search engines are pointed at.
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
}: {
  params: { slug: string };
}): Promise<Metadata> {
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

export default async function FunctionDetailPage({ params }: { params: { slug: string } }) {
  const [fn, productsRes] = await Promise.all([
    loadFunction(params.slug),
    loadProducts(params.slug),
  ]);
  if (!fn) notFound();

  const products = productsRes?.data || [];
  const total = productsRes?.pagination.total ?? products.length;
  // Sorted locally as well, as on the category directory: the page promises A–Z.
  const records = [...products].sort((a, b) => a.name.localeCompare(b.name));
  const lower = fn.name.toLowerCase();

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

      <section className="bg-sci-pale py-16">
        <Container className="flex flex-col gap-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
            <Link
              href="/functions"
              className="font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
            >
              ← All functions
            </Link>
          </nav>

          <Eyebrow>Ingredients by function</Eyebrow>

          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[64px] md:leading-[72px]">
            {fn.name} ingredients
          </h1>

          <p className="font-sci-body text-sci-label font-medium text-sci-navy">
            {total} {total === 1 ? 'material' : 'materials'} · Sorted A–Z
          </p>

          {/* Short on purpose when there's no authored description. Every
              function page shares this sentence, so it states what the list is
              and stops — unique copy belongs in the admin's description field
              (Admin → Functions), which replaces it. */}
          <p className="max-w-[900px] font-sci-body text-sci-body text-sci-muted">
            {fn.description ||
              `Materials we stock that are used for their ${lower} function in cosmetic and personal care formulations. Each listing shows the INCI name, pack sizes, wholesale pricing and current stock.`}
          </p>

          {records.length > 0 && (
            <ArrowLink href={`/products?functionSlug=${fn.slug}`}>
              Filter and sort these materials
            </ArrowLink>
          )}
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          {records.length === 0 ? (
            <p className="font-sci-body text-sci-body text-sci-muted">
              No {lower} materials are published in the catalogue right now. We source many
              materials to order,{' '}
              <Link href="/quote-request" className="text-sci-blue hover:underline">
                so send a quote request
              </Link>{' '}
              describing what you need and we will confirm what we can supply.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {records.map((p) => (
                <li key={p.id}>
                  <IngredientRow product={p} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-sci-pale py-16">
        <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-6">
            <Eyebrow>Need a different grade or volume?</Eyebrow>
            <p className="font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy md:text-sci-heading">
              Tell us the specification
              <br />
              and we&rsquo;ll confirm what we can supply.
            </p>
          </div>
          <SciButton href="/quote-request" className="shrink-0">
            Request a quote →
          </SciButton>
        </Container>
      </section>
    </>
  );
}
