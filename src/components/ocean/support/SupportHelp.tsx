import type { ReactNode } from 'react';
import { Package } from 'lucide-react';
import type { SupportFaqItem } from './faqData';

/** The reference's `PageIntro` (r-page-intro) — the page's single <h1>. */
export function SupportIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="r-page-intro r-wrap">
      <span className="r-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {copy && <p>{copy}</p>}
    </div>
  );
}

/** The reference's `Section` (r-wrap r-section). */
export function SupportSection({ children }: { children: ReactNode }) {
  return <section className="r-wrap r-section">{children}</section>;
}

/**
 * The reference FAQ body: `r-help-layout` with the `r-faq` accordion (native
 * <details>) and the "Read the complete policies." aside. Our policies live on
 * this site under /legal, so the aside links there rather than to cocojojo.com.
 */
export function SupportFaq({ items, before }: { items: SupportFaqItem[]; before?: ReactNode }) {
  const faq = (
    <div className="r-faq">
      {items.map(({ id, question, answer }) => (
        <details key={id} id={'faq-' + id}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
  return (
    <div className="r-help-layout">
      {before ? (
        <div>
          {before}
          {faq}
        </div>
      ) : (
        faq
      )}
      <aside className="r-reading-aside">
        <Package size={28} aria-hidden="true" />
        <h3>Read the complete policies.</h3>
        <p>
          These summaries do not replace the official terms. Your order confirmation or confirmed quote determines
          order-specific details.
        </p>
        <a href="/legal/shipping-policy">Official shipping policy</a>
        <a href="/legal/refund-policy">Official refund policy</a>
        <a href="/contact">Contact customer support</a>
      </aside>
    </div>
  );
}
