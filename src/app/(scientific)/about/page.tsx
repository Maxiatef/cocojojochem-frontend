import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, FlaskConical, Package } from 'lucide-react';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { SeoPage, Testimonial } from '@/lib/types';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { GLOSS_IMAGES } from '@/lib/gloss/images';

/**
 * About, in the Gloss Studio layout (prototype /about): page intro, the
 * photo + story editorial block and the three value cards — with our own
 * facts merged in (founded 1998, California manufacturing, 11,000+
 * formulations, the statistics band, the full company story, published
 * testimonials).
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
    // Cached for 5 minutes rather than no-store. no-store made the whole page
    // render per request (~1.4 s on the server), and Next streamed the loading
    // spinner first with the real hero after it — a 1.7 s LCP render delay on
    // /functions. SEO text edited in the admin still shows within 5 minutes.
  const seo = await serverFetch<SeoPage>(
    `/seo-pages/by-path?path=${encodeURIComponent('/about')}`,
    { revalidate: 300 },
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


const VALUES = [
  {
    icon: FileText,
    title: 'Details you can trace.',
    body: 'Review published product information and request documentation for the exact material you buy.',
  },
  {
    icon: FlaskConical,
    title: 'Room to create.',
    body: 'Explore ingredients, compare their properties and keep your development ideas organized.',
  },
  {
    icon: Package,
    title: 'A conversation about scale.',
    body: 'Discuss preferred packs, bulk supply, formulation and manufacturing needs with the team.',
  },
];

export default async function AboutPage() {
  // Published testimonials, managed under admin Settings → Testimonials.
  // serverFetch returns null on any failure, so the section simply doesn't
  // render if the API is unreachable — a story page must not 500 over a
  // supporting band.
  const testimonials =
    (await serverFetch<Testimonial[]>('/wholesale/testimonials', { revalidate: 300 })) ?? [];

  // The first paragraph opens the editorial block; the rest is the full story.
  const [opening, ...story] = STORY;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">About COCOJOJO</span>
        <h1>Curiosity, meet chemistry.</h1>
        <p>Connecting ingredients, formulation ideas and the people who turn them into products.</p>
      </div>

      <section className="r-wrap r-section">
        <div className="r-editorial">
          <div className="r-editorial-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GLOSS_IMAGES.oils}
              alt="Representative botanical oils and laboratory glassware"
              width={700}
              height={650}
            />
          </div>
          <div className="r-editorial-copy">
            <span className="r-eyebrow">Our story</span>
            <h2>
              From ingredient expertise
              <br />
              to everyday possibility.
            </h2>
            <p>{opening}</p>
            <p>
              This store brings ingredient shopping and technical information together, with
              published product details and a direct path to ask about your project.
            </p>
            <Link className="r-btn r-outline" href="/services">
              Explore our services
            </Link>
          </div>
        </div>

        <dl className="r-about-stats">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="r-services-grid r-about-values">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon size={26} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="r-wrap r-section r-about-story">
        <div>
          <span className="r-eyebrow">What we do</span>
          <h2>Direct access to the quality trusted behind the scenes.</h2>
          <ul>
            {CAPABILITIES.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="r-policy-copy">
          {story.map((paragraph, i) => (
            <div key={paragraph.slice(0, 48)}>
              {/* STORY_SUBHEADINGS is keyed by the paragraph's index in STORY. */}
              {STORY_SUBHEADINGS[i + 1] && <h3>{STORY_SUBHEADINGS[i + 1]}</h3>}
              <p>{paragraph}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="r-wrap r-section">
        <div className="r-about-mission">
          <span className="r-eyebrow">Science and nature</span>
          <h2>Better products are always possible.</h2>
          {CLOSING.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Rendered only when there is something to show — an empty band with a
          heading and no quotes reads as broken rather than as "none yet". */}
      {testimonials.length > 0 && (
        <section className="r-wrap r-section">
          <div className="r-section-heading">
            <div>
              <span className="r-eyebrow">In their words</span>
              <h2>Trusted by the brands, salons and formulators we supply.</h2>
            </div>
          </div>
          <div className="r-about-quotes">
            {testimonials.map((t) => (
              <figure key={t.id}>
                <blockquote>
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption>
                  <strong>{t.authorName}</strong>
                  {t.company && <span>{t.company}</span>}
                  {t.result && <small>{t.result}</small>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
