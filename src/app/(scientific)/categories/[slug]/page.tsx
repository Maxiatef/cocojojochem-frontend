import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { isOptimisable } from '@/lib/images';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated, Product } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { IngredientRow } from '@/components/scientific/IngredientRow';
import { ArrowLink, Container, Eyebrow, SciButton } from '@/components/scientific/primitives';
import { HeroMedia } from '@/components/scientific/HeroMedia';
import { HERO_IMAGES } from '@/lib/heroImages';
import { SciProse } from '@/components/scientific/SciProse';

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

/**
 * The buying guidance below every category listing.
 *
 * Category pages ran to roughly 150 words — a heading, a count and a list of
 * product names — which is thin for a page meant to rank, and thin for a buyer
 * too: the listing says WHAT we carry and nothing about how to purchase it.
 * This is the part of a quote conversation that repeats for every category, so
 * it is worth writing down once.
 *
 * It is generated from the category rather than stored per-category because
 * none of the 41 categories has a description, and every statement here is
 * true of all of them. Where a category eventually earns copy of its own, that
 * copy should replace this rather than sit on top of it.
 *
 * Nothing here claims anything the site does not already state elsewhere:
 * documentation on request, manual freight on drums, sourcing to order, and a
 * minimum order value are all repeated from /products and /categories.
 */
function buyingGuidance(name: string, total: number) {
  const lower = name.toLowerCase();
  const some = total > 0 ? `the ${total === 1 ? 'material' : `${total} materials`} above` : 'this group';

  return [
    `Buying ${lower} wholesale differs from buying retail sizes, because the pack size changes the unit price rather than just the quantity. We quote every listing per pack, so the per-kilo or per-gallon cost usually falls as the pack grows. Compare ${some} on that basis rather than on headline price alone.`,
    `Pack sizes vary by material. We supply fast-moving liquids from a gallon up to a drum, while actives and concentrates come in smaller weights because typical use levels are low. Where we sell a material by drum, the listing prices it by drum count — carriers quote that freight on pallet space, not parcel weight, so we confirm it manually instead of guessing from a rate table.`,
    `Ask for documentation before you specify. Certificates of Analysis and Safety Data Sheets are available on request for anything we stock, and we recommend requesting both before you scale a formula from bench to production. Grades of the same INCI name differ between suppliers, so match on specification rather than on name alone.`,
    `Stock moves, so a listing you checked last week may not reflect what is available today. Confirm quantities with the sales team when you are planning a production run. For predictable repeat usage we can hold material against a blanket order, which takes some of the stock risk and price movement out of your planning.`,
    `If you need a grade, certification or pack size that is not shown here, send a quote request. We source to order against a customer specification in many cases, and our team can suggest alternatives within ${lower} when your first choice is unavailable. A minimum order value applies across the catalog, since this is a trade supply operation rather than a retail store.`,
  ];
}

/**
 * Named after the category rather than generic, because these headings are
 * the page's only H3s and "Pack sizes and freight" is the same sentence on all
 * 41 of them. Saying which material it refers to is more use to a reader
 * skimming, and it stops the section reading as boilerplate pasted under every
 * listing.
 */
function guidanceSubheadings(name: string) {
  const lower = name.toLowerCase();
  return [
    { beforeIndex: 1, text: `Pack sizes and freight for ${lower}` },
    { beforeIndex: 2, text: `${name} specifications and documentation` },
    { beforeIndex: 3, text: `Stock and planning` },
    { beforeIndex: 4, text: `Sourcing ${lower} to order` },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await serverFetch<Category>(`/wholesale/categories/${params.slug}`);

  // See products/[slug] — same soft-404 fix, same reason.
  if (!category) notFound();

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
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
            <Link
              href="/categories"
              className="font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
            >
              ← All ingredient categories
            </Link>
            {category.parent && (
              <>
                <span aria-hidden className="text-sci-border">
                  ›
                </span>
                <Link
                  href={`/categories/${category.parent.slug}`}
                  className="font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
                >
                  {category.parent.name}
                </Link>
              </>
            )}
          </nav>

          <Eyebrow>Ingredient directory</Eyebrow>

          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[64px] md:leading-[72px]">
            {category.name}
          </h1>

          <p className="font-sci-body text-sci-label font-medium text-sci-navy">
            {total} {total === 1 ? 'ingredient record' : 'ingredient records'} · Sorted A–Z
          </p>

          <p className="max-w-[900px] font-sci-body text-sci-body text-sci-muted">
            {category.description ||
              `First, every ${category.name.toLowerCase()} record we list includes pack sizes, wholesale pricing and live stock status. Importantly, all products carry full specification data and usage guidance. Furthermore, certificates of analysis and safety data sheets are available on request. Therefore, you can confirm grade and availability during quotation. Additionally, our sourcing team can suggest alternatives if your first choice isn't available. In fact, we handle custom volumes and sourcing to order. In particular, bulk quantities are available with trade pricing. As a result, you can compare options by price, function or stock status. Ultimately, browse this complete directory or contact us for your specific sourcing needs.`}
          </p>

          {/* Described, not hidden. This was aria-hidden on the argument that
              the <h1> already names the category — true, but it left the page
              with no images at all as far as any crawler is concerned, and a
              category page with nothing to look at is the weaker outcome. The
              alt says what the picture IS rather than repeating the heading.

              The category's own photograph is used where there is one; the
              shared placeholder only stands in when there is not, so a real
              asset always wins over stock imagery. */}
          <div className="relative isolate aspect-[21/9] w-full max-w-[900px] overflow-hidden rounded-xl bg-white">
            {category.imageUrl ? (
              // Through next/image: the source files are multi-megabyte PNGs
              // (1.6 MB for Acids) with a 4-hour cache on their host. This
              // serves a banner-sized AVIF/WebP cached for a year instead.
              <Image
                src={category.imageUrl}
                alt={`Photograph illustrating the ${category.name} ingredient category`}
                fill
                sizes="(min-width: 900px) 900px, 100vw"
                unoptimized={!isOptimisable(category.imageUrl)}
                className="object-cover"
              />
            ) : (
              <HeroMedia
                src={HERO_IMAGES.categories.src}
                alt={HERO_IMAGES.categories.alt}
                tone="light"
              />
            )}
          </div>

          {(category.children?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-sci-body text-sci-eyebrow font-semibold uppercase tracking-wide text-sci-muted">
                Subcategories
              </p>
              <ul className="flex flex-wrap gap-2">
                {category.children!.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${child.slug}`}
                      className="inline-block rounded-full border border-sci-border bg-white px-4 py-2 font-sci-body text-sci-label text-sci-navy transition hover:border-sci-blue hover:text-sci-blue"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              Currently, no products are listed in this category yet. However,{' '}
              <Link href="/quote-request" className="text-sci-blue hover:underline">
                send a quote request
              </Link>{' '}
              and we will confirm what we can source for you.
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

      <SciProse
        eyebrow={`Buying ${category.name.toLowerCase()}`}
        heading={`How to order ${category.name.toLowerCase()} wholesale`}
        paragraphs={buyingGuidance(category.name, total)}
        subheadings={guidanceSubheadings(category.name)}
      />

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
