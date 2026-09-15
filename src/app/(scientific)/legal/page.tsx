import type { Metadata } from 'next';
import Link from 'next/link';
import { legalPolicies } from '@/lib/legalPolicies';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { Container, Eyebrow, SciButton } from '@/components/scientific/primitives';

/**
 * The legal centre — an index of every published policy.
 *
 * The policies themselves are copied verbatim from the COCOJOJO retail site
 * (`@/lib/legalPolicies`); this page only lists them.
 */

export const metadata: Metadata = pageMetadata({
  title: 'Legal Center',
  description:
    'Every COCOJOJO policy in one place — privacy, terms of service, cookies, CCPA, refunds, shipping, wholesale terms and the rest of the legal library.',
  path: '/legal',
});

export default function LegalIndexPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Legal Center', path: '/legal' },
        ])}
      />

      <section className="bg-sci-navy py-16 text-white">
        <Container className="flex flex-col gap-6">
          <Eyebrow tone="accent">Legal Center</Eyebrow>

          <h1 className="max-w-[1000px] font-sci-heading text-[40px] font-semibold leading-[48px] md:text-[64px] md:leading-[72px]">
            Every policy, in one place.
          </h1>

          <p className="max-w-[860px] font-sci-body text-sci-body text-[#adc6d8]">
            {legalPolicies.length} published policies covering privacy, purchasing, shipping,
            wholesale supply and intellectual property. Each one states its own effective date.
          </p>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {legalPolicies.map((policy) => (
              <li key={policy.slug}>
                <Link
                  href={`/legal/${policy.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-sci-border bg-white p-6 transition hover:border-sci-blue hover:shadow-sm"
                >
                  <h2 className="font-sci-heading text-[17px] font-semibold leading-6 text-sci-navy">
                    {policy.title}
                  </h2>

                  {policy.summary && (
                    <p className="line-clamp-3 font-sci-body text-sci-label text-sci-muted">
                      {policy.summary}
                    </p>
                  )}

                  <span className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <span className="font-sci-body text-sci-eyebrow font-medium uppercase text-sci-muted">
                      {policy.lastUpdated
                        ? `Updated ${policy.lastUpdated}`
                        : policy.effectiveDate
                          ? `Effective ${policy.effectiveDate}`
                          : ' '}
                    </span>
                    <span
                      aria-hidden
                      className="font-sci-body text-sci-label font-medium text-sci-blue transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-sci-border bg-sci-pale py-16">
        <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4">
            <Eyebrow>Questions about a policy?</Eyebrow>
            <p className="font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy">
              Our team can walk you through any of it.
            </p>
          </div>
          <SciButton href="/contact" variant="navy" className="shrink-0">
            Contact us →
          </SciButton>
        </Container>
      </section>
    </>
  );
}
