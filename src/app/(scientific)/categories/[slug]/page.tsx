import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated, Product } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { IngredientRow } from '@/components/scientific/IngredientRow';
import { ArrowLink, Container, Eyebrow, SciButton } from '@/components/scientific/primitives';

/**
 * A single ingredient category, rebuilt to the "Scientific edition" design
 * (Figma rj57PsDgSsbo86iG4RC1SA, node 21:366 —
 * "Oils, emollients & waxes / directory / desktop").
 *
 * The design is a flat A-Z directory: every record in the category on one
 * page, no facets and no pagination. That replaces the filter sidebar this
 * page used to carry, so the intro links across to /products?category=<slug>,
 * where the same catalogue is available with search, price, function and
 * stock filters — the filter engine is not duplicated here.
 *
 * Listing the whole category server-side is also what the page wanted anyway:
 * the old version rendered its grid client-side and had to emit a second,
 * hidden list of links purely so crawlers could see the products at all.
 */

// The directory shows the whole category on one page. This cap exists only so
// a runaway category can't produce an unbounded response.
const MAX_RECORDS = 300;

function categoryKeywords(name: string): string[] {
  const lower = name.toLowerCase();
  return [
    name,
    `wholesale ${lower}`,
    `bulk ${lower}`,
    `${lower} supplier`,
    `buy ${lower} in bulk`,
    `${lower} for cosmetics`,
    `${lower} raw materials`,
  ];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await serverFetch<Category>(`/wholesale/categories/${params.slug}`);

  if (!category) {
    return pageMetadata({
      title: 'Category Not Found',
      description: `Browse the full ${SITE_NAME} wholesale cosmetic ingredient catalog by category.`,
      path: `/categories/${params.slug}`,
      noIndex: true,
    });
  }

  const count = category.productCount ?? 0;
  return pageMetadata({
    title: `Wholesale ${category.name}`,
    description: clampDescription(
      category.description,
      `Shop ${count > 0 ? `${count} ` : ''}wholesale ${category.name.toLowerCase()} in bulk and drum quantities. Trade pricing, INCI and spec data, fast US shipping from ${SITE_NAME}.`,
    ),
    path: `/categories/${category.slug}`,
    keywords: categoryKeywords(category.name),
    images: [category.imageUrl],
  });
}

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const category = await serverFetch<Category>(`/wholesale/categories/${params.slug}`);
  if (!category) notFound();

  const productsRes = await serverFetch<Paginated<Product>>(
    `/wholesale/products?categoryId=${category.id}&page=1&limit=${MAX_RECORDS}&sort=name_asc`,
  );
  const products = productsRes?.data || [];
  const total = productsRes?.pagination.total ?? products.length;
  // The API is asked for name_asc, but the directory's promise is "A-Z" — so
  // it sorts locally too rather than trusting the collation to match.
  const records = [...products].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Categories', path: '/categories' },
            { name: category.name, path: `/categories/${category.slug}` },
          ]),
          ...(records.length
            ? [
                itemListSchema({
                  name: `Wholesale ${category.name}`,
                  path: `/categories/${category.slug}`,
                  items: records.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
                }),
              ]
            : []),
        ]}
      />

      {/* Category introduction — 21:380 */}
      <section className="bg-sci-pale py-16">
        <Container className="flex flex-col gap-6">
          <nav aria-label="Breadcrumb">
            <Link
              href="/categories"
              className="font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
            >
              ← All ingredient categories
            </Link>
          </nav>

          <Eyebrow>Ingredient directory</Eyebrow>

          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[64px] md:leading-[72px]">
            {category.name}
          </h1>

          <p className="font-sci-body text-sci-label font-medium text-sci-navy">
            {total} {total === 1 ? 'ingredient record' : 'ingredient records'} · A–Z
          </p>

          <p className="max-w-[900px] font-sci-body text-sci-body text-sci-muted">
            {category.description ||
              `Every ${category.name.toLowerCase()} record we list, with pack sizes, wholesale pricing and live stock status. Certificates of Analysis and Safety Data Sheets are available on request — confirm grade, availability and documentation during quotation.`}
          </p>

          {/* The faceted view lives on /products; this page is the full index. */}
          <ArrowLink href={`/products?category=${category.slug}`}>
            Filter and sort this category
          </ArrowLink>
        </Container>
      </section>

      {/* Ingredient records — 21:387 */}
      <section className="bg-white py-16">
        <Container>
          {records.length === 0 ? (
            <p className="font-sci-body text-sci-body text-sci-muted">
              No products are listed in this category yet.{' '}
              <Link href="/quote-request" className="text-sci-blue hover:underline">
                Send a quote request
              </Link>{' '}
              and we will confirm what we can source.
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

      {/* Contact / Request a quote — 21:1078 */}
      <section className="bg-sci-pale py-16">
        <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-6">
            <Eyebrow>Let’s move your next idea forward</Eyebrow>
            <p className="font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy md:text-sci-heading">
              The next great formula
              <br />
              starts with a conversation.
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
