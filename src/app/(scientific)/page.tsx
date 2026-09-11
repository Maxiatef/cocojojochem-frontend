import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated, SeoPage } from '@/lib/types';
import { JsonLd, organizationSchema, webSiteSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { Hero } from '@/components/scientific/Hero';
import {
  ArrowLink,
  Container,
  Eyebrow,
  IndexCard,
  Lead,
  SciButton,
  SectionHeading,
} from '@/components/scientific/primitives';

/**
 * COCOJOJO home page, rebuilt to the "Scientific edition" design
 * (Figma rj57PsDgSsbo86iG4RC1SA, node 33:216).
 *
 * Section order follows the design exactly. Copy is the design's, except the
 * product portfolio, which reads real categories from the API — the design's
 * six cards are placeholders for exactly that list, and a home page that
 * ignores the catalogue would be a regression on what it replaces.
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

  // The home page leads with the brand already, so it opts out of the
  // "| BRAND" title template the rest of the site uses.
  return { ...meta, title: { absolute: `${SITE_NAME} — ${seo?.metaTitle || HOME_TITLE}` } };
}

/** Used when the catalogue has no categories yet — the design's own copy. */
const FALLBACK_CATEGORIES = [
  { name: 'Natural oils', description: 'Plant-derived possibilities', slug: '' },
  { name: 'Solvents & humectants', description: 'The foundation of your formula', slug: '' },
  { name: 'Surfactants & emulsifiers', description: 'Texture, stability & performance', slug: '' },
  { name: 'Cosmetic actives', description: 'Purposeful formulation ingredients', slug: '' },
  { name: 'Acids & functional ingredients', description: 'Solutions for your application', slug: '' },
  { name: 'Butters & waxes', description: 'Naturally rich textures', slug: '' },
];

const VALUE_STRIP = [
  'Natural & specialty ingredients',
  'Bulk supply for your business',
  'Formulation to manufacturing',
  'People who know your products',
];

const INDUSTRIES = [
  {
    eyebrow: '01 / Beauty & wellness',
    title: ['Beauty &', 'personal care'],
    body: 'Bring your next formulation to life with ingredients selected for your application.',
    image: '/scientific/industry-beauty.svg',
    href: '/products',
  },
  {
    eyebrow: '02 / Food ingredients',
    title: ['Food &', 'beverage'],
    body: 'Source ingredients with purpose. Discuss the right grade for your product.',
    image: '/scientific/industry-food.svg',
    href: '/products',
  },
  {
    eyebrow: '03 / Product development',
    title: ['Formulation &', 'manufacturing'],
    body: 'Take your ideas further, from raw materials to finished products.',
    image: '/scientific/industry-formulation.svg',
    href: '/products',
  },
];

const SERVICES = [
  {
    title: '01  Bulk ingredient sourcing',
    body: 'Tell us the material, quantity, and packaging you need. We’ll help you explore your supply options.',
  },
  {
    title: '02  Formulation support',
    body: 'Move from an idea to a considered ingredient selection with support for your product development.',
  },
  {
    title: '03  Private label & manufacturing',
    body: 'Connect raw materials with finished products through COCOJOJO’s manufacturing capabilities.',
  },
];

const DOCUMENTS = [
  { index: 'SDS', title: 'Safety data sheets', description: 'Handling and safety information' },
  { index: 'TDS', title: 'Technical data sheets', description: 'Properties and specifications' },
  { index: 'COA', title: 'Certificates of analysis', description: 'Material and batch information' },
];

export default async function ScientificHomePage() {
  const categoriesRes = await serverFetch<Paginated<Category>>(
    '/wholesale/categories?page=1&limit=6',
  );

  const categories = categoriesRes?.data?.length
    ? categoriesRes.data.map((c) => ({
        name: c.name,
        description: c.description || 'Explore this category',
        slug: c.slug,
      }))
    : FALLBACK_CATEGORIES;

  return (
    <>
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />

      <Hero />

      {/* Value strip */}
      <div className="border-y border-sci-border bg-white">
        <Container className="flex flex-wrap gap-x-12 gap-y-2 py-6">
          {VALUE_STRIP.map((item) => (
            <p key={item} className="font-sci-body text-sci-label font-medium text-sci-blue">
              {item}
            </p>
          ))}
        </Container>
      </div>

      {/* Product portfolio */}
      <section className="bg-white">
        <Container className="flex flex-col gap-6 py-16">
          <Eyebrow>Our product portfolio</Eyebrow>
          <SectionHeading>Great products start with the right ingredients.</SectionHeading>
          <Lead className="max-w-[920px]">
            Discover the building blocks for your next innovation, from everyday essentials to
            specialty materials.
          </Lead>

          <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => (
              <IndexCard
                key={category.name}
                href={category.slug ? `/categories/${category.slug}` : '/products'}
                index={String(i + 1).padStart(2, '0')}
                title={category.name}
                description={category.description}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Industries we serve */}
      <section className="bg-sci-pale">
        <Container className="flex flex-col gap-6 py-16">
          <Eyebrow>The industries we serve</Eyebrow>
          <SectionHeading>Your industry. Our expertise.</SectionHeading>
          <Lead className="max-w-[1000px]">
            Find the materials and support that fit the way you work.
          </Lead>

          <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {INDUSTRIES.map((industry) => (
              <a
                key={industry.eyebrow}
                href={industry.href}
                className="flex flex-col gap-5 rounded-[14px] border border-sci-border bg-white p-7 transition hover:border-sci-blue hover:shadow-sm"
              >
                {/* Exported from Figma — the illustration IS the design, so it
                    is rendered from its own asset rather than reconstructed. */}
                <img
                  src={industry.image}
                  alt=""
                  aria-hidden
                  className="h-[134px] w-full object-contain"
                />
                <Eyebrow>{industry.eyebrow}</Eyebrow>
                <h3 className="font-sci-heading text-[34px] font-semibold leading-10 text-sci-navy">
                  {industry.title[0]}
                  <br />
                  {industry.title[1]}
                </h3>
                <Lead>{industry.body}</Lead>
                <span className="font-sci-body text-sci-label font-medium text-sci-blue">
                  Explore ingredients →
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Solutions and services */}
      <section className="bg-sci-navy text-white">
        <Container className="grid grid-cols-1 gap-16 py-16 lg:grid-cols-[580px_1fr]">
          <div className="flex flex-col gap-6">
            <Eyebrow tone="white">More than an ingredient supplier</Eyebrow>
            <h2 className="font-sci-heading text-[38px] font-semibold leading-[46px] text-white md:text-sci-display">
              Good chemistry.
              <br />
              Even better
              <br />
              partnerships.
            </h2>
            <p className="max-w-[530px] font-sci-body text-sci-body text-white">
              Connect ingredient sourcing, formulation, and manufacturing with a team that
              understands your next product.
            </p>
            <SciButton href="/contact" variant="accent" className="self-start">
              Let&rsquo;s build something together →
            </SciButton>
          </div>

          <div className="flex flex-col gap-6">
            {SERVICES.map((service) => (
              <div key={service.title} className="flex flex-col gap-4">
                <h3 className="font-sci-heading text-sci-subheading font-semibold text-white">
                  {service.title}
                </h3>
                <p className="max-w-[620px] font-sci-body text-sci-body text-white">
                  {service.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Technical resources */}
      <section className="bg-white">
        <Container className="flex flex-col gap-6 py-16">
          <Eyebrow>Make informed decisions</Eyebrow>
          <SectionHeading>The details make the difference.</SectionHeading>
          <Lead className="max-w-[1040px]">
            Ask about documentation for the exact material and grade you&rsquo;re considering.
          </Lead>

          <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {DOCUMENTS.map((doc) => (
              <IndexCard
                key={doc.index}
                href="/contact"
                index={doc.index}
                title={doc.title}
                description={doc.description}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* About COCOJOJO */}
      <section className="bg-sci-pale">
        <Container className="grid grid-cols-1 gap-16 py-16 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Eyebrow>Meet COCOJOJO</Eyebrow>
            <SectionHeading>
              Materials for your business.
              <br />
              People on your side.
            </SectionHeading>
          </div>
          <div className="flex flex-col gap-4">
            <Lead>
              COCOJOJO supplies cosmetic and food-grade raw materials and supports brands with
              contract manufacturing and private label solutions.
            </Lead>
            <Lead>
              Based in California, we bring together natural oils, functional ingredients, and
              manufacturing experience to help turn your next idea into a product.
            </Lead>
            <ArrowLink href="/contact" tone="navy">
              Connect with our team
            </ArrowLink>
          </div>
        </Container>
      </section>

      {/* Contact / Request a quote */}
      <section className="bg-sci-pale">
        <Container className="flex flex-col items-start gap-10 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6">
            <Eyebrow>Let&rsquo;s move your next idea forward</Eyebrow>
            <SectionHeading>
              The next great formula
              <br />
              starts with a conversation.
            </SectionHeading>
          </div>
          <SciButton href="/quote-request" variant="accent">
            Request a quote →
          </SciButton>
        </Container>
      </section>
    </>
  );
}
