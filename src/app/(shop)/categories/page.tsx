import Link from 'next/link';
import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Category, Paginated, SeoPage } from '@/lib/types';
import { FlaskIcon } from '@/components/icons';
import { SeoIntro } from '@/components/storefront/SeoIntro';

const HIGHLIGHTS = [
  { icon: 'grid' as const, label: 'Browse by Ingredient Class' },
  { icon: 'leaf' as const, label: 'Actives to Botanicals' },
  { icon: 'tag' as const, label: 'Live Product Counts' },
  { icon: 'search' as const, label: 'Compare Materials Fast' },
];

const DEFAULT_METADATA: Metadata = {
  title: 'Ingredient Categories',
  description:
    'Shop wholesale cosmetic ingredients by category — carrier oils, butters and waxes, emulsifiers, surfactants, acids, actives and peptides, all in bulk quantities.',
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/categories')}`, {
    cache: 'no-store',
  });
  // Falls back to DEFAULT_METADATA when the admin SEO override is absent
  // (SeoPagesModule is currently disabled, so it always is). Routed through
  // pageMetadata so this page gets a self-referencing canonical, Open Graph
  // and Twitter tags — none of which it had — and so the description is
  // clamped into the 120-160 character window rather than hand-counted.
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
  const res = await serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=100');
  const categories = res?.data || [];

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
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Catalog</p>
      <h1 className="mt-1 font-display text-4xl text-ink">
        Ingredient Categories for Wholesale Buyers
      </h1>
      <p className="mt-2 text-sm text-ink-soft">{categories.length} categories</p>

      <SeoIntro highlights={HIGHLIGHTS} paragraphs={introParagraphs} />

      {categories.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No categories found.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-px bg-sand-200 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group flex flex-col bg-white transition hover:bg-sand-50"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-sand-100">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <FlaskIcon className="h-8 w-8 text-sand-400" />
                )}
              </div>
              <div className="p-5">
                <p className="font-display text-lg text-ink group-hover:text-olive-700">{c.name}</p>
                {typeof c.productCount === 'number' && (
                  <p className="mt-0.5 text-xs text-ink-soft">{c.productCount} products</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
