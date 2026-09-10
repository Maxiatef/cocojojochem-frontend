import Link from 'next/link';
import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { SeoIntro } from '@/components/storefront/SeoIntro';
import { CategoryStrip } from '@/components/storefront/CategoryStrip';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Paginated, ProductFunction, SeoPage } from '@/lib/types';

const HIGHLIGHTS = [
  { icon: 'flask' as const, label: 'Grouped by what they do' },
  { icon: 'grid' as const, label: 'Cross-listed materials' },
  { icon: 'search' as const, label: 'Faster substitution' },
  { icon: 'shield' as const, label: 'COA & SDS on request' },
];

const INTRO_PARAGRAPHS: string[] = [
    `Choosing an ingredient by function is usually faster than choosing by name, because most formulation problems present as a behaviour rather than a material. A cream that separates needs an emulsifier or a stabiliser, not a specific botanical. A cleanser that strips needs a milder surfactant blend. A serum that dries down tight needs its humectant load adjusted against the occlusives. Browsing by function surfaces every material we stock that addresses the same problem, which makes substitution and cost engineering far easier than working from one supplier's product names.`,
    `Functional categories overlap in practice, and that is expected. Fatty alcohols such as cetearyl alcohol act as both thickeners and co-emulsifiers, so they appear under both. Many plant oils are simultaneously emollients and sources of specific fatty acids. Several actives also carry preservative-boosting properties at typical use levels. Where a material serves more than one role it is listed under each, so you find it whichever way you approach the problem.`,
    `If you are reformulating to replace a discontinued material or to reduce cost, start from the function the original was performing and compare alternatives on specification rather than on marketing description. Usage range, pH tolerance, melting point and solubility determine whether a substitution will actually survive your process. Each product page lists those properties along with the INCI name and CAS number, so a swap can be verified before it is trialled.`,
    `Counts shown next to each function reflect the materials currently published and in stock. If nothing listed under a function fits your constraints, send a quote request describing the behaviour you need and the volume you expect to use — we regularly source materials to order, and our team can suggest candidates that are not yet in the public catalogue.`,
    `Use levels differ enormously between functional classes, and that is the first thing to check when you are costing a formula. Emulsifiers and thickeners typically work in the low single-digit percentages, surfactants rather higher in a cleanser, and actives and peptides often at a fraction of one percent. A material with a high price per kilo can therefore be cheaper per batch than a bulk ingredient used at twenty times the concentration, so compare the cost contribution at your actual use level rather than the headline price per unit.`,
    `Preservation deserves particular attention. Any formulation containing water needs a preservative system appropriate to its pH and packaging, and the choice interacts with almost everything else in the formula — chelators, surfactants and some botanical extracts all affect how well a system performs. If you are unsure which system suits a formulation, send the pH range, the packaging format and the water content with a quote request, and our team can suggest candidates that are compatible with the rest of your ingredient list.`,
    `Stock positions shown against each function reflect what is published and available now. Availability changes as material moves, so if you are planning a production run some weeks out it is worth confirming quantities rather than relying on a listing you checked earlier.`,
];

const DEFAULT_METADATA: Metadata = {
  title: 'Shop Ingredients by Function',
  description:
    'Find cosmetic ingredients by what they do — emulsifiers, humectants, preservatives, antioxidants, thickeners and actives, available wholesale in bulk quantities.',
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/functions')}`, {
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
  const functionsRes = await serverFetch<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=200');
  const functions = functionsRes?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Targeted Formulation</p>
      <h1 className="mt-1 font-display text-4xl text-ink">
        Shop Ingredients by Formulation Function
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Find ingredients by what they do, not just what they're called.
      </p>

      <SeoIntro highlights={HIGHLIGHTS} paragraphs={INTRO_PARAGRAPHS} />

      {functions.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No functions found.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-px bg-sand-200 sm:grid-cols-2 md:grid-cols-3">
          {functions.map((f) => (
            <Link
              key={f.id}
              href={`/products?functionSlug=${f.slug}`}
              className="flex items-center justify-between bg-white px-5 py-4 transition hover:bg-sand-50"
            >
              <span className="font-medium text-ink">{f.name}</span>
              {typeof f.productCount === 'number' && (
                <span className="text-xs text-ink-soft">{f.productCount} products</span>
              )}
            </Link>
          ))}
        </div>
      )}
      <CategoryStrip heading="Browse by Category" />
    </div>
  );
}
