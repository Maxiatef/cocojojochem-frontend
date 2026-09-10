import Link from 'next/link';
import { serverFetch } from '@/lib/serverFetch';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Reveal } from '@/components/storefront/Reveal';
import { NewsletterForm } from '@/components/storefront/NewsletterForm';
import { formatUsd, getDefaultVariant, getPriceRange } from '@/lib/pricing';
import {
  Category,
  Certification,
  Paginated,
  Product,
  ProductFunction,
  SeoPage,
  Testimonial,
} from '@/lib/types';
import { Metadata } from 'next';
import { JsonLd, organizationSchema, webSiteSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import {
  ArrowRightIcon,
  BottleIcon,
  BoxIcon,
  ClockIcon,
  DropletIcon,
  FlaskIcon,
  GlobeIcon,
  HeartIcon,
  LeafIcon,
  MailIcon,
  QuoteIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@/components/icons';

// The home page is the one route whose <title> should NOT get the "| BRAND"
// template applied, because the brand already leads the title. `absolute`
// opts out of the root template.
const HOME_TITLE = 'Wholesale Cosmetic Ingredients in Bulk';
const HOME_DESCRIPTION =
  'Wholesale cosmetic ingredients for brands, formulators and manufacturers — carrier oils, butters, waxes, emulsifiers, surfactants and actives in bulk and drum sizes. Trade pricing and INCI data.';

const HOME_KEYWORDS = [
  'wholesale cosmetic ingredients supplier USA',
  'buy cosmetic ingredients in bulk',
  'bulk cosmetic ingredients for manufacturers',
  'cosmetic ingredient distributor',
  'bulk raw materials skincare',
  'drum quantity cosmetic ingredients',
  'trade pricing cosmetic ingredients',
  'wholesale carrier oils butters waxes',
  'bulk emulsifiers and surfactants',
  'cosmetic actives and peptides wholesale',
];

export async function generateMetadata(): Promise<Metadata> {
  // Per-path overrides from the admin SEO manager. SeoPagesModule is
  // currently disabled server-side, so this 404s and serverFetch returns
  // null — the defaults below then apply unchanged.
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/')}`, {
    cache: 'no-store',
  });

  const meta = pageMetadata({
    title: seo?.metaTitle || HOME_TITLE,
    description: clampDescription(seo?.metaDescription, HOME_DESCRIPTION),
    path: '/',
    keywords: HOME_KEYWORDS,
    images: [seo?.ogImageUrl],
  });

  return { ...meta, title: { absolute: `${SITE_NAME} — ${seo?.metaTitle || HOME_TITLE}` } };
}

function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('acid') || n.includes('active') || n.includes('peptide') || n.includes('vitamin')) return FlaskIcon;
  if (n.includes('oil') || n.includes('hydrosol') || n.includes('mist') || n.includes('glycerin')) return DropletIcon;
  if (n.includes('butter') || n.includes('wax') || n.includes('base') || n.includes('bulk')) return BoxIcon;
  if (n.includes('surfactant') || n.includes('cleanser') || n.includes('shampoo') || n.includes('scrub')) return SparklesIcon;
  if (n.includes('organic') || n.includes('natural')) return LeafIcon;
  return BottleIcon;
}

const WHY_US = [
  { icon: LeafIcon, title: 'Sourced With Intention', body: 'Every raw material is chosen for purity and traceability, not just cost.' },
  { icon: ShieldCheckIcon, title: 'Documentation, Ready', body: 'SDS and COA paperwork accompanies the ingredients that need it.' },
  { icon: FlaskIcon, title: 'Formulator-Grade Purity', body: 'INCI-accurate, consistent lot to lot, order after order.' },
  { icon: HeartIcon, title: 'Cruelty-Free, Always', body: 'None of our ingredients are tested on animals — ever.' },
];

const CAPABILITIES = [
  { icon: ShieldCheckIcon, label: 'GMP-Aligned Sourcing' },
  { icon: ClockIcon, label: 'Fast Order Fulfillment' },
  { icon: GlobeIcon, label: 'Nationwide Shipping' },
  { icon: FlaskIcon, label: 'Real INCI Documentation' },
];

export default async function HomePage() {
  const [categoriesRes, functionsRes, featured, certifications, testimonials] = await Promise.all([
    serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=8'),
    serverFetch<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=200'),
    serverFetch<Product[]>('/wholesale/products/featured?limit=8'),
    serverFetch<Certification[]>('/wholesale/certifications'),
    serverFetch<Testimonial[]>('/wholesale/testimonials'),
  ]);

  const categories = categoriesRes?.data || [];
  const functions = functionsRes?.data || [];
  const spotlight = featured?.[0];
  const spotlightVariant = spotlight ? getDefaultVariant(spotlight.variants) : null;
  const spotlightRange = spotlight ? getPriceRange(spotlight.variants) : null;

  return (
    <div>
      {/* Identifies the business and the site itself. The WebSite node's
          SearchAction is what can earn a search box inside Google's result
          for branded queries. */}
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-sand-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-gradient-to-br from-olive-300/50 via-sand-300/60 to-transparent blur-2xl"
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-olive-600">Wholesale Ingredient Supply</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
              Formulator-Grade
              <br />
              <span className="italic text-olive-700">Ingredients</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
              Real INCI documentation, transparent bulk pricing, and consistent quality — sourced
              for brands and labs that can't afford to guess.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href="/products"
                className="bg-olive-800 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-olive-700"
              >
                Shop Products
              </Link>
              <Link
                href="/categories"
                className="border-b border-ink pb-0.5 text-sm font-medium text-ink transition hover:border-olive-700 hover:text-olive-700"
              >
                Browse Categories
              </Link>
            </div>
          </Reveal>

          <div className="relative">
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden bg-gradient-to-br from-olive-600 via-olive-800 to-ink shadow-xl">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <div className="absolute left-1/4 top-1/3 h-40 w-40 rounded-full bg-sand-100/60 blur-2xl" />
                <div className="absolute bottom-10 right-8 h-28 w-28 rounded-full bg-olive-300/70 blur-2xl" />
              </div>
              <DropletIcon className="absolute bottom-10 left-1/2 h-16 w-16 -translate-x-1/2 text-white/25" />
            </div>

            {spotlight && spotlightVariant && (
              <Link
                href={`/products/${spotlight.slug}`}
                className="group absolute -bottom-6 -left-4 flex items-center gap-3 bg-white px-4 py-3 shadow-lg sm:-left-10"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-sand-100 text-olive-700">
                  <FlaskIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink-soft">{spotlight.category?.name}</p>
                  <p className="text-sm font-medium text-ink group-hover:text-olive-700">{spotlight.name}</p>
                  <p className="text-xs text-ink-soft">
                    {spotlightRange ? formatUsd(spotlightRange.min) : 'Contact for price'}
                  </p>
                </div>
                <ArrowRightIcon className="ml-2 h-4 w-4 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-olive-700" />
              </Link>
            )}
          </div>
        </div>

        {/* ── Capability strip ── */}
        <div className="relative border-t border-sand-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-sand-200 sm:divide-y-0 md:grid-cols-4">
            {CAPABILITIES.map((cap) => (
              <div key={cap.label} className="flex flex-col items-center gap-2 px-4 py-7 text-center">
                <cap.icon className="h-5 w-5 text-olive-600" />
                <p className="text-xs font-medium text-ink-soft">{cap.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Catalog</p>
              <h2 className="mt-1 font-display text-3xl text-ink">Shop by Category</h2>
            </div>
            <Link href="/categories" className="text-sm font-medium text-olive-700 hover:underline">
              View all →
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-px bg-sand-200 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((c, i) => {
              const Icon = categoryIcon(c.name);
              return (
                <Reveal key={c.id} delay={i * 40}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="group flex h-full flex-col items-center gap-3 bg-white p-7 text-center transition hover:bg-sand-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center bg-sand-100 text-olive-700 transition group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-ink group-hover:text-olive-700">{c.name}</p>
                      {typeof c.productCount === 'number' && (
                        <p className="mt-0.5 text-xs text-ink-soft">{c.productCount} products</p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Shop by Function ── */}
      {functions && functions.length > 0 && (
        <section className="bg-sand-100 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Targeted Formulation</p>
              <h2 className="mt-1 font-display text-3xl text-ink">Shop by Chemical Function</h2>
              <p className="mt-2 max-w-xl text-sm text-ink-soft">
                Find the exact functional role your formulation calls for — humectant, emulsifier,
                antioxidant, and more.
              </p>
            </Reveal>
            <Reveal className="flex flex-wrap gap-2">
              {functions.slice(0, 18).map((f) => (
                <Link
                  key={f.id}
                  href={`/products?functionSlug=${f.slug}`}
                  className="border border-sand-300 bg-white px-4 py-2 text-sm text-ink transition hover:border-olive-600 hover:text-olive-700"
                >
                  {f.name}
                </Link>
              ))}
              <Link
                href="/functions"
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-olive-700 hover:underline"
              >
                See all functions <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Editorial line ── */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <Reveal>
          <p className="font-display text-2xl italic leading-snug text-ink sm:text-3xl">
            Formulate boldly, source responsibly, scale confidently.
          </p>
        </Reveal>
      </section>

      {/* ── Why choose us ── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="h-full bg-white p-7">
                <div className="flex h-10 w-10 items-center justify-center bg-sand-100 text-olive-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Certifications ── */}
      {certifications && certifications.length > 0 && (
        <section className="border-y border-sand-200 bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-center gap-2 text-ink-soft">
                  <ShieldCheckIcon className="h-4 w-4 text-olive-600" />
                  <span className="text-sm font-medium">{cert.name}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {featured && featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Featured</p>
              <h2 className="mt-1 font-display text-3xl text-ink">Featured Ingredients</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-olive-700 hover:underline">
              View all →
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 40}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {testimonials && testimonials.length > 0 && (
        <section className="bg-sand-100 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="mx-auto mb-10 max-w-xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Testimonials</p>
              <h2 className="mt-1 font-display text-3xl text-ink">What Our Customers Say</h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t, i) => (
                <Reveal key={t.id} delay={i * 100}>
                  <div className="flex h-full flex-col bg-white p-7">
                    <QuoteIcon className="h-6 w-6 text-olive-300" />
                    <p className="mt-3 flex-1 font-display text-lg italic leading-relaxed text-ink">"{t.quote}"</p>
                    <div className="mt-5 flex items-center gap-3 border-t border-sand-200 pt-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-100 text-sm font-semibold text-olive-700">
                        {t.authorName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{t.authorName}</p>
                        {t.company && <p className="text-xs text-ink-soft">{t.company}</p>}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How wholesale ordering works ──
          Substantive buyer-facing copy. The home page carried only ~246
          words of indexable body text (nav/header/footer are excluded from
          the count), which is thin for a commercial landing page and scores
          poorly in the SEO analyzer's word-count band. This is real
          purchasing guidance, not filler. */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">
            Buying Wholesale
          </p>
          <h2 className="mt-1 font-display text-3xl text-ink">
            How ordering wholesale ingredients works
          </h2>
        </div>

        <div className="mt-10 grid gap-x-12 gap-y-10 text-sm leading-relaxed text-ink-soft md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-ink">Pricing scales with pack size</h3>
            <p>
              Every material is quoted per unit at each pack size, so the cost per kilo or per gallon
              falls as the size increases. A drum is almost always materially cheaper per unit than the
              same volume bought in gallons. Where a material is sold by drum, the listing prices it per
              drum rather than per kilo, because freight on drum shipments is quoted on pallet space
              rather than parcel weight. There is a minimum order value at checkout, since this is a
              trade catalogue rather than a retail one.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-ink">Verify on INCI, not trade name</h3>
            <p>
              Naming in this industry is inconsistent — the same material is sold under several trade
              names, and the same trade name occasionally covers materially different grades. Every
              listing carries the INCI name as it should appear on a finished-product label, the CAS
              number where one applies, and the botanical source for plant-derived materials. Matching
              on those rather than on a marketing name is what stops a substitution failing in
              production.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-ink">Documentation on request</h3>
            <p>
              Certificates of Analysis and Safety Data Sheets are available for anything we stock. We
              recommend requesting both before scaling a formula from bench to production, and keeping
              the COA for the specific lot you received on file. If you need a particular grade, a
              certification we do not list, or a pack size outside the standard range, send a quote
              request with your volume and timing rather than assuming it is unavailable.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-ink">Stock, lead times and freight</h3>
            <p>
              Anything showing as in stock ships from our US warehouse. Shipping is rated by cart weight
              and destination zone at checkout, so the figure you see is the figure you pay. Materials
              brought in to order carry a lead time we confirm on quote. Drum freight, and shipments to
              Alaska, Hawaii and the US territories, are quoted manually — those routes cannot be priced
              honestly from a rate table, so our team confirms them directly instead of guessing.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-ink">Find materials by problem, not name</h3>
            <p>
              Most formulation questions present as a behaviour rather than a material: a cream that
              separates needs an emulsifier or stabiliser, a cleanser that strips needs a milder
              surfactant blend, a serum that dries down tight needs its humectant load rebalanced
              against the occlusives. Browsing by function groups every material that addresses the same
              problem, which makes substitution and cost engineering far quicker than working down a
              single supplier&apos;s product list.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-ink">Samples and first orders</h3>
            <p>
              We would rather you trial a material at bench scale than commit to a drum on
              specification alone. If you are evaluating several candidates for the same role, request a
              quote listing all of them and we will price them together so the comparison is on
              like-for-like terms. Repeat and contract volumes are priced against commitment rather than
              from the standard table — talk to the sales team once your usage is predictable.
            </p>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section
        className="relative overflow-hidden bg-olive-950 py-20"
        style={{ backgroundColor: '#1c2216' }}
      >
        <LeafIcon className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-white/[0.04]" />
        <LeafIcon className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rotate-[160deg] text-white/[0.03]" />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <MailIcon className="h-5 w-5 text-olive-300" />
          </div>
          <h2 className="mt-6 font-display text-4xl text-white">
            Stay Updated, <span className="italic text-olive-300">Stay Ready</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-sand-100/60">
            Restock alerts, bulk supply notes, and manufacturing updates — straight to your inbox.
          </p>

          <div className="mt-8 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
