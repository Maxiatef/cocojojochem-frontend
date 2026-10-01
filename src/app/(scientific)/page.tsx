import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, FlaskConical, GitCompareArrows } from 'lucide-react';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated, Product, SeoPage } from '@/lib/types';
import { JsonLd, organizationSchema, webSiteSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { formatUsd, getDefaultVariant } from '@/lib/pricing';
import { GLOSS_IMAGES } from '@/lib/gloss/images';
import { ProductCard } from '@/components/gloss/ProductCard';
import { HomeHero, HeroSpotlight } from '@/components/gloss/home/HomeHero';
import { CategoryCarousel } from '@/components/gloss/home/CategoryCarousel';
import { GlossReveal } from '@/components/gloss/home/GlossReveal';
import { carouselCategories, heroCollections } from '@/components/gloss/home/homeCategories';

/**
 * COCOJOJO home page, ported to the Gloss Studio prototype: hero with the
 * three-slide ingredient edit, category carousel, featured products, the
 * formulation-workspace editorial and the A–Z library band.
 *
 * The prototype's collections and products are placeholders; here they are
 * our categories (matched to the prototype's collections by keyword) and our
 * featured products, so every card links to something real.
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

/** The hero's glass note: the first product we can quote a pack and price for. */
function spotlightFor(products: Product[]): HeroSpotlight | null {
  const priced = products.find((p) => {
    const v = getDefaultVariant(p.variants || []);
    return !!v && Number(v.effectivePrice ?? v.price) > 0;
  });
  const product = priced || products[0];
  if (!product) return null;
  const variant = priced ? getDefaultVariant(product.variants || []) : null;
  return {
    href: `/products/${product.slug}`,
    name: product.name,
    pack: variant?.label || null,
    price: variant ? formatUsd(variant.effectivePrice ?? variant.price) : 'Price on request',
  };
}

export default async function ScientificHomePage() {
  const [categoriesRes, products] = await Promise.all([
    serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=100&rootsOnly=true'),
    homeProducts(),
  ]);

  const categories = categoriesRes?.data || [];
  const categoryTotal = categoriesRes?.pagination.total ?? categories.length;
  const carousel = carouselCategories(categories);

  return (
    <>
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />
      <GlossReveal />

      <HomeHero collections={heroCollections(categories)} spotlight={spotlightFor(products)} />

      {carousel.length ? <CategoryCarousel categories={carousel} total={categoryTotal} /> : null}

      {products.length ? (
        <section className="r-soft-section">
          <div className="r-wrap r-section">
            <div className="r-section-heading">
              <div>
                <span className="r-eyebrow">The formulation shelf</span>
                <h2>Meet your next essentials.</h2>
              </div>
              <Link className="r-text-link" href="/products">
                Shop COCOJOJO
              </Link>
            </div>
            <div className="r-product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="r-wrap r-section">
        <div className="r-editorial">
          <div className="r-editorial-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GLOSS_IMAGES.texture}
              alt="Clear gel and ingredient flakes, representative texture photograph"
              width={700}
              height={650}
              loading="lazy"
            />
            <span>Texture. Structure. Possibility.</span>
          </div>
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
              <Link href="/compare">
                <GitCompareArrows size={22} />
                <span>
                  <strong>Compare ingredients</strong>
                  <small>See the details side by side</small>
                </span>
              </Link>
              <Link href="/formulation-tools">
                <FlaskConical size={22} />
                <span>
                  <strong>Calculate your batch</strong>
                  <small>Turn percentages into weights</small>
                </span>
              </Link>
              <Link href="/projects">
                <BookOpen size={22} />
                <span>
                  <strong>Create a project</strong>
                  <small>Save ingredients and development notes</small>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="r-library-band">
        <div className="r-wrap">
          <div>
            <span className="r-eyebrow">For the curious formulator</span>
            {/* The prototype counts products plus supplier references ("1,103
                starting points"). That library's size isn't available here,
                so the heading makes no numeric claim. */}
            <h2>
              One library.
              <br />
              Every starting point.
            </h2>
            <p>
              Explore MakingCosmetics supplier references, available use ranges and published technical documents.
              COCOJOJO supply is confirmed separately.
            </p>
            <Link className="r-btn r-white" href="/ingredients-a-z">
              Open the ingredient library
            </Link>
          </div>
          <div className="g-library-tiles" aria-label="Explore the ingredient library">
            <Link href="/ingredients-a-z?letter=A">
              <span>Start with</span>
              <strong>A</strong>
              <small>Explore A ingredients</small>
            </Link>
            <Link href="/ingredients-a-z?letter=Z">
              <span>Discover through</span>
              <strong>Z</strong>
              <small>Explore Z ingredients</small>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
