import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLegalPolicy, legalPolicies, type LegalPolicy } from '@/lib/legalPolicies';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { LegalDocument } from '@/components/scientific/LegalDocument';
import { LegalNav } from '@/components/scientific/LegalNav';
import { Container, Eyebrow } from '@/components/scientific/primitives';
import { HeroMedia } from '@/components/scientific/HeroMedia';
import { HERO_IMAGES } from '@/lib/heroImages';

/**
 * One legal policy. The text is copied verbatim from the COCOJOJO retail site
 * and lives in `@/lib/legalPolicies` — nothing here rewrites or summarises it.
 *
 * Statically generated: the content is in the bundle, so there is no reason to
 * render these per request.
 */

export function generateStaticParams() {
  return legalPolicies.map((policy) => ({ slug: policy.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const policy: LegalPolicy | undefined = getLegalPolicy(params.slug);

  if (!policy) {
    return pageMetadata({
      title: 'Policy Not Found',
      description: 'This policy is no longer published. Browse the full COCOJOJO legal center.',
      path: `/legal/${params.slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: policy.metaTitle || policy.title,
    description: clampDescription(
      policy.metaDescription || policy.summary,
      `Read the COCOJOJO ${policy.title}. Effective ${policy.effectiveDate || 'on publication'}.`,
    ),
    path: `/legal/${policy.slug}`,
  });
}

export default function LegalPolicyPage({ params }: { params: { slug: string } }) {
  const policy = getLegalPolicy(params.slug);
  if (!policy) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Legal Center', path: '/legal' },
          { name: policy.title, path: `/legal/${policy.slug}` },
        ])}
      />

      <section className="relative isolate overflow-hidden border-b border-sci-border bg-sci-pale py-10">
        <HeroMedia
          src={HERO_IMAGES.legal.src}
          alt={HERO_IMAGES.legal.alt}
          tone="light"
          priority
        />
        <Container className="flex flex-col gap-5">
          <Eyebrow>COCOJOJO legal</Eyebrow>

          <h1 className="max-w-[900px] font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy md:text-[48px] md:leading-[56px]">
            {policy.title}
          </h1>

          {(policy.effectiveDate || policy.lastUpdated) && (
            <p className="flex flex-wrap gap-x-6 gap-y-1 font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
              {policy.effectiveDate && <span>Effective {policy.effectiveDate}</span>}
              {policy.lastUpdated && <span>Updated {policy.lastUpdated}</span>}
            </p>
          )}
        </Container>
      </section>

      <section className="bg-white py-10 md:py-14">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
          {/* On a phone the 25-item index would push the document itself two
              screens down, so it collapses to a disclosure there and only
              becomes a permanent sidebar once there is a column to spare. */}
          <details className="group rounded-xl border border-sci-border p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between font-sci-body text-sci-label font-medium text-sci-navy marker:content-none">
              All legal notices
              <span aria-hidden className="text-sci-muted transition group-open:rotate-180">
                ↓
              </span>
            </summary>
            <div className="mt-4">
              <LegalNav currentSlug={policy.slug} />
            </div>
          </details>

          <aside className="hidden lg:block">
            <Link
              href="/legal"
              className="mb-6 inline-block font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
            >
              ← All legal notices
            </Link>
            <LegalNav currentSlug={policy.slug} />
          </aside>

          <div className="min-w-0">
            {policy.summary && (
              <p className="mb-8 border-l-2 border-sci-accent pl-5 font-sci-body text-sci-body text-sci-navy">
                {policy.summary}
              </p>
            )}
            <LegalDocument policy={policy} />
          </div>
        </Container>
      </section>
    </>
  );
}
