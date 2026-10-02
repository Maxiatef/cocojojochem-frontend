'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { useRequestList } from '@/lib/gloss/useUnifiedCart';
import { EmptyState } from '@/components/gloss/EmptyState';
import { RequestSummaryList } from '@/components/gloss/workspace/OrderRequestForm';

/**
 * What a buyer actually needs to know before sending a request. The page is
 * otherwise a form, and a form is almost no indexable text — this is the only
 * substantive copy on the route.
 */
const QUOTING_SECTIONS: { title: string; text: string }[] = [
  {
    title: 'A useful quote starts with a clear brief',
    text: `A useful quote starts with a clear brief. Specifically, tell us the material, the grade, the quantity and the delivery destination, and we can usually come back with pricing and availability within one business day. Where a specification is still open, describe the behaviour you need in the formulation and we will suggest candidates that fit.`,
  },
  {
    title: 'Pricing and volume',
    text: `Wholesale pricing moves with volume, pack size and current material cost. Consequently, a price confirmed against a drum quantity will differ from the same material in a 5 kg pail. Additionally, tell us your expected annual usage rather than only the first order — it changes which price band applies and whether we hold stock against your forecast.`,
  },
  {
    title: 'Lead times and stock',
    text: `Stock positions shown in the catalog reflect what is available now. However, availability moves as material ships, so a quote confirms both the price and the quantity we can commit to. Meanwhile, if you are planning a production run several weeks out, say so in the request — we can reserve material or schedule it to arrive against your date.`,
  },
  {
    title: 'Documentation and compliance',
    text: `Most buyers need paperwork before a material can enter a formulation. Therefore, tell us which documents you require: safety data sheets, technical data sheets, certificates of analysis, or origin and allergen statements. In particular, batch-specific documentation has to be requested against the lot you receive, so flag it early rather than after delivery.`,
  },
  {
    title: 'Samples and sourcing to order',
    text: `A significant share of what we ship is sourced to order against a customer specification. Similarly, if a material is not listed in the catalog it is still worth asking. Finally, where you need to trial a material before committing to volume, request a sample in the same message and we will quote both together.`,
  },
];

/**
 * The request list now lives in the cart ("Price to confirm") and is sent
 * from checkout as an order request, so this page shows what is waiting and
 * sends people there. The guide below stays: it is the page's indexable
 * content.
 */
function RequestListPanel() {
  const requests = useRequestList();

  if (!requests.loaded) return <p className="r-loading">Loading your cart…</p>;

  if (requests.lines.length === 0) {
    return (
      <EmptyState
        title="Nothing waiting for a price."
        text="Choose Request, or Add to cart on a supplier reference material, and it joins your cart under “Price to confirm”. Send everything from checkout in one request."
        href="/products"
        label="Browse ingredients"
      />
    );
  }

  return (
    <div className="r-checkout-layout">
      <div className="r-form-card">
        <h2>Ready to send.</h2>
        <p>
          {requests.lines.length} item{requests.lines.length === 1 ? ' is' : 's are'} in your cart under “Price to
          confirm”. Send them from checkout — on their own as an order request, or together with priced items you pay
          for now.
        </p>
        <Link className="r-btn r-primary" href="/checkout">
          Submit order request
        </Link>
        <Link className="r-btn r-outline" href="/cart">
          Review cart
        </Link>
        <p className="r-fine">No payment is taken for items marked “Price to confirm”.</p>
      </div>
      <aside className="r-summary">
        <h2>Price to confirm</h2>
        <RequestSummaryList lines={requests.lines} />
        <div className="r-summary-help">
          <Package size={22} />
          <p>We confirm price, grade and availability for each item, then reply by email.</p>
        </div>
      </aside>
    </div>
  );
}

export default function QuoteRequestPage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Let’s make the right connection</span>
        <h1>Request a quote.</h1>
        <p>
          Add the ingredients you need priced to your cart, then send them in one order request from checkout. We reply
          with trade pricing and lead times.
        </p>
      </div>

      <section className="r-wrap r-section">
        <RequestListPanel />
      </section>

      <section className="r-wrap r-section r-quote-guide">
        <div className="r-help-layout">
          <div>
            <span className="r-eyebrow">Before you send</span>
            <h2>How quoting works.</h2>
            <div className="r-faq">
              {QUOTING_SECTIONS.map((s, i) => (
                <details key={s.title} open={i === 0}>
                  <summary>{s.title}</summary>
                  <p>{s.text}</p>
                </details>
              ))}
            </div>
          </div>
          <aside className="r-reading-aside">
            <Package size={28} />
            <h3>From first formulation to full-scale production.</h3>
            <ol>
              <li>Choose your ingredients</li>
              <li>Tell us your requirements</li>
              <li>Start a sourcing conversation</li>
            </ol>
            <Link href="/contact">Ask an ingredient question</Link>
            <Link href="/shipping-returns">Shipping &amp; returns</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
