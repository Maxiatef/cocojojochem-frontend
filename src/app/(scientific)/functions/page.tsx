import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Paginated, ProductFunction, SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { categoryImage } from '@/lib/gloss/images';
import { catalog, categoryImage as referenceCategoryImage } from '@/lib/ocean/catalog-data';
import { referenceCatalog } from '@/lib/ocean/references';

/**
 * Ingredients by formulation function, in the ocean design (reference
 * `/functions`, retail-page.tsx `Categories functions`): the `r-page-intro`
 * head and the `r-category-directory` photo cards, markup and copy unchanged.
 *
 * The cards are OUR functions that have published material, each opening its
 * indexable /functions/<slug> page. Only if our function index can't be
 * loaded do the reference's function tiles (supplier references, opening
 * /products?function=<tag>) stand in, so the page is never empty.
 */

/** The reference's function tags, in its order. */
const REFERENCE_TAGS = [
  'Emollient oil',
  'Cosmetic active',
  'Cleansing surfactant',
  'Texture support',
  'Moisture support',
  'Emulsification support',
  'Botanical ingredient',
  'Protein or peptide',
  'Preservation support',
  'Color or mineral ingredient',
  'Exfoliation or acid ingredient',
  'Base or kit',
];

/** The reference's photo for a function name (its /assets/ingredients set). */
const functionImage = (name: string) =>
  categoryImage(name).replace('/gloss/ingredients/', '/assets/ingredients/');

const DEFAULT_METADATA: Metadata = {
  title: 'Shop Ingredients by Function',
  description:
    'Find cosmetic ingredients by what they do — emulsifiers, humectants, preservatives, antioxidants, thickeners and actives, available wholesale in bulk quantities.',
};

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

  const tiles: { key: string; href: string; image: string; count: string; name: string }[] = stocked.length
    ? stocked.map((f) => {
        const count = f.productCount ?? 0;
        return {
          key: f.id,
          href: `/functions/${f.slug}`,
          image: functionImage(f.slug || f.name),
          count: `${count} ${count === 1 ? 'ingredient' : 'ingredients'}`,
          name: f.name,
        };
      })
    : [...new Set(catalog.flatMap((p) => p.functions))]
        .filter((t) => REFERENCE_TAGS.includes(t))
        .map((t) => {
          const list = referenceCatalog.filter((p) => p.functions.includes(t));
          return { t, list };
        })
        .filter(({ list }) => list.length > 0)
        .map(({ t, list }) => ({
          key: t,
          href: '/products?function=' + encodeURIComponent(t),
          image: referenceCategoryImage(list[0].categoryId),
          count: `${list.length} references`,
          name: t,
        }));

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
        <span className="r-eyebrow">A place for every ingredient</span>
        <h1>Find ingredients by function.</h1>
        <p>Start with the material you need, then explore its specifications and applications.</p>
      </div>
      <section className="r-wrap r-section">
        <div className="r-category-directory">
          {tiles.map((t) => (
            <a href={t.href} key={t.key}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.image} alt="Representative ingredient texture" width={430} height={300} loading="lazy" />
              <div>
                <span>{t.count}</span>
                <h2>{t.name}</h2>
                <p>Explore matching ingredient roles and published technical information.</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
