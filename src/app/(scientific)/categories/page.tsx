import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Category, Paginated, Product, SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { CategoryDirectory } from '@/components/gloss/categories/CategoryDirectory';
import { categoryPhoto } from '@/components/gloss/categories/GlossPhoto';
import { IndexBand } from '@/components/gloss/categories/IndexBand';
import { LongForm } from '@/components/gloss/categories/LongForm';
import { EmptyState } from '@/components/gloss/EmptyState';

/**
 * Ingredient categories, in the Gloss Studio design (prototype `/categories`):
 * the `r-page-intro` head and the `r-category-directory` photo cards.
 *
 * Differences from the prototype, all on purpose: cards open our own indexable
 * /categories/<slug> pages rather than a filtered catalog URL; counts are real
 * product counts; each card uses the category's own photo when Admin has one,
 * otherwise the prototype's matching ingredient photo. The long-form buying
 * copy stays for search, laid out like the prototype's help pages.
 */

const DEFAULT_METADATA: Metadata = {
  title: 'Ingredient Categories',
  description:
    'Shop wholesale cosmetic ingredients by category — carrier oils, butters and waxes, emulsifiers, surfactants, acids, actives and peptides, all in bulk quantities.',
};

export async function generateMetadata(): Promise<Metadata> {
    // Cached for 5 minutes rather than no-store. no-store made the whole page
    // render per request (~1.4 s on the server), and Next streamed the loading
    // spinner first with the real hero after it — a 1.7 s LCP render delay on
    // /functions. SEO text edited in the admin still shows within 5 minutes.
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/categories')}`, {
    revalidate: 300,
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

/** The card's sentence: the category's own description when it has one. */
function cardText(c: Category): string {
  const own = (c.description || '').split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim();
  if (own) return own.length > 170 ? own.slice(0, 167).replace(/\s+\S*$/, '') + '…' : own;
  const children = (c.children || []).map((k) => k.name);
  const lower = c.name.toLowerCase();
  if (children.length > 0) {
    const shown = children.slice(0, 3).join(', ');
    return `Explore wholesale ${lower}, including ${shown}${children.length > 3 ? ' and more' : ''}.`;
  }
  return `Explore wholesale ${lower} for cosmetic formulation, with INCI names, pack sizes and trade pricing on every listing.`;
}

export default async function CategoriesPage() {
  const [res, productsRes] = await Promise.all([
    serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=100&rootsOnly=true'),
    // Only the total is wanted — `limit=1` keeps it to a count, not a payload.
    serverFetch<Paginated<Product>>('/wholesale/products?page=1&limit=1'),
  ]);
  const categories = res?.data || [];
  const productTotal = productsRes?.pagination.total ?? 0;

  const introParagraphs = [
    `We organize our wholesale ingredient catalog into ${categories.length} categories. They cover actives, acids, botanical extracts, oils, butters, emulsifiers, preservatives, and specialty additives. As a result, browsing by category is the quickest way to compare materials within the same functional class. For example, you can weigh different humectants against each other before choosing one for a new formulation.`,
    'Each category page lists every product currently available in that group. It also shows live stock status and wholesale pricing. We update categories as we add new ingredients, so the count above reflects our current live catalog. Select a category below to see the full product list. Alternatively, use product search if you already know the specific ingredient you need.',
    `Categories group materials by what they physically are. That is usually how procurement and inventory think about them: oils with oils, waxes with waxes, and surfactants with surfactants. Therefore, categories are useful when you are stocking a shelf or comparing grades of the same material type. They also help you find what else you could add to consolidate freight.`,
    `If you are solving a formulation problem rather than restocking, browsing by function is often faster. That route groups materials by the job they do instead of by their chemistry. Most buyers use both paths. Category pages show the range of a material type and its pack sizes. Meanwhile, function pages help you find alternatives that behave the same way in a batch.`,
    `Pack sizes vary by material. Fast-moving liquids such as carrier oils and glycerin are often available from a gallon up to a drum. However, actives and peptides are typically available in smaller weights because typical use levels are low. Where a material is sold by drum, the listing prices it per drum rather than per kilo. That is because drum freight is typically quoted on pallet space, not parcel weight.`,
    `Certificates of Analysis and Safety Data Sheets are available on request for anything we stock. As a result, we recommend requesting both before scaling a formula from bench to production. If you need a grade, certification, or pack size that is not shown, send a quote request. In many cases, we source materials to order against a customer's specification.`,
    `We rate shipping at checkout from cart weight and destination zone. As a result, you know the cost before you commit. Orders above the free-shipping threshold ship free within the contiguous United States. However, we quote freight to Alaska, Hawaii, the District of Columbia, and US territories manually. We also quote drum freight manually, because a parcel-weight table cannot price pallet routes honestly.`,
    `Stock positions change as material moves. Therefore, a listing you checked last week may not reflect what is available today. If you are planning a production run, confirm quantities with the sales team. For predictable repeat usage, we can hold material against a blanket order. This reduces stock risk and price volatility in your planning.`,
    `Minimum order values apply across the catalogue. This is a trade supply operation rather than a retail store. If your requirement sits below that threshold, the quote-request route is usually better. It lets us review what you need and price it sensibly. In addition, we can sometimes combine several small lines into one shipment.`,
  ];

  const introSubheadings = [
    { beforeIndex: 1, text: 'Finding the right category' },
    { beforeIndex: 3, text: 'Category browsing versus function browsing' },
    { beforeIndex: 4, text: 'Pack sizes and documentation' },
    { beforeIndex: 6, text: 'Shipping and stock planning' },
    { beforeIndex: 8, text: 'Minimum orders and quotes' },
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

      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">A place for every ingredient</span>
        <h1>Explore every ingredient family.</h1>
        <p>
          Start with the material you need, then explore its specifications and applications.{' '}
          {productTotal > 0
            ? `${productTotal} wholesale ingredients across ${categories.length} categories, with INCI naming, pack sizes and live stock status on every listing.`
            : `${categories.length} categories of wholesale cosmetic ingredients, with INCI naming, pack sizes and live stock status on every listing.`}
        </p>
      </div>

      <section className="r-wrap r-section">
        {categories.length === 0 ? (
          <EmptyState
            title="Categories are on their way."
            text="The category directory could not be loaded. Search the full catalog instead."
            href="/products"
            label="Explore the shop"
          />
        ) : (
          <CategoryDirectory
            items={categories.map((c) => ({
              key: c.id,
              href: `/categories/${c.slug}`,
              name: c.name,
              image: categoryPhoto(c),
              imageAlt: `${c.name} representative ingredients`,
              meta: `${c.productCount ?? 0} ${(c.productCount ?? 0) === 1 ? 'ingredient' : 'ingredients'}`,
              text: cardText(c),
            }))}
          />
        )}
      </section>

      {/* The catalog's other two indexes, in the home page's library band. */}
      <IndexBand
        eyebrow="Every material, indexed"
        title={
          <>
            Grouped by what it is.
            <br />
            Or by what it does.
          </>
        }
        text="Categories group materials by what they physically are. Browse by function to find them by the job they do in a formulation, or search by name if you already know the INCI name. Wholesale pricing throughout; Certificates of Analysis and Safety Data Sheets on request."
        cta={{ href: '/products', label: 'Open the full catalog' }}
        tiles={[
          { href: '/functions', kicker: 'Browse by', letter: 'F', caption: 'Ingredients by function' },
          { href: '/ingredients-a-z', kicker: 'Start with', letter: 'A', caption: 'Ingredients A–Z' },
        ]}
      />

      <LongForm
        eyebrow="How the catalog is organized"
        heading="Choosing a category"
        paragraphs={introParagraphs}
        subheadings={introSubheadings}
        aside={{
          title: 'Need a grade we don’t list?',
          text: 'Confirm the exact grade, availability and documentation during quotation. We source many materials to order against your specification.',
          links: [
            { href: '/quote-request', label: 'Request a quote' },
            { href: '/functions', label: 'Browse ingredients by function' },
            { href: '/contact', label: 'Ask an ingredient question' },
          ],
        }}
      />
    </>
  );
}
