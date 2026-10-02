'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, LoaderCircle, Package, ShoppingBag } from 'lucide-react';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { formatUsd } from '@/lib/pricing';
import { PublicQuote } from '@/lib/types';
import { acceptQuoteToCart, useAcceptedQuotes } from '@/lib/gloss/acceptedQuotes';
import { EmptyState } from '@/components/gloss/EmptyState';

/**
 * The customer's quote, reached from the link in the quote email.
 *
 * Accepting puts every priced line into the cart's "Ready to pay" group at
 * the quoted price; checkout then works as usual and the server charges the
 * quoted prices. Declining closes the request and tells our team.
 */
export default function QuotePage({ params }: { params: { token: string } }) {
  const token = params.token;
  const queryClient = useQueryClient();
  const accepted = useAcceptedQuotes();
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');

  const { data: quote, isLoading, isError } = useQuery({
    queryKey: ['public-quote', token],
    queryFn: () => customerApi.get<PublicQuote>(`/wholesale/quotes/${token}`),
    retry: false,
  });

  function refresh(next: PublicQuote) {
    queryClient.setQueryData(['public-quote', token], next);
    queryClient.invalidateQueries({ queryKey: ['customer-quote-requests'] });
  }

  async function accept() {
    setBusy('accept');
    setError(null);
    try {
      refresh(await acceptQuoteToCart(token));
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function decline() {
    setBusy('decline');
    setError(null);
    try {
      refresh(await customerApi.post<PublicQuote>(`/wholesale/quotes/${token}/decline`, { reason: reason || undefined }));
      // A declined quote leaves the cart.
      await accepted.remove(token).catch(() => {});
      setDeclining(false);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) {
    return (
      <section className="r-wrap r-section" aria-busy="true">
        <p className="r-loading">Loading your quote…</p>
      </section>
    );
  }

  if (isError || !quote) {
    return (
      <>
        <div className="r-page-intro r-wrap">
          <span className="r-eyebrow">Quote</span>
          <h1>We couldn’t find this quote.</h1>
          <p>The link may be incomplete. Open it again from your quote email, or reply to that email and we’ll help.</p>
        </div>
        <section className="r-wrap r-section">
          <EmptyState title="Quote not found." text="Check the link in your email." href="/contact" label="Contact us" />
        </section>
      </>
    );
  }

  const open = quote.status === 'QUOTED' && !quote.paid;
  const inCart = open && !!quote.acceptedAt && accepted.tokens.includes(token);
  const shipping = quote.shippingCost;

  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">{quote.kind === 'ORDER' ? 'Order request' : 'Quote request'} · {quote.reference}</span>
        <h1>Your quote.</h1>
        <p>
          {quote.paid
            ? 'This quote has been paid. Thank you — your order confirmation has the details.'
            : quote.status === 'LOST'
              ? 'This quote is closed.'
              : 'Prices for the items you asked about. Accept to add them to your cart at these prices, then check out as usual.'}
        </p>
      </div>

      <section className="r-wrap r-section">
        <div className="r-checkout-layout">
          <div className="r-form-card">
            {quote.quoteMessage && <p className="ga-quote-message">{quote.quoteMessage}</p>}

            <div className="ga-quote-table" role="table" aria-label="Quoted items">
              <div role="row" className="ga-quote-row ga-quote-head">
                <span role="columnheader">Item</span>
                <span role="columnheader">Qty</span>
                <span role="columnheader">Unit price</span>
                <span role="columnheader">Total</span>
              </div>
              {quote.items.map((i) => {
                const priced = i.isAvailable && i.unitPrice != null;
                return (
                  <div role="row" className={`ga-quote-row${priced ? '' : ' is-muted'}`} key={i.id}>
                    <span role="cell">
                      <strong>{i.productName}</strong>
                      <small>
                        {[i.packSize, i.availability].filter(Boolean).join(' · ') || 'Size to confirm'}
                        {i.source === 'SUPPLIER_REFERENCE' ? ' · Sourced on request' : ''}
                      </small>
                      {i.note && <small>{i.note}</small>}
                    </span>
                    <span role="cell">{i.quantity}</span>
                    <span role="cell">{priced ? formatUsd(i.unitPrice as number) : '—'}</span>
                    <span role="cell">
                      {priced ? formatUsd((i.unitPrice as number) * i.quantity) : i.isAvailable ? 'Not priced' : 'Not available'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="r-totals">
              <div>
                <span>Items</span>
                <strong>{formatUsd(quote.subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <span>{shipping != null ? formatUsd(shipping) : 'Calculated at checkout'}</span>
              </div>
              <div className="ga-grand">
                <span>Quote total</span>
                <strong>
                  {formatUsd(quote.subtotal + (shipping ?? 0))}
                  {shipping == null ? ' + shipping' : ''}
                </strong>
              </div>
              <p>Sales tax, where it applies, is added at checkout. These prices stay valid until you accept or decline.</p>
            </div>

            {error && (
              <p className="r-error" role="alert">
                {error}
              </p>
            )}

            {quote.paid && (
              <div className="r-confirmation">
                <CircleCheck size={40} aria-hidden />
                <p>Paid. Your order confirmation email has the details.</p>
                <Link className="r-btn r-outline" href="/account/orders">
                  View my orders
                </Link>
              </div>
            )}

            {quote.status === 'LOST' && (
              <p className="r-muted-panel">
                {quote.declinedAt ? 'You declined this quote.' : 'We closed this request.'}
                {quote.closeReason ? ` ${quote.closeReason}` : ''} Need these items after all?{' '}
                <Link href="/contact" className="ga-link">
                  Contact us
                </Link>
                .
              </p>
            )}

            {open && !inCart && !declining && (
              <div className="ga-actions">
                <button type="button" className="r-btn r-primary" disabled={busy !== null} onClick={accept}>
                  {busy === 'accept' ? <LoaderCircle className="r-spin" size={17} aria-hidden /> : <ShoppingBag size={17} aria-hidden />}
                  Accept &amp; add to cart
                </button>
                <button type="button" className="r-btn r-outline" disabled={busy !== null} onClick={() => setDeclining(true)}>
                  Decline quote
                </button>
              </div>
            )}

            {open && inCart && !declining && (
              <div className="ga-actions">
                <Link className="r-btn r-primary" href="/checkout">
                  Go to checkout
                </Link>
                <Link className="r-btn r-outline" href="/cart">
                  View cart
                </Link>
                <button type="button" className="r-text-button" onClick={() => setDeclining(true)}>
                  Decline quote
                </button>
              </div>
            )}

            {open && declining && (
              <div className="ga-stack">
                <div className="r-field">
                  <label htmlFor="decline-reason">
                    Tell us why <small>optional</small>
                  </label>
                  <textarea
                    id="decline-reason"
                    rows={3}
                    maxLength={2000}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Price, lead time, found elsewhere…"
                  />
                </div>
                <div className="ga-actions">
                  <button type="button" className="r-btn r-primary" disabled={busy !== null} onClick={decline}>
                    {busy === 'decline' ? 'Declining…' : 'Decline quote'}
                  </button>
                  <button type="button" className="r-btn r-outline" onClick={() => setDeclining(false)}>
                    Keep it open
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="r-summary">
            <h2>How it works</h2>
            <ol className="ga-quote-steps">
              <li>Accept the quote — the priced items go into your cart at these prices.</li>
              <li>Add anything else you need.</li>
              <li>Check out and pay by card. Quoted quantities are fixed.</li>
            </ol>
            <div className="r-summary-help">
              <Package size={22} aria-hidden />
              <p>Questions about grade, documents or delivery? Reply to your quote email.</p>
            </div>
            {quote.destination && <p className="r-fine">Delivery to {quote.destination}</p>}
          </aside>
        </div>
      </section>
    </>
  );
}
