import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { SupportFaq, SupportIntro, SupportSection } from '@/components/ocean/support/SupportHelp';
import { SHIPPING_PAGE_ITEMS } from '@/components/ocean/support/faqData';

export const metadata: Metadata = pageMetadata({
  title: 'Shipping & Returns',
  description:
    'How COCOJOJO ships wholesale ingredient orders: shipping calculated at checkout, 2–4 business days processing, 7–14 business days in transit, international quotes, and our 30-day return process.',
  path: '/shipping-returns',
  keywords: [
    'cosmetic ingredient shipping',
    'wholesale ingredient returns',
    'ingredient supplier refund policy',
    'international ingredient shipping quote',
  ],
});

/**
 * Summaries only — the source of truth is the Shipping Policy and Refund
 * Policy in `@/lib/legalPolicies`, linked from the aside.
 */
export default function ShippingReturnsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shipping & Returns', path: '/shipping-returns' },
        ])}
      />

      <SupportIntro
        eyebrow="Ordering with confidence"
        title="Shipping, returns & support."
        copy="The details to help you plan your next order."
      />
      <SupportSection>
        <SupportFaq
          items={SHIPPING_PAGE_ITEMS}
          before={
            <dl className="r-ship-facts">
              <div>
                <dt>Handling time</dt>
                <dd>2–4 business days, Monday–Friday</dd>
              </div>
              <div>
                <dt>Transit time</dt>
                <dd>7–14 business days, Monday–Friday</dd>
              </div>
              <div>
                <dt>Order cut-off</dt>
                <dd>5:00 PM Eastern Time</dd>
              </div>
            </dl>
          }
        />
      </SupportSection>
    </>
  );
}
