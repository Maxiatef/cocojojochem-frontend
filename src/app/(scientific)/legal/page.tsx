import type { Metadata } from 'next';
import Link from 'next/link';
import { legalPolicies } from '@/lib/legalPolicies';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';

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

      <div className="r-legacy-support">
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow">COCOJOJO policies</div>
            <h1>Every policy, in one place.</h1>
            <p>
              {legalPolicies.length} published policies covering privacy, purchasing, shipping,
              wholesale supply and intellectual property. Each one states its own effective date.
            </p>
          </div>
        </section>

        <section className="wrap section">
          <ul className="r-legal-index">
            {legalPolicies.map((policy) => (
              <li key={policy.slug}>
                <Link href={`/legal/${policy.slug}`}>
                  <h2>{policy.title}</h2>
                  {policy.summary && <p>{policy.summary}</p>}
                  <span>
                    {policy.lastUpdated
                      ? `Updated ${policy.lastUpdated}`
                      : policy.effectiveDate
                        ? `Effective ${policy.effectiveDate}`
                        : 'Read policy'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="r-wrap r-section r-legal-questions">
          <h2>Questions about a policy?</h2>
          <p>Our team can walk you through any of it.</p>
          <Link href="/contact?subject=Policy%20question">Contact us about a policy</Link>
        </section>
      </div>
    </>
  );
}
