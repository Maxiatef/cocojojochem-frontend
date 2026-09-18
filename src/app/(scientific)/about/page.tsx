import type { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { SeoPage, Testimonial } from '@/lib/types';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { TestimonialCarousel } from '@/components/scientific/TestimonialCarousel';
import {
  Container,
  Eyebrow,
  SciButton,
  SectionHeading,
} from '@/components/scientific/primitives';

/**
 * About, rebuilt to the "Scientific edition" design.
 *
 * There is no Figma frame for this page, so it is assembled from the parts the
 * design already defines: the navy full-width page header used by the quote
 * request page, the pale statistics band, and the standard closing quote band.
 *
 * The copy is the company's own and replaces the previous placeholder text
 * wholesale. It is rendered in full rather than folded into a `SciProse`
 * disclosure — on a listing page that block is supporting SEO copy, but here
 * the story *is* the page, and hiding six of its seven paragraphs behind a
 * "Read more" would leave the section looking empty.
 */

const DEFAULT_METADATA = {
  title: 'About COCOJOJO',
  description:
    'Founded in 1998, COCOJOJO formulates and manufactures beauty and wellness products in California — 11,000+ proprietary formulations, with in-house sourcing, testing and quality control.',
};

/** The figures in the statistics band. Value first, because that is what reads. */
const STATS = [
  { value: '1998', label: 'Founded' },
  { value: '25+', label: 'Years of industry experience' },
  { value: '11,000+', label: 'Proprietary formulations' },
  { value: 'CA', label: 'Manufactured in California' },
];

const CAPABILITIES = [
  'Raw materials and ingredient sourcing',
  'Custom formulations and private label support',
  'Skincare, hair care, body care, oils, butters, and extracts',
  'In-house testing, manufacturing, and quality control',
];

const STORY: string[] = [
  'Since 1998, COCOJOJO has been built on a simple belief: everyone deserves access to exceptional beauty and wellness products backed by both nature and science.',
  'Long before our products were available directly to consumers, COCOJOJO worked behind the scenes of the beauty industry. In that role, we supplied raw materials, developed custom formulations, and manufactured products for brands across the United States and around the world. Over time, that work led to a realization: the same quality ingredients and expertise trusted by established brands should not be reserved only for industry insiders. Therefore, that belief became the foundation of COCOJOJO’s retail division and the reason we opened our doors directly to consumers.',
  'For more than 25 years, we have worked to bridge the gap between the laboratory and the consumer. For example, you may be seeking premium skincare, sourcing professional products, or building the next great beauty brand. In each case, you deserve access to the same quality major brands rely on every day.',
  'Behind every product is an experienced team of PharmD professionals, cosmetic scientists, chemists, and formulators. Together, they focus on products that truly perform. In addition, every formula begins with research, careful ingredient selection, and a commitment to scientific excellence. As a result, effective products are built on superior ingredients, intelligent formulation, rigorous testing, and continuous innovation.',
  'Today, COCOJOJO maintains a portfolio of more than 11,000 proprietary formulations. In practice, these span skincare, hair care, body care, botanical oils, butters, USDA Organic products, specialty treatments, and professional beauty solutions. Unlike brands that outsource development and production, we handle everything in-house. Therefore, formulation, ingredient sourcing, testing, and manufacturing all stay connected. As a result, when you purchase from COCOJOJO, you are buying directly from the people who made it.',
  'Finally, all products are manufactured in California, USA, under strict quality control systems. Because of that, these standards help ensure consistency, safety, and performance across every order, regardless of size.',
];

const STORY_SUBHEADINGS: Record<number, string> = {
  1: 'From industry supplier to direct access',
  3: 'Formulation expertise behind every product',
  4: 'In-house manufacturing and quality control',
};

/**
 * The closing two paragraphs sit apart from the narrative — they are the
 * company's position and its mission rather than its history, so they get the
 * navy panel instead of continuing the column.
 */
const CLOSING: string[] = [
  'At COCOJOJO, we believe the future of beauty lies at the intersection of science and nature. Without nature, science can produce cold, synthetic results. Likewise, without science, nature can produce inconsistency. Therefore, the combination of both is where truly exceptional products are born, and that has always been our approach.',
  'More than 25 years after our founding, our mission remains unchanged. In short, we make exceptional beauty and wellness accessible to everyone while helping shape the future of the industry through innovation, quality, integrity, and an uncompromising belief that better products are always possible.',
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(
    `/seo-pages/by-path?path=${encodeURIComponent('/about')}`,
    { cache: 'no-store' },
  );
  return pageMetadata({
    title: seo?.metaTitle || DEFAULT_METADATA.title,
    description: clampDescription(seo?.metaDescription, DEFAULT_METADATA.description),
    path: '/about',
    keywords: [
      'COCOJOJO',
      'cosmetic manufacturer California',
      'private label skincare manufacturer',
      'custom cosmetic formulation',
      'contract manufacturing beauty products',
      'bulk botanical oils and butters',
    ],
    images: [seo?.ogImageUrl],
  });
}

export default async function AboutPage() {
  // Published testimonials, managed under admin Settings → Testimonials.
  // serverFetch returns null on any failure, so the section simply doesn't
  // render if the API is unreachable — a story page must not 500 over a
  // supporting band.
  const testimonials =
    (await serverFetch<Testimonial[]>('/wholesale/testimonials', { revalidate: 300 })) ?? [];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      {/* Page header, full width on navy — the same treatment the quote
          request page uses, so the two "company" pages open the same way. */}
      <section className="bg-sci-navy py-16 text-white">
        <Container className="flex flex-col gap-6">
          <Eyebrow tone="accent">About COCOJOJO</Eyebrow>

          <h1 className="max-w-[1150px] font-sci-heading text-[40px] font-semibold leading-[48px] md:text-[64px] md:leading-[72px]">
            Beauty and wellness backed by nature, science, and in-house expertise.
          </h1>

          <p className="max-w-[940px] font-sci-body text-sci-body text-[#adc6d8]">
            Since 1998, COCOJOJO has bridged the laboratory, the manufacturer, the professional,
            and the everyday consumer. As a result, our formulas are made for performance,
            consistency, and access.
          </p>
        </Container>
      </section>

      {/* Statistics band. A 1px gap grid on the border colour gives the hairline
          rules between cells without four separate border declarations. */}
      <section className="bg-white pt-16">
        <Container>
          <div className="grid grid-cols-2 gap-px bg-sci-border md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2 bg-white px-2 py-8 md:px-6">
                <p className="font-sci-heading text-[36px] font-semibold leading-[44px] text-sci-navy md:text-[44px] md:leading-[52px]">
                  {stat.value}
                </p>
                <p className="font-sci-body text-sci-label text-sci-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Our story — capabilities on the left, the narrative on the right. */}
      <section className="bg-white py-16">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Eyebrow>Our story</Eyebrow>

            <SectionHeading>Direct access to the quality trusted behind the scenes.</SectionHeading>

            <ul className="flex flex-col gap-3">
              {CAPABILITIES.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 font-sci-body text-sci-body text-sci-muted"
                >
                  <span
                    aria-hidden
                    className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-sci-accent"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex max-w-[760px] flex-col gap-5 font-sci-body text-sci-body text-sci-muted">
            {STORY.map((paragraph, index) => (
              <div key={paragraph.slice(0, 48)} className="flex flex-col gap-3">
                {STORY_SUBHEADINGS[index] && (
                  <h2 className="font-sci-heading text-[24px] font-semibold leading-8 text-sci-navy">
                    {STORY_SUBHEADINGS[index]}
                  </h2>
                )}
                <p>{paragraph}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Position and mission. */}
      <section className="bg-white pb-16">
        <Container>
          <div className="flex flex-col gap-6 bg-sci-navy p-10 text-white md:p-14">
            <Eyebrow tone="accent">Science and nature</Eyebrow>
            <h2 className="max-w-[900px] font-sci-heading text-[32px] font-semibold leading-[40px] md:text-sci-heading">
              Better products are always possible.
            </h2>
            {CLOSING.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="max-w-[900px] font-sci-body text-sci-body">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>

      {/* What our customers say. Rendered only when there is something to
          show — an empty band with a heading and no quotes reads as broken
          rather than as "no testimonials yet". */}
      {testimonials.length > 0 && (
        <section className="bg-sci-pale py-16">
          <Container className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <Eyebrow>In their words</Eyebrow>
              <SectionHeading>
                Trusted by the brands, salons, and formulators we supply.
              </SectionHeading>
            </div>

            <TestimonialCarousel testimonials={testimonials} />
          </Container>
        </section>
      )}

      {/* Contact / Request a quote — the closing band every migrated page carries. */}
      <section className={`py-16 ${testimonials.length > 0 ? 'bg-white' : 'bg-sci-pale'}`}>
        <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-6">
            <Eyebrow>Let’s move your next idea forward</Eyebrow>
            <p className="font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy md:text-sci-heading">
              Therefore, the next great formula
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


