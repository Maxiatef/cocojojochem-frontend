'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { CircleCheck, LoaderCircle, Package } from 'lucide-react';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { requestReference } from '@/lib/types';
import { RequestLine, requestItemsPayload } from '@/lib/gloss/useUnifiedCart';

/**
 * Checkout when every cart line is "Price to confirm": no payment, just a
 * request. The customer chooses what it is:
 *  - order request — ready to buy, gives a delivery address;
 *  - quote request — pricing only, no address needed.
 * Either way we reply with a quote they can accept into their cart. Submitting sends it to us (it lands in Admin →
 * Quote Requests) and empties the request list; the reference shown on
 * success is how the customer and our team refer to it.
 */
export function OrderRequestForm({
  lines,
  signedIn,
  defaultEmail,
  onSubmitted,
}: {
  lines: RequestLine[];
  signedIn: boolean;
  defaultEmail: string;
  onSubmitted: () => Promise<void> | void;
}) {
  const [kind, setKind] = useState<'ORDER' | 'QUOTE'>('ORDER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const isOrder = kind === 'ORDER';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await customerApi.post<{ id: string }>('/wholesale/quote-requests', {
        fullName,
        email: email || defaultEmail,
        companyName: companyName || undefined,
        phone: phone || undefined,
        kind,
        destination: kind === 'ORDER' ? destination : destination || undefined,
        message: message || undefined,
        type: 'QUOTE',
        items: requestItemsPayload(lines),
        website: website || undefined,
      });
      setReference(requestReference(created.id));
      await onSubmitted();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="r-confirmation">
        <CircleCheck size={54} aria-hidden />
        <span className="r-eyebrow">Successfully received</span>
        <h2>Your {isOrder ? 'order' : 'quote'} request is sent.</h2>
        <p>
          Reference <strong>{reference}</strong>
        </p>
        <p>
          {isOrder ? 'Your order is not confirmed yet. ' : ''}We’ve emailed you a confirmation. Next, we’ll email your
          quote — accept it and the items go into your cart at the quoted prices.
        </p>
        <p>
          {signedIn
            ? 'You can follow its status in your account.'
            : 'Keep this reference — we’ll quote it in our reply. Signed-in customers can also follow requests in their account.'}
        </p>
        <p className="r-fine">No payment has been taken.</p>
        <Link className="r-btn r-primary" href={signedIn ? '/account' : '/products'}>
          {signedIn ? 'View your requests' : 'Continue browsing'}
        </Link>
        {signedIn && (
          <Link className="r-btn r-outline" href="/products">
            Continue browsing
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="r-checkout-layout">
      <form className="r-form-card" onSubmit={handleSubmit}>
        <div className="r-step-label">
          <span>1</span> Your details <span>2</span> Review &amp; submit
        </div>
        <h2>{isOrder ? 'Complete your order request' : 'Request a quote'}</h2>
        <p>
          {isOrder
            ? 'Send these items for pricing, availability and delivery confirmation. No payment is taken.'
            : 'Get prices and availability for these items. No payment is taken and you don’t need to give an address.'}
        </p>
        <fieldset className="ga-kind">
          <legend>What would you like?</legend>
          <label className="ga-check">
            <input type="radio" name="kind" checked={isOrder} onChange={() => setKind('ORDER')} />
            <span>
              <strong>Order these items</strong>
              <small>I’m ready to buy — confirm prices and delivery to my address.</small>
            </span>
          </label>
          <label className="ga-check">
            <input type="radio" name="kind" checked={!isOrder} onChange={() => setKind('QUOTE')} />
            <span>
              <strong>Just a price quote</strong>
              <small>I’m comparing options — send me prices only.</small>
            </span>
          </label>
        </fieldset>
        <div className="r-form-grid">
          <div className="r-field">
            <label htmlFor="or-name">Full name</label>
            <input
              id="or-name"
              required
              autoComplete="name"
              maxLength={120}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="r-field">
            <label htmlFor="or-email">Email address</label>
            <input
              id="or-email"
              type="email"
              required
              autoComplete="email"
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="r-field">
            <label htmlFor="or-company">
              Company <small>optional</small>
            </label>
            <input
              id="or-company"
              autoComplete="organization"
              maxLength={200}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="r-field">
            <label htmlFor="or-phone">
              Phone <small>optional</small>
            </label>
            <input
              id="or-phone"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="r-field r-full">
            <label htmlFor="or-destination">
              Shipping city, state &amp; country {!isOrder && <small>optional</small>}
            </label>
            <input
              id="or-destination"
              required={isOrder}
              autoComplete="address-level2"
              maxLength={600}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Austin, TX, United States"
            />
          </div>
          <div className="r-field r-full">
            <label htmlFor="or-notes">
              Notes &amp; requirements <small>optional</small>
            </label>
            <textarea
              id="or-notes"
              rows={5}
              maxLength={5000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Preferred pack size, grade, intended use or delivery needs."
            />
          </div>
          {/* Spam trap: hidden from people and from screen readers. */}
          <div className="r-honeypot" aria-hidden="true">
            <label htmlFor="or-website">Website</label>
            <input
              id="or-website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </div>

        <label className="r-consent">
          <input type="checkbox" required />
          I understand this sends {isOrder ? 'an order' : 'a quote'} request. Prices and availability are confirmed
          before anything is charged. <Link href="/legal/privacy-policy">Privacy information</Link>
        </label>

        {error && (
          <p className="r-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="r-btn r-primary" disabled={submitting}>
          {submitting ? (
            <>
              <LoaderCircle className="r-spin" size={17} aria-hidden />
              Submitting…
            </>
          ) : (
            isOrder ? 'Submit order request' : 'Request a quote'
          )}
        </button>
        <p className="r-fine">Your reference number appears as soon as the request is sent.</p>
      </form>

      <aside className="r-summary">
        <h2>Review your request</h2>
        <RequestSummaryList lines={lines} />
        <div className="r-summary-help">
          <Package size={22} aria-hidden />
          <p>We confirm price, grade and availability for each item, then reply by email.</p>
        </div>
        <Link href="/cart">Edit your cart</Link>
        <Link href="/shipping-returns">Shipping &amp; return information</Link>
      </aside>
    </div>
  );
}

/** The "Price to confirm" lines, compact, for checkout summaries. */
export function RequestSummaryList({ lines }: { lines: RequestLine[] }) {
  return (
    <ul className="r-summary-requests">
      {lines.map((l) => (
        <li key={l.key}>
          <span>
            {l.name} × {l.quantity}
            {l.label ? ` · ${l.label}` : ''}
            {l.source === 'SUPPLIER_REFERENCE' && (
              <>
                <br />
                <span className="r-ref-badge">Supplier reference</span>
              </>
            )}
          </span>
          <span>Price to confirm</span>
        </li>
      ))}
    </ul>
  );
}
