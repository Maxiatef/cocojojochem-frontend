import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: 'Accessibility & Assistance',
  description:
    'How to get help if something on the COCOJOJO store is hard to use: report an accessibility barrier, request documents in another format, or order by phone or email.',
  path: '/accessibility',
});

/**
 * Deliberately modest. It states what this site actually does and how to get
 * help; the formal commitments live in the Accessibility Statement under
 * /legal, which this page links to rather than restating. No conformance or
 * certification is claimed here.
 */
export default function AccessibilityPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Accessibility', path: '/accessibility' },
        ])}
      />

      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Designed for more people</span>
        <h1>Accessibility &amp; assistance.</h1>
        <p>We continue to improve clear navigation, readable information and keyboard access.</p>
      </div>

      <section className="r-wrap r-section">
        <div className="r-policy-copy">
          <p>
            Use the skip link at the top of every page to reach the main content. Ingredient
            information is available as text, controls can be reached with a keyboard, and much of
            the interface’s motion is reduced when your device asks for reduced motion.
          </p>
          <p>
            We aim for WCAG 2.1 Level AA, but we do not claim full conformance: some parts may not
            fully meet it yet, including payment pages hosted by third parties and some older PDF
            documents.
          </p>
          <p>
            If you encounter a barrier, tell us the page and what you were trying to do so we can
            help. Email{' '}
            <a href="mailto:support@cocojojo.com?subject=Accessibility%20Issue%20Report">
              support@cocojojo.com
            </a>{' '}
            with the subject “Accessibility Issue Report”, or call{' '}
            <a href="tel:+19496107164">(949) 610-7164</a>. We can also take an order, answer a
            product question or send a document in another format by phone or email.
          </p>
          <p>
            Our{' '}
            <Link href="/legal/accessibility-statement">Accessibility Statement</Link> describes
            our commitments and response times in full.
          </p>
          <Link className="r-btn r-primary" href="/contact?subject=Accessibility%20support">
            Request assistance
          </Link>
        </div>
      </section>
    </>
  );
}
