import Link from 'next/link';
import { ContactForm } from '@/components/gloss/content/ContactForm';

/**
 * Contact, in the Gloss Studio layout (prototype /contact).
 *
 * Metadata and breadcrumb JSON-LD live in ./layout.tsx. The form is the same
 * `POST /wholesale/contact-messages` it always was — see ContactForm.
 */
export default function ContactPage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Talk to our team</span>
        <h1>Let’s create something good.</h1>
        <p>Ingredient questions, documentation and projects are welcome.</p>
      </div>

      <section className="r-wrap r-section">
        <div className="r-checkout-layout">
          <ContactForm />

          <aside className="r-summary">
            <h2>Prefer to speak with us?</h2>
            <p>Discuss an ingredient, request a document or tell us about your project.</p>
            <a href="mailto:support@cocojojo.com">support@cocojojo.com</a>
            <a href="tel:+19496107164">+1 949 610 7164</a>
            <p className="r-fine r-contact-hours">Monday – Friday, 9:00 AM – 6:00 PM Pacific</p>
            <p className="r-fine r-contact-hours">California, United States</p>
            <Link href="/quote-request">Need bulk pricing? Request a quote</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
