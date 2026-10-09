import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { SupportIntro, SupportSection } from '@/components/ocean/support/SupportHelp';

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

      <SupportIntro
        eyebrow="Designed for more people"
        title="Accessibility & assistance."
        copy="We continue to improve clear navigation, readable information and keyboard access."
      />
      <SupportSection>
        <div className="r-policy-copy">
          <p>
            Use the skip link to reach the main content. Ingredient information remains available as text, and the
            interface respects reduced-motion preferences.
          </p>
          <p>
            We aim for WCAG 2.1 Level AA, but we do not claim full conformance: some parts may not fully meet it yet,
            including payment pages hosted by third parties and some older PDF documents.
          </p>
          <p>
            If you encounter a barrier, tell us the page and what you were trying to do so we can help. Email{' '}
            <a href="mailto:support@cocojojo.com?subject=Accessibility%20Issue%20Report">support@cocojojo.com</a> or
            call <a href="tel:+19496107164">(949) 610-7164</a>. We can also take an order, answer a product question
            or send a document in another format by phone or email. Our{' '}
            <a href="/legal/accessibility-statement">Accessibility Statement</a> describes our commitments in full.
          </p>
          <a className="r-btn r-primary" href="/contact?subject=Accessibility%20support">
            Request assistance
          </a>
        </div>
      </SupportSection>
    </>
  );
}
