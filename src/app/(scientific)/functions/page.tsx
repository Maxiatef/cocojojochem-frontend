import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Paginated, ProductFunction, SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { categoryImage } from '@/lib/gloss/images';
import { FunctionDirectory } from '@/components/gloss/categories/CategoryDirectory';
import { IndexBand } from '@/components/gloss/categories/IndexBand';
import { LongForm } from '@/components/gloss/categories/LongForm';
import { EmptyState } from '@/components/gloss/EmptyState';

/**
 * Ingredients by formulation function, in the Gloss Studio design.
 *
 * The prototype has no function index, so this follows its `/categories`
 * page: the `r-page-intro` head, then the gloss sheet's `function-directory`
 * tiles (smaller than the category cards, because there are dozens), the
 * library band linking the other indexes, and the long-form copy.
 *
 * Of the ~94 functions only about a third currently have published material.
 * Those are tiles linking to /functions/<slug>; the rest are still listed —
 * they are real formulation vocabulary worth indexing — but as plain text
 * pointing at a quote request rather than at an empty page.
 */

const DEFAULT_METADATA: Metadata = {
  title: 'Shop Ingredients by Function',
  description:
    'Find cosmetic ingredients by what they do — emulsifiers, humectants, preservatives, antioxidants, thickeners and actives, available wholesale in bulk quantities.',
};

const INTRO_PARAGRAPHS: string[] = [
  `Choosing an ingredient by function is usually faster than choosing by name, because most formulation problems present as a behaviour rather than a material. For example, a cream that separates needs an emulsifier or a stabiliser, not a specific botanical. Similarly, a cleanser that strips needs a milder surfactant blend. In addition, a serum that dries down tight needs its humectant load adjusted against the occlusives. Importantly, browsing by function surfaces every material we stock that addresses the same problem. Consequently, this makes substitution and cost engineering far easier than working from one supplier's product names.`,
  `Functional categories overlap in practice, and that is expected. For instance, fatty alcohols such as cetearyl alcohol act as both thickeners and co-emulsifiers, so they appear under both. Moreover, many plant oils are simultaneously emollients and sources of specific fatty acids. Significantly, several actives also carry preservative-boosting properties at typical use levels. Therefore, where a material serves more than one role it is listed under each. As a result, you find it whichever way you approach the problem.`,
  `If you are reformulating to replace a discontinued material or to reduce cost, begin by starting from the function the original was performing and compare alternatives on specification rather than on marketing description. Specifically, usage range, pH tolerance, melting point and solubility determine whether a substitution will actually survive your process. Furthermore, each product page lists those properties along with the INCI name and CAS number. Thus, a swap can be verified before it is trialled.`,
  `Counts shown next to each function reflect the materials currently published and in stock. Consequently, if nothing listed under a function fits your constraints, send a quote request describing the behaviour you need and the volume you expect to use. Notably, we regularly source materials to order. In fact, our team can suggest candidates that are not yet in the public catalogue.`,
  `Use levels differ enormously between functional classes, and that is the first thing to check when you are costing a formula. Notably, emulsifiers and thickeners typically work in the low single-digit percentages. Meanwhile, surfactants work rather higher in a cleanser, and actives and peptides often at a fraction of one percent. As a result, a material with a high price per kilo can actually be cheaper per batch than a bulk ingredient used at twenty times the concentration. Therefore, compare the cost contribution at your actual use level rather than the headline price per unit.`,
  `Preservation deserves particular attention. Essentially, any formulation containing water needs a preservative system appropriate to its pH and packaging. Additionally, the choice interacts with almost everything else in the formula — chelators, surfactants and some botanical extracts all affect how well a system performs. Therefore, if you are unsure which system suits a formulation, send the pH range, the packaging format and the water content with a quote request. Finally, our team can suggest candidates that are compatible with the rest of your ingredient list.`,
  `Stock positions shown against each function reflect what is published and available now. Importantly, availability changes as material moves. Consequently, if you are planning a production run some weeks out it is worth confirming quantities. Rather than relying on a listing you checked earlier, reach out directly to verify current stock.`,
];

export async function generateMetadata(): Promise<Metadata> {
    // Cached for 5 minutes rather than no-store. no-store made the whole page
    // render per request (~1.4 s on the server), and Next streamed the loading
    // spinner first with the real hero after it — a 1.7 s LCP render delay on
    // /functions. SEO text edited in the admin still shows within 5 minutes.
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/functions')}`, {
    revalidate: 300,
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
                    path: `/functions/${f.slug}`,
                  })),
                }),
              ]
            : []),
        ]}
      />

      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Targeted formulation</span>
        <h1>Find it by what it does.</h1>
        <p>
          Most formulation problems present as a behaviour rather than a material — a cream that
          separates, a cleanser that strips, a serum that dries down tight. Browsing by function
          surfaces every material we stock that addresses the same problem, which makes
          substitution and cost engineering far easier than working from trade names.
        </p>
        <p className="g-cat-intro-meta">
          {stocked.length} {stocked.length === 1 ? 'function' : 'functions'} with material in stock
          · {functions.length} indexed · A–Z
        </p>
      </div>

      <section className="r-wrap r-section">
        {stocked.length === 0 ? (
          <EmptyState
            title="No functions found."
            text="The function index could not be loaded. Browse ingredient categories instead."
            href="/categories"
            label="Browse categories"
          />
        ) : (
          <FunctionDirectory
            items={stocked.map((f) => {
              const count = f.productCount ?? 0;
              return {
                key: f.id,
                href: `/functions/${f.slug}`,
                name: f.name,
                image: categoryImage(f.slug || f.name),
                imageAlt: '',
                meta: `${count} ${count === 1 ? 'ingredient' : 'ingredients'}`,
                text: 'View ingredients →',
              };
            })}
          />
        )}

        {/* Vocabulary we index but have no published material against today.
            Listed as text rather than links: each one would otherwise open an
            empty page. */}
        {unstocked.length > 0 && (
          <div className="g-cat-unstocked">
            <div>
              <span className="r-eyebrow">Sourced to order</span>
              <h2>Also indexed.</h2>
              <p>
                {unstocked.length} further functions have no published material in the catalogue
                right now. A significant share of what we ship is sourced to order against a
                customer&rsquo;s specification — tell us the behaviour you need and we will confirm
                what we can supply.
              </p>
              <Link className="r-btn r-outline" href="/quote-request">
                Ask about a function
              </Link>
            </div>
            <ul className="g-cat-tags">
              {unstocked.map((f) => (
                <li key={f.id}>{f.name}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <IndexBand
        eyebrow="Every material, indexed"
        title={
          <>
            Grouped by what it does.
            <br />
            Or by what it is.
          </>
        }
        text="Functions group materials by the job they do in a formulation. Browse by category to find them by what they physically are, or search by name if you already know the INCI name."
        cta={{ href: '/products', label: 'Open the full catalog' }}
        tiles={[
          { href: '/categories', kicker: 'Browse by', letter: 'C', caption: 'Ingredient categories' },
          { href: '/ingredients-a-z', kicker: 'Start with', letter: 'A', caption: 'Ingredients A–Z' },
        ]}
      />

      <LongForm
        eyebrow="Formulating by function"
        heading="Choosing a function"
        paragraphs={INTRO_PARAGRAPHS}
        subheadings={[
          { beforeIndex: 1, text: 'How ingredients overlap by function' },
          { beforeIndex: 2, text: 'Verifying substitutions by specification' },
          { beforeIndex: 3, text: 'Stock availability and sourcing to order' },
          { beforeIndex: 4, text: 'Understanding use levels and cost' },
          { beforeIndex: 5, text: 'Preservation systems and compatibility' },
        ]}
        aside={{
          title: 'Not sure which function you need?',
          text: 'Send the behaviour you need, the pH range, packaging format and expected volume with a quote request, and our team will suggest compatible candidates.',
          links: [
            { href: '/quote-request', label: 'Request a quote' },
            { href: '/categories', label: 'Browse ingredient categories' },
            { href: '/contact', label: 'Ask an ingredient question' },
          ],
        }}
      />
    </>
  );
}
