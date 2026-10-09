import { Metadata } from 'next';
import { ArrowUpRight, BookOpen, FlaskConical, GitCompareArrows } from 'lucide-react';
import { serverFetch } from '@/lib/serverFetch';
import { Paginated, Product, SeoPage } from '@/lib/types';
import { JsonLd, organizationSchema, webSiteSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { formatUsd, getDefaultVariant } from '@/lib/pricing';
import { ingredientCategories, categoryImage, categoryDescription } from '@/lib/ocean/catalog-data';
import { packagingCategory } from '@/lib/ocean/packaging-data';
import { referenceCatalog } from '@/lib/ocean/references';
import CategoryCarousel from '@/components/ocean/home/CategoryCarousel';
import LusionHero from '@/components/ocean/motion/lusion-home';
import { HomeMotion, MotionCount } from '@/components/ocean/motion/home-motion';
import MolecularScroll from '@/components/ocean/motion/molecular-scroll';
import { ScrollExperience, IngredientPortal } from '@/components/ocean/motion/scroll-experience';

/**
 * COCOJOJO home page — the Ocean redesign, a copy of the reference site's
 * Home: Lusion hero (gel sculpture + ingredient spotlight), category
 * carousel, molecular scroll threads, the sideways "Meet your next
 * essentials" rail, the formulation-workspace editorial, the ingredient
 * portal and the A–Z library band. The shell adds the cinematic intro,
 * the lusion-home-shell wrapper and the interactive finale for "/".
 *
 * The spotlight is our product (admin pick, else a priced featured product);
 * the library count is our products plus the supplier references.
 */

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
    // Cached for 5 minutes rather than no-store. no-store made the whole page
    // render per request (~1.4 s on the server), and Next streamed the loading
    // spinner first with the real hero after it — a 1.7 s LCP render delay on
    // /functions. SEO text edited in the admin still shows within 5 minutes.
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/')}`, {
    revalidate: 300,
  });

  const meta = pageMetadata({
    title: seo?.metaTitle || HOME_TITLE,
    description: clampDescription(seo?.metaDescription, HOME_DESCRIPTION),
    path: '/',
    keywords: HOME_KEYWORDS,
    images: [seo?.ogImageUrl],
  });

  // The home page opens with the brand rather than trailing it, so it opts out
  // of the "| BRAND" template the rest of the site uses.
  //
  // The prefix is conditional: HOME_TITLE carries no brand, but a title typed
  // into the SEO editor usually does. Prefixing unconditionally produced
  // "CocoJojoChem — CocoJojoChem — Wholesale Cosmetic Ingredients", which is
  // both a repeated word and 628px wide against a ~580px budget.
  const raw = seo?.metaTitle || HOME_TITLE;
  const homeTitle = new RegExp(SITE_NAME, 'i').test(raw) ? raw : `${SITE_NAME} — ${raw}`;

  return { ...meta, title: { absolute: homeTitle } };
}

const GRID_SIZE = 4;

/** Featured products first, topped up with other published products. */
async function homeProducts(): Promise<Product[]> {
  const featured = await serverFetch<Product[] | Paginated<Product>>(
    `/wholesale/products/featured?limit=${GRID_SIZE}`,
  );
  const list = (Array.isArray(featured) ? featured : featured?.data || []).slice(0, GRID_SIZE);
  if (list.length >= GRID_SIZE) return list;
  const more = await serverFetch<Paginated<Product>>(`/wholesale/products?page=1&limit=${GRID_SIZE * 2}`);
  const seen = new Set(list.map((p) => p.id));
  for (const p of more?.data || []) {
    if (list.length >= GRID_SIZE) break;
    if (!seen.has(p.id)) list.push(p);
  }
  return list;
}

/**
 * The product chosen in Admin → Settings → General, if any and still public.
 * by-ids applies the public visibility rules, so an unpublished pick falls
 * back to the automatic choice instead of showing.
 */
async function chosenSpotlight(): Promise<Product | null> {
  const settings = await serverFetch<{ homeSpotlightProductId?: string | null }>('/site-settings/public');
  const id = settings?.homeSpotlightProductId;
  if (!id) return null;
  const found = await serverFetch<Product[]>(`/wholesale/products/by-ids?ids=${encodeURIComponent(id)}`);
  return found?.[0] ?? null;
}

type Spotlight = { href: string; name: string; pack: string; price: string };

function spotlightOf(product: Product, requirePrice = false): Spotlight | null {
  const v = getDefaultVariant(product.variants || []);
  const priced = !!v && Number(v.effectivePrice ?? v.price) > 0;
  if (requirePrice && !priced) return null;
  return {
    href: `/products/${product.slug}`,
    name: product.name,
    pack: priced ? v!.label || 'Request a pack' : 'Request a pack',
    price: priced ? formatUsd(v!.effectivePrice ?? v!.price) : 'Price on request',
  };
}

/** The hero's spotlight: the admin's pick, else the first product we can quote a pack and price for. */
function spotlightFor(products: Product[], chosen: Product | null): Spotlight | null {
  if (chosen) return spotlightOf(chosen);
  for (const p of products) {
    const s = spotlightOf(p, true);
    if (s) return s;
  }
  return products[0] ? spotlightOf(products[0]) : null;
}

const FEATURED_CATEGORY_IDS = ['carrier-oils', 'actives-vitamins', 'butters-waxes', 'botanicals'];

export default async function ScientificHomePage() {
  const [products, chosen, productPage] = await Promise.all([
    homeProducts(),
    chosenSpotlight(),
    serverFetch<Paginated<Product>>('/wholesale/products?page=1&limit=1'),
  ]);

  const spotlight = spotlightFor(products, chosen);
  const libraryCount = (productPage?.pagination?.total ?? 0) + referenceCatalog.length;
  const featuredCategories = FEATURED_CATEGORY_IDS.map((id) => ingredientCategories.find((c) => c.id === id)).filter(
    (c): c is (typeof ingredientCategories)[number] => !!c,
  );

  return (
    <>
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />
      <div className="l-home">
        <HomeMotion />
        <ScrollExperience />
        <LusionHero
          price={spotlight?.price ?? 'Price on request'}
          pack={spotlight?.pack ?? 'Request a pack'}
          href={spotlight?.href ?? '/products'}
          name={spotlight?.name ?? 'Shop COCOJOJO'}
        />
        <div className="l-category-gallery">
          <CategoryCarousel
            categories={[
              ...ingredientCategories.map((c) => ({ id: c.id, label: c.label, image: categoryImage(c.id) })),
              packagingCategory,
            ]}
          />
        </div>
        <MolecularScroll />
        <section className="x-category-journey" aria-labelledby="featured-categories-title">
          <div className="l-featured r-wrap r-section x-category-stage">
            <MolecularScroll variant="thread" />
            <div className="r-section-heading">
              <div>
                <span className="r-eyebrow">Shop by category</span>
                <h2 id="featured-categories-title">
                  Meet your
                  <br />
                  <span>next essentials.</span>
                </h2>
              </div>
              <a className="r-btn r-outline" href="/categories">
                View all {ingredientCategories.length} categories
              </a>
            </div>
            <div className="x-category-viewport">
              <div className="r-product-grid">
                {featuredCategories.map((category) => (
                  <article className="r-product-card l-featured-category" key={category.id}>
                    <a
                      className="l-category-link"
                      href={'/products?category=' + category.id}
                      aria-labelledby={'featured-category-' + category.id}
                    >
                      <div className="r-product-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={categoryImage(category.id)}
                          alt={category.label + ' representative ingredient texture'}
                          width={700}
                          height={530}
                          loading="lazy"
                        />
                        <span>Ingredient collection</span>
                      </div>
                      <div className="r-product-info">
                        <h3 id={'featured-category-' + category.id}>{category.label}</h3>
                        <p>{categoryDescription(category.id)}</p>
                        <div className="l-category-action">
                          <span>Explore category</span>
                          <ArrowUpRight size={22} aria-hidden="true" />
                        </div>
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            </div>
            <div className="x-rail-caption" aria-hidden="true">
              <span>Keep scrolling to discover</span>
              <div>
                <i />
              </div>
              <span className="x-rail-index">01 / 04</span>
            </div>
          </div>
        </section>
        <section className="l-workspace r-wrap r-section">
          <div className="r-editorial">
            <div className="r-editorial-copy">
              <span className="r-eyebrow">Your own formulation workspace</span>
              <h2>
                Bring a little more
                <br />
                <em>clarity to creating.</em>
              </h2>
              <p>
                Compare technical properties, build an ingredient shortlist and calculate weights for your next trial
                batch. Keep the details in one place.
              </p>
              <div className="r-tool-links">
                <a href="/compare">
                  <GitCompareArrows size={22} />
                  <span>
                    <strong>Compare ingredients</strong>
                    <small>See the details side by side</small>
                  </span>
                  <b aria-hidden="true">+</b>
                </a>
                <a href="/formulation-tools">
                  <FlaskConical size={22} />
                  <span>
                    <strong>Calculate your batch</strong>
                    <small>Turn percentages into weights</small>
                  </span>
                  <b aria-hidden="true">+</b>
                </a>
                <a href="/projects">
                  <BookOpen size={22} />
                  <span>
                    <strong>Create a project</strong>
                    <small>Save ingredients and development notes</small>
                  </span>
                  <b aria-hidden="true">+</b>
                </a>
              </div>
            </div>
            <div className="r-editorial-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/ingredients/texture.webp"
                alt="Clear gel and ingredient flakes, representative texture photograph"
                width={700}
                height={650}
                loading="lazy"
              />
              <span>Texture. Structure. Possibility.</span>
            </div>
          </div>
        </section>
        <IngredientPortal count={libraryCount} />
        <section className="r-library-band l-library">
          <MolecularScroll variant="orbit" />
          <div className="r-wrap">
            <div>
              <span className="r-eyebrow">For the curious formulator</span>
              <h2>
                One library.
                <br />
                <span className="l-library-number">
                  <MotionCount value={libraryCount} />
                </span>
                <br />
                starting points.
              </h2>
              <p>
                Explore supplier references, available technical properties and published documents across the
                reviewed source catalogs. COCOJOJO supply is confirmed separately.
              </p>
              <a className="r-btn r-primary" href="/ingredients-a-z">
                Open the ingredient library
              </a>
            </div>
            <div className="g-library-tiles" aria-label="Explore the ingredient library">
              <a href="/ingredients-a-z?letter=A">
                <span>Start with</span>
                <strong>A</strong>
                <small>Explore A ingredients</small>
              </a>
              <a href="/ingredients-a-z?letter=Z">
                <span>Discover through</span>
                <strong>Z</strong>
                <small>Explore Z ingredients</small>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
