import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { FaqList } from '@/components/gloss/content/FaqList';
import { PolicyAside } from '@/components/gloss/content/PolicyAside';
import { SHIPPING_PAGE_ITEMS } from '@/components/gloss/content/faqData';

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

      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Ordering with confidence</span>
        <h1>Shipping, returns &amp; support.</h1>
        <p>The details to help you plan your next order.</p>
      </div>

      <section className="r-wrap r-section">
        <div className="r-help-layout">
          <div>
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
            <FaqList items={SHIPPING_PAGE_ITEMS} />
          </div>
          <PolicyAside />
        </div>
      </section>
    </>
  );
}
