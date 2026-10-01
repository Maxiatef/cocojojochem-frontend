import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLegalPolicy, legalPolicies, type LegalPolicy } from '@/lib/legalPolicies';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { LegalDocument } from '@/components/scientific/LegalDocument';
import { LegalNav } from '@/components/scientific/LegalNav';
import { BookOpen } from 'lucide-react';

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

      {/* The prototype's legal page: `r-legacy-support` > `page-head` and
          `policy-content`. Ours carries the full policy text (the prototype
          summarised and linked out), so the 25-item index sits beside it. */}
      <div className="r-legacy-support">
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow">COCOJOJO policies</div>
            <h1>{policy.title}</h1>
            {policy.summary && <p>{policy.summary}</p>}
            {(policy.effectiveDate || policy.lastUpdated) && (
              <p className="r-legal-dates">
                {policy.effectiveDate && <span>Effective {policy.effectiveDate}</span>}
                {policy.lastUpdated && <span>Updated {policy.lastUpdated}</span>}
              </p>
            )}
          </div>
        </section>

        <section className="wrap section r-legal-layout">
          <div className="r-legal-side">
            {/* On a phone the 25-item index would push the document itself two
                screens down, so it collapses to a disclosure there and only
                becomes a sidebar once there is a column to spare. */}
            <details className="r-legal-mobile-nav">
              <summary>All legal notices</summary>
              <LegalNav currentSlug={policy.slug} />
            </details>
            <div className="r-legal-desktop-nav">
              <Link className="r-legal-back" href="/legal">
                ← All legal notices
              </Link>
              <LegalNav currentSlug={policy.slug} />
            </div>
          </div>

          <div className="policy-content">
            <BookOpen size={30} aria-hidden="true" />
            <LegalDocument policy={policy} />

            <div className="policy-more">
              <h3>Questions or requests</h3>
              <p>
                Contact <a href="mailto:support@cocojojo.com">support@cocojojo.com</a> for
                assistance with this policy or your request.
              </p>
              <Link
                href={`/contact?subject=${encodeURIComponent(`Question about the ${policy.title}`)}`}
              >
                Contact us about this policy
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
