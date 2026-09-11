import Link from 'next/link';
import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Paginated, ProductFunction, SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { SciProse } from '@/components/scientific/SciProse';
import {
  ArrowLink,
  Container,
  Eyebrow,
  SciButton,
  SectionHeading,
} from '@/components/scientific/primitives';

/**
 * Ingredients by formulation function, in the "Scientific edition" design.
 *
 * There is no Figma frame for this page, so it follows the ingredient catalog
 * (node 33:459) — the closest thing in the design to what it is: a directory
 * of ways into the catalogue, with a navy cross-link panel and the quote band.
 *
 * The one structural departure from the page it replaces: of 94 functions,
 * only about a third currently have any published material. The old page
 * linked all of them into a filtered catalogue, so roughly sixty of those
 * links led to an empty result set. They are still listed — they are real
 * formulation vocabulary and worth indexing — but as plain text under their
 * own heading, pointing at a quote request rather than at nothing.
 */

const DEFAULT_METADATA: Metadata = {
  title: 'Shop Ingredients by Function',
  description:
    'Find cosmetic ingredients by what they do — emulsifiers, humectants, preservatives, antioxidants, thickeners and actives, available wholesale in bulk quantities.',
};

const INTRO_PARAGRAPHS: string[] = [
  `Choosing an ingredient by function is usually faster than choosing by name, because most formulation problems present as a behaviour rather than a material. A cream that separates needs an emulsifier or a stabiliser, not a specific botanical. A cleanser that strips needs a milder surfactant blend. A serum that dries down tight needs its humectant load adjusted against the occlusives. Browsing by function surfaces every material we stock that addresses the same problem, which makes substitution and cost engineering far easier than working from one supplier's product names.`,
  `Functional categories overlap in practice, and that is expected. Fatty alcohols such as cetearyl alcohol act as both thickeners and co-emulsifiers, so they appear under both. Many plant oils are simultaneously emollients and sources of specific fatty acids. Several actives also carry preservative-boosting properties at typical use levels. Where a material serves more than one role it is listed under each, so you find it whichever way you approach the problem.`,
  `If you are reformulating to replace a discontinued material or to reduce cost, start from the function the original was performing and compare alternatives on specification rather than on marketing description. Usage range, pH tolerance, melting point and solubility determine whether a substitution will actually survive your process. Each product page lists those properties along with the INCI name and CAS number, so a swap can be verified before it is trialled.`,
  `Counts shown next to each function reflect the materials currently published and in stock. If nothing listed under a function fits your constraints, send a quote request describing the behaviour you need and the volume you expect to use — we regularly source materials to order, and our team can suggest candidates that are not yet in the public catalogue.`,
  `Use levels differ enormously between functional classes, and that is the first thing to check when you are costing a formula. Emulsifiers and thickeners typically work in the low single-digit percentages, surfactants rather higher in a cleanser, and actives and peptides often at a fraction of one percent. A material with a high price per kilo can therefore be cheaper per batch than a bulk ingredient used at twenty times the concentration, so compare the cost contribution at your actual use level rather than the headline price per unit.`,
  `Preservation deserves particular attention. Any formulation containing water needs a preservative system appropriate to its pH and packaging, and the choice interacts with almost everything else in the formula — chelators, surfactants and some botanical extracts all affect how well a system performs. If you are unsure which system suits a formulation, send the pH range, the packaging format and the water content with a quote request, and our team can suggest candidates that are compatible with the rest of your ingredient list.`,
  `Stock positions shown against each function reflect what is published and available now. Availability changes as material moves, so if you are planning a production run some weeks out it is worth confirming quantities rather than relying on a listing you checked earlier.`,
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/functions')}`, {
    cache: 'no-store',
  });
  return pageMetadata({
    title: seo?.metaTitle || (DEFAULT_METADATA.title as string),
    description: clampDescription(seo?.metaDescription, DEFAULT_METADATA.description as string),
    path: '/functions',
    keywords: [
      'ingredients by function',
      'cosmetic emulsifiers wholesale',
      'humectants for skincare',
      'cosmetic preservatives bulk',
      'antioxidants for formulation',
      'thickeners and stabilizers',
    ],
    images: [seo?.ogImageUrl],
  });
}

/** A function with material behind it — compact, because there are dozens. */
function FunctionTile({ fn }: { fn: ProductFunction }) {
  const count = fn.productCount ?? 0;
  return (
    <Link
      href={`/products?functionSlug=${fn.slug}`}
      className="group flex items-center justify-between gap-4 rounded-xl border border-sci-border bg-white px-5 py-4 transition hover:border-sci-blue hover:shadow-sm"
    >
      <span className="min-w-0">
        <span className="block font-sci-body text-[17px] font-medium leading-6 text-sci-navy">
          {fn.name}
        </span>
        <span className="block font-sci-body text-sci-label text-sci-muted">
          {count} {count === 1 ? 'product' : 'products'}
        </span>
      </span>
      <span
        aria-hidden
        className="shrink-0 font-sci-body text-sci-label font-medium text-sci-blue transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

export default async function FunctionsPage() {
  const functionsRes = await serverFetch<Paginated<ProductFunction>>(
    '/wholesale/functions?page=1&limit=300',
  );
  const functions = functionsRes?.data || [];

  const byName = [...functions].sort((a, b) => a.name.localeCompare(b.name));
  const stocked = byName.filter((f) => (f.productCount ?? 0) > 0);
  const unstocked = byName.filter((f) => (f.productCount ?? 0) === 0);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Functions', path: '/functions' },
          ]),
          ...(stocked.length
            ? [
                itemListSchema({
                  name: 'Cosmetic Ingredients by Formulation Function',
                  path: '/functions',
                  items: stocked.map((f) => ({
                    name: f.name,
                    path: `/products?functionSlug=${f.slug}`,
                  })),
                }),
              ]
            : []),
        ]}
      />

      {/* Introduction */}
      <section className="bg-sci-pale py-16">
        <Container className="flex flex-col gap-6">
          <Eyebrow>Targeted formulation</Eyebrow>

          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[64px] md:leading-[72px]">
            Find it by what it does.
          </h1>

          <p className="font-sci-body text-sci-label font-medium text-sci-navy">
            {stocked.length} {stocked.length === 1 ? 'function' : 'functions'} with material in
            stock · {functions.length} indexed · A–Z
          </p>

          <p className="max-w-[900px] font-sci-body text-sci-body text-sci-muted">
            Most formulation problems present as a behaviour rather than a material — a cream that
            separates, a cleanser that strips, a serum that dries down tight. Browsing by function
            surfaces every material we stock that addresses the same problem, which makes
            substitution and cost engineering far easier than working from trade names.
          </p>
        </Container>
      </section>

      {/* The functions themselves */}
      <section className="bg-white py-16">
        <Container className="flex flex-col gap-6">
          <SectionHeading>Browse by function</SectionHeading>

          {stocked.length === 0 ? (
            <p className="font-sci-body text-sci-body text-sci-muted">No functions found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stocked.map((f) => (
                <FunctionTile key={f.id} fn={f} />
              ))}
            </div>
          )}

          {/* Vocabulary we index but have no published material against today.
              Listed as text rather than links: each one would otherwise open a
              filtered catalogue with nothing in it. */}
          {unstocked.length > 0 && (
            <div className="mt-6 flex flex-col gap-4 border-t border-sci-border pt-8">
              <h3 className="font-sci-heading text-sci-subheading font-semibold text-sci-navy">
                Also indexed, sourced to order
              </h3>
              <p className="max-w-[900px] font-sci-body text-sci-body text-sci-muted">
                {unstocked.length} further functions have no published material in the catalogue
                right now. A significant share of what we ship is sourced to order against a
                customer&rsquo;s specification — tell us the behaviour you need and we will confirm
                what we can supply.
              </p>
              <ul className="flex flex-wrap gap-2">
                {unstocked.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-full border border-sci-border bg-sci-pale px-3 py-1 font-sci-body text-sci-label text-sci-muted"
                  >
                    {f.name}
                  </li>
                ))}
              </ul>
              <ArrowLink href="/quote-request">Ask about a function</ArrowLink>
            </div>
          )}

          {/* The catalogue's other two indexes. */}
          <div className="mt-6 flex flex-col gap-6 bg-sci-navy p-10 text-white">
            <h2 className="font-sci-heading text-[32px] font-semibold leading-[40px] md:text-sci-heading">
              Every material, indexed.
            </h2>
            <p className="max-w-[900px] font-sci-body text-sci-body">
              Functions group materials by the job they do in a formulation. Browse by category to
              find them by what they physically are, or work straight down the A-Z if you already
              know the INCI name.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <ArrowLink href="/categories" tone="white">
                Browse by category
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
        eyebrow="Formulating by function"
        heading="Choosing a function"
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
