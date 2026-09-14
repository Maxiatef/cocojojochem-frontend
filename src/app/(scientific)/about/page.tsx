import type { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
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
  'Founded in 1998, COCOJOJO was built on a simple belief: everyone deserves access to exceptional beauty and wellness products backed by both nature and science.',
  'Long before our products were available directly to consumers, COCOJOJO worked behind the scenes of the beauty industry, supplying raw materials, developing custom formulations, and manufacturing products for brands across the United States and around the world. Through decades of serving manufacturers, retailers, salons, spas, and private label clients, we arrived at a realization that would change everything: the same quality ingredients, formulations, and manufacturing expertise trusted by established brands should not be reserved exclusively for industry insiders. That realization became the foundation of COCOJOJO’s retail division, and the reason we opened our doors directly to consumers.',
  'For more than 25 years, we have dedicated ourselves to bridging the gap between the laboratory and the consumer. Whether you are an individual seeking premium skincare, a salon owner sourcing professional products, or an entrepreneur building the next great beauty brand, you deserve access to the same expertise and quality that major brands rely on every day.',
  'Behind every product is an experienced team of PharmD professionals, cosmetic scientists, chemists, and formulators passionate about creating products that truly perform. Every formula begins with extensive research, careful ingredient selection, and a commitment to scientific excellence. We believe effective products are not built on marketing claims alone. They are built on superior ingredients, intelligent formulation, rigorous testing, and continuous innovation.',
  'Today, COCOJOJO maintains a portfolio of more than 11,000 proprietary formulations spanning skincare, hair care, body care, botanical oils, butters, USDA Organic products, specialty treatments, and professional beauty solutions. Unlike brands that outsource development and production, we handle everything in-house, from formulation and ingredient sourcing to testing and manufacturing. When you purchase from COCOJOJO, you are buying directly from the people who made it.',
  'All products are manufactured in California, USA, under strict quality control systems and industry-leading standards designed to ensure consistency, safety, and performance across every order, regardless of size.',
];

/**
 * The closing two paragraphs sit apart from the narrative — they are the
 * company's position and its mission rather than its history, so they get the
 * navy panel instead of continuing the column.
 */
const CLOSING: string[] = [
  'At COCOJOJO, we believe the future of beauty lies at the intersection of science and nature. Science without nature produces cold, synthetic results. Nature without science produces inconsistency. The combination of both is where truly exceptional products are born, and that has always been our approach.',
  'More than 25 years after our founding, our mission remains unchanged: to make exceptional beauty and wellness accessible to everyone while helping shape the future of the industry through innovation, quality, integrity, and an uncompromising belief that better products are always possible.',
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
            Founded in 1998, COCOJOJO bridges the laboratory, the manufacturer, the professional,
            and the everyday consumer with formulas made for performance, consistency, and access.
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
            {STORY.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
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

      {/* Contact / Request a quote — the closing band every migrated page carries. */}
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


