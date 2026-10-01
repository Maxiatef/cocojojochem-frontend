import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FileText, FlaskConical, Package } from 'lucide-react';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated, Product } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { Breadcrumb, DirectoryHero } from '@/components/gloss/categories/DirectoryHero';
import { categoryPhoto } from '@/components/gloss/categories/GlossPhoto';
import { ListingLayout } from '@/components/gloss/categories/ListingLayout';
import { LongForm } from '@/components/gloss/categories/LongForm';

/**
 * A single ingredient category, in the Gloss Studio design.
 *
 * The prototype has no category page of its own — a category opens the shop
 * filtered to it. This page keeps our indexable /categories/<slug> URL and
 * builds it from the shop's parts instead: a `library-hero` head with the
 * category's photo, subcategory chips (`r-filter-chips`), the shop's filter
 * column with "Find the right fit.", and a `r-product-grid` of ProductCards.
 * The faceted filter engine is not duplicated: the column links across to
 * /products?category=<slug>, where the same catalogue can be sorted and narrowed.
 *
 * The whole category is still listed server-side, so crawlers see every
 * product link without a second hidden list.
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
 * The category's own description (Admin → Categories), split on blank lines.
 * The first paragraph is the intro and the search snippet; any further
 * paragraphs replace the shared buying guidance, because copy written for this
 * category says more than a template that only swaps in its name.
 */
function descriptionParagraphs(description: string | null | undefined): string[] {
  return (description || '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
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
      descriptionParagraphs(category.description)[0],
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
  // The API is asked for name_asc, but the page's promise is "A-Z" — so it
  // sorts locally too rather than trusting the collation to match.
  const records = [...products].sort((a, b) => a.name.localeCompare(b.name));
  const [intro, ...moreDescription] = descriptionParagraphs(category.description);
  const lower = category.name.toLowerCase();

  const children = category.children || [];
  const chips = children.length
    ? children.map((child) => ({
        href: `/categories/${child.slug}`,
        label: child.name,
        count: child.productCount,
      }))
    : category.parent
      ? [{ href: `/categories/${category.parent.slug}`, label: `All ${category.parent.name.toLowerCase()}` }]
      : [];

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

      <Breadcrumb
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Categories', href: '/categories' },
          ...(category.parent
            ? [{ name: category.parent.name, href: `/categories/${category.parent.slug}` }]
            : []),
          { name: category.name },
        ]}
      />

      {/* The category's own photograph wins; the prototype's matching
          ingredient photo only stands in when there is none. The alt says
          what the picture is rather than repeating the heading. */}
      <DirectoryHero
        eyebrow={category.parent ? category.parent.name : 'Ingredient category'}
        title={category.name}
        intro={
          intro ||
          `Wholesale ${lower} for cosmetic and personal care formulation, listed A–Z with INCI names, pack sizes, trade pricing and current stock.`
        }
        meta={[
          { icon: <FlaskConical size={16} aria-hidden="true" />, text: `${total} ${total === 1 ? 'ingredient' : 'ingredients'} · A–Z` },
          { icon: <Package size={16} aria-hidden="true" />, text: 'Wholesale pack sizes' },
          { icon: <FileText size={16} aria-hidden="true" />, text: 'COA & SDS on request' },
        ]}
        image={categoryPhoto(category)}
        imageAlt={
          category.imageUrl
            ? `Photograph illustrating the ${category.name} ingredient category`
            : `${category.name} representative ingredient texture`
        }
        figure={{ value: total, label: total === 1 ? 'INGREDIENT' : 'INGREDIENTS' }}
      />

      <ListingLayout
        label={`${category.name} ingredients`}
        products={records}
        total={total}
        chips={chips}
        filterHref={`/products?category=${category.slug}`}
        filterText={`Narrow ${lower} by function, price and stock in the full catalog.`}
        backLink={{ href: '/categories', label: 'All ingredient categories' }}
        empty={{
          title: 'Nothing listed here yet.',
          text: `No ${lower} are published right now. Send a quote request and we will confirm what we can source for you.`,
        }}
      />

      {moreDescription.length > 0 ? (
        <LongForm
          eyebrow={`About ${lower}`}
          heading={`${category.name} in formulation`}
          paragraphs={moreDescription}
          aside={categoryAside(category)}
        />
      ) : (
        <LongForm
          eyebrow={`Buying ${lower}`}
          heading={`How to order ${lower} wholesale`}
          paragraphs={buyingGuidance(category.name, total)}
          subheadings={guidanceSubheadings(category.name)}
          aside={categoryAside(category)}
        />
      )}
    </>
  );
}

function categoryAside(category: Category) {
  return {
    title: 'Need a different grade or volume?',
    text: 'Tell us the specification and we’ll confirm what we can supply — pack size, documentation and freight included.',
    links: [
      { href: '/quote-request', label: 'Request a quote' },
      { href: `/products?category=${category.slug}`, label: `Filter ${category.name.toLowerCase()} in the catalog` },
      { href: '/categories', label: 'All ingredient categories' },
    ],
  };
}
