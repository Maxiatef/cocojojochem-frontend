import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Category, Paginated, SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { SciProse } from '@/components/scientific/SciProse';
import { ProductCatalog } from '@/components/scientific/ProductCatalog';
import {
  ArrowLink,
  Container,
  Eyebrow,
  SciButton,
  SectionHeading,
} from '@/components/scientific/primitives';

/**
 * The full catalog, in the Scientific edition.
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
    'Browse the full wholesale cosmetic ingredient catalog — carrier oils, butters, waxes, emulsifiers, surfactants and actives in bulk and drum sizes, with trade pricing.',
};

const INTRO_PARAGRAPHS: string[] = [
  "Browse our full wholesale catalog of cosmetic and personal care ingredients, sourced and quality-checked for formulators, private-label brands, and manufacturers. Every listing includes INCI naming, available pack sizes, and current stock status so you can plan production runs with confidence, whether you're sourcing a single raw material or building out a complete formulation.",
  'Filter by category or function to narrow the catalog to actives, emulsifiers, preservatives, botanical extracts, oils, butters, and specialty additives. Each product page lists technical specifications, recommended usage rates, and documentation to help you evaluate fit before you order. Pricing is wholesale throughout, with volume-based breaks available on most items once you meet our order minimum.',
  'New ingredients are added regularly as we expand supplier relationships, so check back often or use the search and sort tools above to find exactly what your formulation needs. Wholesale accounts also get access to sample requests and bulk quote requests directly from any product page, so you can validate a raw material in your lab before committing to a full production order.',
  'Ordering wholesale is different from buying retail sizes, and a few things are worth knowing before you place a first order. Pricing is quoted per unit at each pack size, so the per-kilo or per-gallon cost falls as the size increases — a drum is almost always materially cheaper per unit than the equivalent volume bought in gallons. Where a material is sold by drum, the listing prices it by drum count rather than by weight, because freight for drum shipments is quoted on pallet space rather than parcel weight.',
  "Every listing carries the identifiers a formulator needs to verify what they are buying: the INCI name as it should appear on a finished-product label, the CAS number where one applies, and the botanical source name for plant-derived materials. Matching on INCI rather than trade name matters, because the same INCI can be supplied at very different grades, and two suppliers' marketing names for the same material rarely agree. Specification rows on each product page list the physical properties that affect how a material behaves in a batch, such as appearance, melting behaviour and typical usage range.",
  'Certificates of Analysis and Safety Data Sheets are available on request for any material we stock, and we recommend requesting both before scaling a formula from bench to production. If you need a specific grade, a particular certification, or a lot-size we do not list, send a quote request with the volume and timing you have in mind and our team will confirm availability and pricing directly rather than making you guess from a catalogue page.',
  'Lead times depend on whether a material is held in stock or brought in to order. Anything showing as in stock ships from our US warehouse, and shipping is rated by weight and destination zone at checkout so the cost you see is the cost you pay. Larger drum orders and shipments to Alaska, Hawaii and the US territories are quoted manually, because freight on those routes is not something a rate table can price honestly.',
  'Shipping is calculated at checkout from the combined weight of the cart and the destination state, using a fixed zone table rather than an estimate that changes after you order. Orders over the free-shipping threshold ship at no cost within the contiguous United States. Alaska, Hawaii, the District of Columbia and the US territories are not priced from that table — freight to those destinations depends on carrier and routing, so checkout asks you to contact us for a quote instead of showing a number we cannot honour. The same applies to drum freight, which moves on pallets rather than as parcels.',
  'If you are ordering for the first time, it is worth requesting bench quantities of anything you have not run before, even where the specification looks like a direct match for a material you already use. Grades vary between suppliers within the same INCI, and small differences in melting behaviour, colour or odour can matter more in a finished product than they appear to on paper. Once a material is qualified in your process, larger pack sizes and drum quantities bring the per-unit cost down substantially.',
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(
    `/seo-pages/by-path?path=${encodeURIComponent('/products')}`,
    { cache: 'no-store' },
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

      {/* Page introduction */}
      <section className="bg-sci-pale py-16">
        <Container className="flex flex-col gap-6">
          <Eyebrow>The catalog</Eyebrow>

          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[64px] md:leading-[72px]">
            Every material we stock.
          </h1>

          <p className="max-w-[900px] font-sci-body text-sci-body text-sci-muted">
            Filter by category, function, price or stock status. Every listing carries its INCI
            name, available pack sizes and live availability, so a material can be specified from
            the catalog rather than from a conversation.
          </p>
        </Container>
      </section>

      {/* The catalog itself */}
      <section className="bg-white py-16">
        <Container>
          <ProductCatalog />
        </Container>
      </section>

      {/* Server-rendered category links. The grid above is client-side, so
          without this the page ships no catalog links in its HTML at all. */}
      {categories.length > 0 && (
        <section className="border-t border-sci-border bg-sci-pale py-16">
          <Container className="flex flex-col gap-6">
            <SectionHeading>Browse by category</SectionHeading>
            <p className="max-w-[900px] font-sci-body text-sci-body text-sci-muted">
              {total} ingredient categories. Each one lists every record in the group with its pack
              sizes, wholesale pricing and current stock.
            </p>
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-sci-border bg-white px-4 py-2 font-sci-body text-sci-label text-sci-navy transition hover:border-sci-blue hover:text-sci-blue"
                  >
                    {c.name}
                    <span className="text-sci-muted">{c.productCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <ArrowLink href="/categories">All ingredient categories</ArrowLink>
              <ArrowLink href="/functions">Browse by function</ArrowLink>
            </div>
          </Container>
        </section>
      )}

      <SciProse
        eyebrow="Buying wholesale"
        heading="Ordering from the catalog"
        paragraphs={INTRO_PARAGRAPHS}
      />

      {/* Contact / Request a quote */}
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
