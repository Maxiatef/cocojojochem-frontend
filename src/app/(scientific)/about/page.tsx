import type { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { SeoPage, Testimonial } from '@/lib/types';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { AboutExperience } from '@/components/ocean/company/CompanyPages';

/**
 * About, in the ocean design (reference AboutExperience): the animated
 * "Curiosity, meet chemistry." hero, type ribbon, story block and value
 * cards. The shell adds the cinematic intro and the e-company-shell wrapper.
 * Our published testimonials follow the value cards when there are any.
 */

const DEFAULT_METADATA = {
  title: 'About COCOJOJO',
  description:
    'Founded in 1998, COCOJOJO formulates and manufactures beauty and wellness products in California — 11,000+ proprietary formulations, with in-house sourcing, testing and quality control.',
};

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

export default async function AboutPage() {
  // Published testimonials, managed under admin Settings → Testimonials.
  // serverFetch returns null on any failure, so the band simply doesn't render.
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
      <AboutExperience testimonials={testimonials} />
    </>
  );
}
