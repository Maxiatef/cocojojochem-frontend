import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { NewsletterPreferences } from '@/components/ocean/Newsletter';

export const metadata: Metadata = pageMetadata({
  title: 'Email preferences',
  description: 'Choose your COCOJOJO email updates or unsubscribe whenever you like.',
  path: '/email-preferences',
  noIndex: true,
});

/** Reached from the private link a newsletter signup returns (/email-preferences#<token>). */
export default function EmailPreferencesPage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Stay in the loop</span>
        <h1>Email preferences.</h1>
        <p>Choose your updates or unsubscribe whenever you like.</p>
      </div>
      <section className="r-wrap r-section">
        <NewsletterPreferences />
      </section>
    </>
  );
}
