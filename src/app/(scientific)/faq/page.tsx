import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { SupportFaq, SupportIntro, SupportSection } from '@/components/ocean/support/SupportHelp';
import { FAQ_PAGE_ITEMS } from '@/components/ocean/support/faqData';

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

      <SupportIntro
        eyebrow="A little clarity goes a long way"
        title="Your questions, answered."
        copy="The details to help you plan your next order."
      />
      <SupportSection>
        <SupportFaq items={FAQ_PAGE_ITEMS} />
      </SupportSection>
    </>
  );
}
