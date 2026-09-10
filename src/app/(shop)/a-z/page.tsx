import Link from 'next/link';
import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { CategoryStrip } from '@/components/storefront/CategoryStrip';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { SeoPage } from '@/lib/types';
import { SeoIntro } from '@/components/storefront/SeoIntro';

const HIGHLIGHTS = [
  { icon: 'grid' as const, label: 'Every Ingredient, One List' },
  { icon: 'search' as const, label: 'Jump to Any Letter' },
  { icon: 'tag' as const, label: 'Common & INCI Names' },
  { icon: 'clock' as const, label: 'Updated as We Add Stock' },
];

const INTRO_PARAGRAPHS = [
  "Every wholesale ingredient we carry, listed alphabetically by product name for quick reference. This index is the fastest way to jump straight to a specific raw material if you already know its name, rather than browsing by category or function — useful when you're cross-checking a formulation sheet, restocking a known SKU, or comparing our catalog against a supplier list.",
  "Use the letter navigation below to skip to any section, or use your browser's search (Ctrl/Cmd+F) to find an ingredient by its common or INCI name. Each entry links through to a full product page with specifications, available pack sizes, pricing, and current stock status. If you can't find an ingredient you're looking for, reach out to our sales team — we regularly add new materials as supplier relationships expand.",
  'This index lists every cosmetic ingredient we currently stock, alphabetically by product name, so you can confirm availability without working through filters. It is the fastest route if you already know what you need — searching by name here is quicker than narrowing the catalogue by category and function.',
  'If a material you are looking for is not listed, that does not necessarily mean we cannot supply it. The index reflects what is currently held and published; we regularly source materials to order for customers with defined volume and timing. Send a quote request with the INCI name, the grade you need and your expected annual usage, and we will confirm whether we can supply it and at what price.',
  'Names in this industry are inconsistent, so search by INCI name where you can. The same material may be sold under several trade names, and the same trade name is occasionally used for materially different grades. Each product page lists the INCI name, the CAS number where applicable and the botanical source, so you can verify a match before ordering rather than after.',
  'Prices shown across the catalogue are wholesale trade prices and assume a business purchase. There is a minimum order value for checkout, and volume pricing improves at larger pack sizes and drum quantities. For blanket orders, scheduled releases or contract volumes, contact the sales team directly — those are priced against commitment rather than from the standard table.',
    `Stock positions shown across the catalogue reflect what is published and available at the time the page is generated. Material moves, so if you are planning a production run several weeks out it is worth confirming quantities with the sales team rather than relying on a listing checked earlier. For predictable repeat usage we can hold material against a blanket order and release it to a schedule, which takes both the stock risk and the price movement out of your planning.`,
    `Shipping is calculated at checkout from combined cart weight and destination state, using a fixed zone table, so the figure shown is the figure charged. Orders above the free-shipping threshold ship free within the contiguous United States. Alaska, Hawaii, the District of Columbia and the US territories are quoted manually, as is anything moving as drum freight on pallets, because freight on those routes genuinely cannot be priced from a weight table.`,
    `Where a material is not currently held, that is not the end of the conversation. A meaningful share of what we ship is sourced to order against a customer's specification. Send the INCI name, the grade and certification you need, your expected annual volume and the timing, and we will confirm whether we can supply it and at what price rather than leaving you to infer availability from a catalogue page.`,
    `Pack sizes are shown on each product page and vary by material type. Fast-moving liquids are generally offered from a gallon through to a drum, while actives and peptides are sold in far smaller weights because they are used at very low concentrations. Certificates of Analysis and Safety Data Sheets are available on request for anything we stock.`,];

const DEFAULT_METADATA: Metadata = {
  title: 'A-Z Ingredient Index',
  description:
    'An A-Z index of every cosmetic ingredient we stock wholesale, listed alphabetically by name with INCI data — the fastest way to find a specific raw material.',
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/a-z')}`, {
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
    path: '/a-z',
    keywords: [
      'cosmetic ingredients A-Z',
      'ingredient index INCI',
      'alphabetical ingredient list',
      'find cosmetic ingredient by name',
      'INCI name lookup',
    ],
    images: [seo?.ogImageUrl],
  });
}

type AZGroup = Record<string, { id: number; name: string; slug: string }[]>;

const ALPHABET = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

export default async function AZIndexPage() {
  const grouped = (await serverFetch<AZGroup>('/wholesale/products/az-index')) || {};
  const available = new Set(Object.keys(grouped));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Full Catalog</p>
      <h1 className="mt-1 font-display text-4xl text-ink">
        A-Z Index of Wholesale Ingredients
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Every wholesale product, alphabetically.</p>

      <SeoIntro highlights={HIGHLIGHTS} paragraphs={INTRO_PARAGRAPHS} />

      <div className="sticky top-20 z-10 mt-8 flex flex-wrap gap-1.5 border-y border-sand-200 bg-sand-50 py-3">
        {ALPHABET.map((letter) =>
          available.has(letter) ? (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="flex h-8 w-8 items-center justify-center text-sm font-medium text-olive-700 hover:bg-olive-100"
            >
              {letter}
            </a>
          ) : (
            <span
              key={letter}
              className="flex h-8 w-8 items-center justify-center text-sm text-sand-400"
            >
              {letter}
            </span>
          ),
        )}
      </div>

      {available.size === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No products found.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {ALPHABET.filter((l) => available.has(l)).map((letter) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-32">
              <h2 className="mb-3 border-b border-sand-200 pb-2 font-display text-xl text-ink">
                {letter}
              </h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 md:grid-cols-3">
                {grouped[letter].map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="truncate py-1 text-sm text-ink-soft hover:text-olive-700 hover:underline"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <CategoryStrip heading="Browse by Category" />
    </div>
  );
}
