import { Metadata } from 'next';
import { ProductFilterGrid } from '@/components/storefront/ProductFilterGrid';
import { SeoIntro } from '@/components/storefront/SeoIntro';
import { serverFetch } from '@/lib/serverFetch';
import { CategoryStrip } from '@/components/storefront/CategoryStrip';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { SeoPage } from '@/lib/types';

const HIGHLIGHTS = [
  { icon: 'flask' as const, label: 'INCI-Accurate Listings' },
  { icon: 'shield' as const, label: 'SDS & COA on Request' },
  { icon: 'check' as const, label: 'Live Stock Status' },
  { icon: 'shipping' as const, label: 'Bulk & Wholesale Pricing' },
];

const INTRO_PARAGRAPHS = [
  "Browse our full wholesale catalog of cosmetic and personal care ingredients, sourced and quality-checked for formulators, private-label brands, and manufacturers. Every listing includes INCI naming, available pack sizes, and current stock status so you can plan production runs with confidence, whether you're sourcing a single raw material or building out a complete formulation.",
  'Filter by category or function to narrow the catalog to actives, emulsifiers, preservatives, botanical extracts, oils, butters, and specialty additives. Each product page lists technical specifications, recommended usage rates, and documentation to help you evaluate fit before you order. Pricing is wholesale throughout, with volume-based breaks available on most items once you meet our order minimum.',
  "New ingredients are added regularly as we expand supplier relationships, so check back often or use the search and sort tools below to find exactly what your formulation needs. Wholesale accounts also get access to sample requests and bulk quote requests directly from any product page, so you can validate a raw material in your lab before committing to a full production order.",
  'Ordering wholesale is different from buying retail sizes, and a few things are worth knowing before you place a first order. Pricing is quoted per unit at each pack size, so the per-kilo or per-gallon cost falls as the size increases — a drum is almost always materially cheaper per unit than the equivalent volume bought in gallons. Where a material is sold by drum, the listing prices it by drum count rather than by weight, because freight for drum shipments is quoted on pallet space rather than parcel weight.',
  'Every listing carries the identifiers a formulator needs to verify what they are buying: the INCI name as it should appear on a finished-product label, the CAS number where one applies, and the botanical source name for plant-derived materials. Matching on INCI rather than trade name matters, because the same INCI can be supplied at very different grades, and two suppliers\' marketing names for the same material rarely agree. Specification rows on each product page list the physical properties that affect how a material behaves in a batch, such as appearance, melting behaviour and typical usage range.',
  'Certificates of Analysis and Safety Data Sheets are available on request for any material we stock, and we recommend requesting both before scaling a formula from bench to production. If you need a specific grade, a particular certification, or a lot-size we do not list, send a quote request with the volume and timing you have in mind and our team will confirm availability and pricing directly rather than making you guess from a catalogue page.',
  'Lead times depend on whether a material is held in stock or brought in to order. Anything showing as in stock ships from our US warehouse, and shipping is rated by weight and destination zone at checkout so the cost you see is the cost you pay. Larger drum orders and shipments to Alaska, Hawaii and the US territories are quoted manually, because freight on those routes is not something a rate table can price honestly.',
    `Shipping is calculated at checkout from the combined weight of the cart and the destination state, using a fixed zone table rather than an estimate that changes after you order. Orders over the free-shipping threshold ship at no cost within the contiguous United States. Alaska, Hawaii, the District of Columbia and the US territories are not priced from that table — freight to those destinations depends on carrier and routing, so checkout asks you to contact us for a quote instead of showing a number we cannot honour. The same applies to drum freight, which moves on pallets rather than as parcels.`,
    `If you are ordering for the first time, it is worth requesting bench quantities of anything you have not run before, even where the specification looks like a direct match for a material you already use. Grades vary between suppliers within the same INCI, and small differences in melting behaviour, colour or odour can matter more in a finished product than they appear to on paper. Once a material is qualified in your process, larger pack sizes and drum quantities bring the per-unit cost down substantially.`,];

const DEFAULT_METADATA: Metadata = {
  title: 'All Wholesale Cosmetic Ingredients',
  description:
    'Browse the full wholesale cosmetic ingredient catalog — carrier oils, butters, waxes, emulsifiers, surfactants and actives in bulk and drum sizes, with trade pricing.',
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/products')}`, {
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
    path: '/products',
    keywords: [
      'wholesale cosmetic ingredients catalog',
      'bulk cosmetic ingredients list',
      'buy cosmetic raw materials online',
      'cosmetic ingredient price list',
      'bulk ingredients by the gallon',
      'drum quantity cosmetic ingredients',
    ],
    images: [seo?.ogImageUrl],
  });
}

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Catalog</p>
      <h1 className="mt-1 font-display text-4xl text-ink">
        Wholesale Cosmetic Ingredients Catalog
      </h1>

      <SeoIntro highlights={HIGHLIGHTS} paragraphs={INTRO_PARAGRAPHS} />

      <div className="mt-10">
        <ProductFilterGrid />
      </div>
      {/* Server-rendered: the product grid above is client-side, so
          without this the page ships no images and almost no catalog
          links in its HTML. */}
      <CategoryStrip
        heading="Browse by Category"
        description="Jump straight into a material type — each category lists its available pack sizes and current stock."
      />
    </div>
  );
}
