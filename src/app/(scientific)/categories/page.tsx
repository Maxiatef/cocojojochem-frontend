import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Category, Paginated, Product, SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { CategoryCard } from '@/components/scientific/CategoryCard';
import { SciProse } from '@/components/scientific/SciProse';
import {
  ArrowLink,
  Container,
  Eyebrow,
  SciButton,
  SectionHeading,
} from '@/components/scientific/primitives';

/**
 * Ingredient categories, rebuilt to the "Scientific edition" design
 * (Figma rj57PsDgSsbo86iG4RC1SA, node 33:459 — "03 — Ingredient catalog").
 *
 * Section order and type scale follow the design. The copy does not, wherever
 * the design's placeholder text would have been false about this site: the
 * design's twelve invented categories are the live catalogue here, its record
 * counts are real product counts, and its "BASF · Brenntag · Univar…" supplier
 * list — which would claim distribution agreements we have not stated — is
 * replaced by the two other real ways into the catalogue, the A-Z index and
 * the function browser.
 */

const DEFAULT_METADATA: Metadata = {
  title: 'Ingredient Categories',
  description:
    'Shop wholesale cosmetic ingredients by category — carrier oils, butters and waxes, emulsifiers, surfactants, acids, actives and peptides, all in bulk quantities.',
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/categories')}`, {
    cache: 'no-store',
  });
  return pageMetadata({
    title: seo?.metaTitle || (DEFAULT_METADATA.title as string),
    description: clampDescription(seo?.metaDescription, DEFAULT_METADATA.description as string),
    path: '/categories',
    keywords: [
      'cosmetic ingredient categories',
      'wholesale carrier oils',
      'bulk butters and waxes',
      'wholesale emulsifiers',
      'bulk surfactants',
      'cosmetic actives and peptides',
    ],
    images: [seo?.ogImageUrl],
  });
}

export default async function CategoriesPage() {
  const [res, productsRes] = await Promise.all([
    serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=100'),
    // Only the total is wanted — `limit=1` keeps it to a count, not a payload.
    serverFetch<Paginated<Product>>('/wholesale/products?page=1&limit=1'),
  ]);
  const categories = res?.data || [];
  const productTotal = productsRes?.pagination.total ?? 0;

  const introParagraphs = [
    `We organize our wholesale ingredient catalog into ${categories.length} categories, covering everything from actives and acids to botanical extracts, oils, butters, emulsifiers, preservatives, and specialty additives. Browsing by category is the quickest way to compare materials within the same functional class — for example, weighing different humectants against each other, or reviewing every preservative system we stock before choosing one for a new formulation.`,
    'Each category page lists every product currently available in that group, along with live stock status and wholesale pricing. Categories are updated as we add new ingredients, so the count above reflects our current live catalog. Select a category below to see the full product list, or use the A-Z index or product search if you already know the specific ingredient you need.',
    `Categories group materials by what they physically are, which is usually how procurement and inventory think about them: oils with oils, waxes with waxes, surfactants with surfactants. That makes categories the right way in when you are stocking a shelf, comparing grades of the same material type, or checking what else you could add to an order to consolidate freight.`,
    `If you are solving a formulation problem rather than restocking, browsing by function is often faster, because it groups materials by the job they do instead of by their chemistry. Most buyers use both: category to see the range of a material type and its available pack sizes, function to find alternatives that behave the same way in a batch.`,
    `Pack sizes vary by material. Fast-moving liquids such as carrier oils and glycerin are typically offered from a gallon up to a drum, while actives and peptides are sold in far smaller weights because typical use levels are a fraction of a percent. Where a material is sold by drum, the listing prices it per drum rather than per kilo, since freight on drum shipments is quoted on pallet space rather than parcel weight.`,
    `Certificates of Analysis and Safety Data Sheets are available on request for anything we stock, and we recommend requesting both before scaling a formula from bench to production. If you need a grade, certification or pack size that is not shown, send a quote request rather than assuming it is unavailable — a significant share of what we ship is sourced to order against a customer's specification.`,
    `Shipping is rated at checkout from cart weight and destination zone, so the cost is known before you commit rather than adjusted afterwards. Orders above the free-shipping threshold ship free within the contiguous United States. Freight to Alaska, Hawaii, the District of Columbia and the US territories, and any shipment moving as drum freight on pallets, is quoted manually — those routes cannot be priced honestly from a weight table, so we confirm them directly instead.`,
    `Stock positions change as material moves, so a listing you checked last week may not reflect what is available today. If you are planning a production run some weeks ahead, confirm quantities with the sales team rather than relying on a cached page. For predictable repeat usage we can hold material against a blanket order and release it on a schedule, which removes both the stock risk and the price volatility from your planning.`,
    `Minimum order values apply across the catalogue because this is a trade supply operation rather than a retail store. If your requirement sits below that threshold, the quote-request route is usually the better option — it lets us look at what you actually need and price it sensibly, including combining several small lines into one shipment to make the freight worthwhile.`,
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Categories', path: '/categories' },
          ]),
          ...(categories.length
            ? [
                itemListSchema({
                  name: 'Wholesale Ingredient Categories',
                  path: '/categories',
                  items: categories.map((c) => ({
                    name: c.name,
                    path: `/categories/${c.slug}`,
                  })),
                }),
              ]
            : []),
        ]}
      />

      {/* Expanded catalog introduction — 33:479 */}
      <section className="bg-sci-pale py-16">
        <Container className="flex flex-col gap-6">
          <Eyebrow>The ingredient directory</Eyebrow>
          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[64px] md:leading-[72px]">
            Find your next ingredient.
          </h1>
          <p className="max-w-[820px] font-sci-body text-sci-body text-sci-muted">
            {productTotal > 0
              ? `${productTotal} ingredients and commercial blends across ${categories.length} categories, with INCI naming, pack sizes and live stock status on every listing.`
              : `${categories.length} categories of wholesale cosmetic ingredients, with INCI naming, pack sizes and live stock status on every listing.`}
          </p>
          <p className="max-w-[820px] font-sci-body text-sci-body text-sci-muted">
            Wholesale pricing throughout. Certificates of Analysis and Safety Data Sheets are
            available on request — confirm the exact grade, availability and documentation during
            quotation.
          </p>
        </Container>
      </section>

      {/* Browse every category — 33:484 */}
      <section className="bg-white py-16">
        <Container className="flex flex-col gap-6">
          <SectionHeading>Explore the Categories</SectionHeading>

          {categories.length === 0 ? (
            <p className="font-sci-body text-sci-body text-sci-muted">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <CategoryCard
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  name={c.name}
                  count={c.productCount}
                />
              ))}
            </div>
          )}

          {/* The design's navy "Research you can trace." panel. Its supplier
              list is replaced by the catalogue's other two indexes, which is
              what this block can honestly point at. */}
          <div className="mt-2 flex flex-col gap-6 bg-sci-navy p-10 text-white">
            <h2 className="font-sci-heading text-[32px] font-semibold leading-[40px] md:text-sci-heading">
              Every material, indexed.
            </h2>
            <p className="max-w-[900px] font-sci-body text-sci-body">
              Categories group materials by what they are. Browse by function to find them by the
              job they do in a formulation, or work straight down the A-Z if you already know the
              INCI name.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <ArrowLink href="/functions" tone="white">
                Browse by function
              </ArrowLink>
              <ArrowLink href="/a-z" tone="white">
                A-Z ingredient index
              </ArrowLink>
              <ArrowLink href="/products" tone="white">
                Full product catalog
              </ArrowLink>
            </div>
          </div>
        </Container>
      </section>

      <SciProse
        eyebrow="How the catalog is organized"
        heading="Choosing a category"
        paragraphs={introParagraphs}
      />

      {/* Contact / Request a quote — 33:542 */}
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

