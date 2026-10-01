import type { Metadata } from 'next';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Formulation & Manufacturing Services',
  description:
    'Ingredient sourcing, formulation support, private label and contract manufacturing from COCOJOJO in California. Tell us about your project and start a conversation with our team.',
  path: '/services',
  keywords: [
    'cosmetic ingredient sourcing',
    'cosmetic formulation support',
    'private label skincare manufacturer',
    'contract manufacturing beauty products',
  ],
});

/**
 * The prototype links each card to its own /services/<slug> page. We have no
 * such pages, so each card starts the conversation it names: sourcing goes to
 * the quote list, the others to the contact form with the subject filled in.
 */
const SERVICES = [
  {
    title: 'Ingredient sourcing',
    body: 'Bring your ingredient list, required grade and target volume together. Let’s discuss material options and a practical supply plan.',
    href: '/quote-request',
    cta: 'Request a quote',
  },
  {
    title: 'Formulation support',
    body: 'Connect your product concept with ingredient choices, texture goals and the next steps in development. Start a focused conversation with our team.',
    href: `/contact?subject=${encodeURIComponent('Formulation support')}`,
    cta: 'Start a conversation',
  },
  {
    title: 'Private label',
    body: 'Explore private label possibilities with COCOJOJO. Bring your product idea, brand direction and packaging requirements to the conversation.',
    href: `/contact?subject=${encodeURIComponent('Private label')}`,
    cta: 'Start a conversation',
  },
  {
    title: 'Contract manufacturing',
    body: 'Discuss manufacturing for your formula, including material requirements, packaging and planned scale. Start with a clear technical and commercial brief.',
    href: `/contact?subject=${encodeURIComponent('Contract manufacturing')}`,
    cta: 'Start a conversation',
  },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />

      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">From concept to scale</span>
        <h1>Expertise for your next step.</h1>
        <p>Discuss sourcing, formulation, private label and manufacturing.</p>
      </div>

      <section className="r-wrap r-section">
        <div className="r-services-grid">
          {SERVICES.map((service) => (
            <Link key={service.title} href={service.href}>
              <FlaskConical size={24} aria-hidden="true" />
              <h2>{service.title}</h2>
              <p>{service.body}</p>
              <strong>{service.cta}</strong>
            </Link>
          ))}
        </div>
        <p className="r-fine r-services-terms">
          Private label and manufacturing projects are subject to our{' '}
          <Link href="/legal/wholesale-b2b-private-label-custom-manufacturing-terms">
            Wholesale, B2B, Private Label and Custom Manufacturing Terms
          </Link>
          .
        </p>
      </section>
    </>
  );
}
