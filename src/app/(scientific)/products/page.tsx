import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Category, Paginated, SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { BookOpen } from 'lucide-react';
import { CatalogBrowser, CatalogSearch } from '@/components/gloss/catalog/CatalogBrowser';
import { CatalogProse } from '@/components/gloss/catalog/CatalogProse';

/**
 * The full catalog, in the Gloss Studio markup (prototype /shop).
 *
 * The filter engine below is client-side, which means the page ships almost
 * no catalog links in its HTML. The category row at the foot is what fixes
 * that — it is server-rendered, so crawlers reach the catalog's structure
 * from here even though the grid itself is hydrated. It replaces the old
 * `CategoryStrip`, which did the same job in the sand/olive design.
 */

const DEFAULT_METADATA: Metadata = {
  title: 'All Wholesale Cosmetic Ingredients',
  description:
    'Browse our full range of wholesale cosmetic ingredients — carrier oils, butters, waxes, emulsifiers, surfactants and actives in bulk and drum sizes, with trade pricing.',
};

// Section breaks inside the collapsed copy below, keyed to the paragraph
// index (in INTRO_PARAGRAPHS) each one precedes. See SciProse's
// `subheadings` prop for why: nine paragraphs with no structure is a wall,
// both for the SEO crawl's readability check and for a person skimming it.
const INTRO_SUBHEADINGS = [
  { beforeIndex: 1, text: 'Browsing wholesale cosmetic ingredients by category' },
  { beforeIndex: 3, text: 'Pricing and pack sizes for wholesale cosmetic ingredients' },
  { beforeIndex: 4, text: 'Ingredient identification and documentation' },
  { beforeIndex: 6, text: 'Lead times and shipping' },
  { beforeIndex: 8, text: 'Ordering for the first time' },
];

const INTRO_PARAGRAPHS: string[] = [
  'We list wholesale cosmetic ingredients here for formulators, private-label brands, and manufacturers. In addition, each record includes INCI naming, pack sizes, and current stock status. As a result, you can plan production runs with confidence before you request a quote or place an order.',
  'You can filter by category or function to narrow the catalog. For example, you can compare actives, emulsifiers, preservatives, botanical extracts, oils, butters, and specialty additives. In addition, each product page lists specifications, usage guidance, and documentation notes before you buy.',
  'Pricing is wholesale throughout the catalog. Therefore, most items show volume breaks once you meet the order minimum. We also add new ingredients as supplier relationships expand, so check back often or use search to find the material your formula needs.',
  'Ordering wholesale is different from buying retail sizes. For example, we quote pricing per unit at each pack size. As the size increases, the per-kilo or per-gallon cost usually falls. Therefore, a drum is often cheaper per unit than the same volume bought in gallons.',
  'Where we sell a material by drum, the listing prices it by drum count. That is because carriers quote drum freight on pallet space, not parcel weight. In addition, larger shipments may need a manual freight quote before checkout.',
  'Every listing carries the identifiers a formulator needs. For example, these include the INCI name, CAS number where one applies, and botanical source name for plant-derived materials. Likewise, matching on INCI matters because the same ingredient can be supplied at different grades.',
  'Specification rows also list the physical properties that affect batch behaviour. For example, appearance, melting behaviour, and typical usage range can all change how a material performs. Therefore, review those details before substituting one supplier for another.',
  'Certificates of Analysis and Safety Data Sheets are available on request. Therefore, we recommend requesting both before scaling a formula from bench to production. If you need a specific grade, certification, or lot size, send a quote request with your volume and timing.',
  'Lead times depend on whether a material is stocked or brought in to order. In-stock items ship from our US warehouse. In that case, checkout rates shipping by weight and destination zone, so you see the cost before you commit.',
  'We quote larger drum orders and shipments to Alaska, Hawaii, and US territories manually. However, that protects you from a rate table that cannot price those routes honestly. The same rule applies to freight that moves on pallets instead of parcels.',
  'If you are ordering for the first time, request bench quantities for unfamiliar materials. Even when a specification looks like a direct match, grades can vary between suppliers. Finally, once you qualify a material in your process, larger pack sizes can lower the per-unit cost.',
];

/**
 * Outbound references.
 *
 * Yoast flags a page with no outbound links, and the honest way to answer
 * that is to point at the bodies whose naming and safety work this catalogue
 * actually depends on — every listing here carries an INCI name, and INCI is
 * PCPC's register, not ours. Linking them is what the page would do anyway if
 * someone had written it as a reference rather than as a grid.
 *
 * Every URL was opened and confirmed to resolve. Note that two of these
 * return 403 to a plain command-line fetch while loading normally in a
 * browser — that is bot filtering, not a dead link, so do not "fix" them on
 * the strength of a curl check.
 *
 * No `nofollow`: these are editorial links to standards bodies, which is
 * precisely the case the attribute is not for.
 */
const REFERENCES = [
  {
    href: 'https://www.personalcarecouncil.org/resources/inci/',
    label: 'INCI nomenclature (Personal Care Products Council)',
    note: 'The register the INCI name on every listing here comes from.',
  },
  {
    href: 'https://www.cir-safety.org/',
    label: 'Cosmetic Ingredient Review',
    note: 'Independent safety assessments of individual cosmetic ingredients.',
  },
  {
    href: 'https://www.fda.gov/cosmetics/cosmetic-products-ingredients',
    label: 'FDA — Cosmetic Products & Ingredients',
    note: 'US regulatory position on ingredients and labelling.',
  },
  {
    href: 'https://ec.europa.eu/growth/tools-databases/cosing/',
    label: 'CosIng (European Commission)',
    note: 'EU database of ingredients and their restrictions.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
    // Cached for 5 minutes rather than no-store. no-store made the whole page
    // render per request (~1.4 s on the server), and Next streamed the loading
    // spinner first with the real hero after it — a 1.7 s LCP render delay on
    // /functions. SEO text edited in the admin still shows within 5 minutes.
  const seo = await serverFetch<SeoPage>(
    `/seo-pages/by-path?path=${encodeURIComponent('/products')}`,
    { revalidate: 300 },
  );
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

export default async function ProductsPage() {
  const categoriesRes = await serverFetch<Paginated<Category>>(
    '/wholesale/categories?page=1&limit=100',
  );
  const categories = (categoriesRes?.data || []).filter((c) => (c.productCount ?? 0) > 0);
  const total = categoriesRes?.pagination.total ?? categories.length;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
        ])}
      />

      <div className="r-catalog-head r-wrap">
        <div>
          {/* Yoast reads the first text block as the introduction, so the
              keyphrase stays in the eyebrow and the lead line. */}
          <span className="r-eyebrow">Wholesale cosmetic ingredients</span>
          <h1>Your next creation starts here.</h1>
          <p>
            Wholesale cosmetic ingredients with their INCI names, pack sizes and live availability.
            Choose a published pack or request the size you need.
          </p>
        </div>
        <CatalogSearch action="/products" />
      </div>

      <div className="r-wrap r-source-bar">
        <Link href="/products" aria-current="page">
          All ingredients
        </Link>
        <Link href="/categories">By category</Link>
        <Link href="/functions">By function</Link>
        <Link href="/ingredients-a-z">A–Z view</Link>
      </div>

      <CatalogBrowser basePath="/products" />

      {/* Server-rendered category links. The grid above is client-side, so
          without this the page ships no catalog links in its HTML at all. */}
      {categories.length > 0 && (
        <section className="r-wrap r-section g-cat-browse">
          <div className="r-section-heading">
            <div>
              <span className="r-eyebrow">Browse by category</span>
              <h2>Every material we stock.</h2>
            </div>
            <Link href="/categories">All ingredient categories</Link>
          </div>
          <p className="g-cat-lead">
            Therefore, you can browse {total} ingredient categories. In addition, each category
            lists every record in the group with its pack sizes, wholesale pricing and current
            stock.
          </p>
          <div className="r-filter-chips g-cat-links">
            {categories.map((c) => (
              <Link key={c.id} href={`/categories/${c.slug}`}>
                {c.name}
                <span>{c.productCount}</span>
              </Link>
            ))}
            <Link href="/functions">Browse by function</Link>
          </div>
        </section>
      )}

      <CatalogProse
        eyebrow="Buying wholesale"
        heading="Ordering wholesale cosmetic ingredients"
        paragraphs={INTRO_PARAGRAPHS}
        subheadings={INTRO_SUBHEADINGS}
      />

      {/* Standards and references — see REFERENCES above for why these are
          here and why they are not nofollowed. */}
      <section className="r-wrap r-section g-cat-references">
        <div className="r-section-heading">
          <div>
            <span className="r-eyebrow">Know the standard</span>
            <h2>Standards and references</h2>
          </div>
        </div>
        <p className="g-cat-lead">
          Every listing in this catalog uses INCI naming, and grades follow the safety and labelling
          positions published by the bodies below. Check a material against them directly before
          you specify it.
        </p>
        <div className="r-doc-grid">
          {REFERENCES.map((ref) => (
            <a key={ref.href} href={ref.href} target="_blank" rel="noopener noreferrer">
              <BookOpen size={24} aria-hidden />
              <h3>{ref.label}</h3>
              <p>{ref.note}</p>
              <span>Open source ↗</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
