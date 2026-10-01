import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { FaqList } from '@/components/gloss/content/FaqList';
import { PolicyAside } from '@/components/gloss/content/PolicyAside';
import { FAQ_PAGE_ITEMS } from '@/components/gloss/content/faqData';

export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Answers about ordering wholesale cosmetic ingredients from COCOJOJO: minimum order, bulk quotes, SDS and COA documents, Stripe payment, shipping times, international orders and returns.',
  path: '/faq',
  keywords: [
    'cosmetic ingredient supplier FAQ',
    'wholesale ingredient ordering',
    'bulk ingredient quote',
    'SDS COA request',
    'ingredient shipping and returns',
  ],
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_PAGE_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          },
        ]}
      />

      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">A little clarity goes a long way</span>
        <h1>Your questions, answered.</h1>
        <p>The details to help you plan your next order.</p>
      </div>

      <section className="r-wrap r-section">
        <div className="r-help-layout">
          <FaqList items={FAQ_PAGE_ITEMS} />
          <PolicyAside />
        </div>
      </section>
    </>
  );
}
