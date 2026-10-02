'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatUsd } from '@/lib/pricing';
import { RequestLine, useRequestList, useUnifiedCart } from '@/lib/gloss/useUnifiedCart';
import { EmptyState } from './EmptyState';
import { Quantity } from './Quantity';

/**
 * The prototype's `r-cart-lines` — used by the drawer and the cart page.
 *
 * One cart, two groups: "Ready to pay" (priced variants, paid by card at
 * checkout) and "Price to confirm" (the request list: supplier-reference
 * materials and sizes we price on request). A group's heading only shows when
 * both groups have lines; with one kind of line the cart reads as one list.
 */
export function CartLines() {
  const cart = useUnifiedCart();
  const requests = useRequestList();

  if (!cart.loaded || !requests.loaded) return <p className="r-loading">Loading your cart…</p>;

  if (!cart.lines.length && !requests.lines.length) {
    return (
      <EmptyState
        icon="cart"
        title="Your next creation starts here."
        text="Discover ingredients and add your favorites to your cart."
        href="/products"
        label="Explore ingredients"
      />
    );
  }

  const grouped = cart.lines.length > 0 && requests.lines.length > 0;

  return (
    <div className="r-cart-groups">
      {cart.lines.length > 0 && (
        <section aria-label="Ready to pay">
          {grouped && (
            <h3 className="r-cart-group-title">
              Ready to pay <span>{cart.count}</span>
            </h3>
          )}
          <div className="r-cart-lines">
            {cart.lines.map((line) => (
              <article className="r-cart-line" key={line.key}>
                <Link href={'/products/' + line.slug}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={line.image} alt={line.name} width={100} height={100} />
                </Link>
                <div>
                  <Link href={'/products/' + line.slug}>
                    <h3>{line.name}</h3>
                  </Link>
                  <p>{line.label || 'Size to confirm'}</p>
                  <strong>{formatUsd(line.unitPrice * line.quantity)}</strong>
                  <Quantity value={line.quantity} onChange={(n) => cart.update(line.key, n)} />
                </div>
                <button
                  className="r-icon-button"
                  aria-label={'Remove ' + line.name}
                  onClick={() => cart.remove(line.key)}
                >
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {requests.lines.length > 0 && (
        <section aria-label="Price to confirm">
          <h3 className="r-cart-group-title">
            Price to confirm <span>{requests.count}</span>
          </h3>
          <p className="r-cart-group-note">We confirm price and availability for these. They aren’t charged at checkout.</p>
          <div className="r-cart-lines">
            {requests.lines.map((line) => (
              <RequestCartLine
                key={line.key}
                line={line}
                onQuantity={(n) => requests.update(line.key, n)}
                onRemove={() => requests.remove(line.key)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RequestCartLine({
  line,
  onQuantity,
  onRemove,
}: {
  line: RequestLine;
  onQuantity: (n: number) => void;
  onRemove: () => void;
}) {
  return (
    <article className="r-cart-line is-request">
      <Link href={'/products/' + line.slug}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={line.image} alt={line.name} width={100} height={100} />
      </Link>
      <div>
        <Link href={'/products/' + line.slug}>
          <h3>{line.name}</h3>
        </Link>
        <p>{line.label || 'Size to confirm'}</p>
        {line.source === 'SUPPLIER_REFERENCE' && <small>Supplier reference · sourcing request</small>}
        <strong>Price to confirm</strong>
        <Quantity value={line.quantity} onChange={onQuantity} />
      </div>
      <button className="r-icon-button" aria-label={'Remove ' + line.name} onClick={onRemove}>
        <Trash2 size={18} />
      </button>
    </article>
  );
}

/**
 * The prototype's `r-totals`. Only the "Ready to pay" group is totalled;
 * "Price to confirm" items are listed as a count, never as $0.
 */
export function CartTotals() {
  const { subtotal, lines } = useUnifiedCart();
  const requests = useRequestList();
  return (
    <div className="r-totals">
      {lines.length > 0 && (
        <div>
          <span>Subtotal</span>
          <strong>{formatUsd(subtotal)}</strong>
        </div>
      )}
      {lines.length > 0 && (
        <div>
          <span>Shipping &amp; tax</span>
          <span>Calculated at checkout</span>
        </div>
      )}
      {requests.lines.length > 0 && (
        <div>
          <span>Price to confirm</span>
          <span>
            {requests.lines.length} item{requests.lines.length === 1 ? '' : 's'} · not included
          </span>
        </div>
      )}
      <p>
        {requests.lines.length > 0
          ? 'We’ll reply with pricing for the items to confirm. Nothing is charged for them at checkout.'
          : 'Bulk or custom sizes? Add them to your cart as a request and we’ll price them for you.'}
      </p>
    </div>
  );
}

/** Everything in the cart, priced or not — for badges and "is it empty". */
export function useCartTotalCount() {
  const cart = useUnifiedCart();
  const requests = useRequestList();
  return {
    count: cart.count + requests.count,
    hasLines: cart.lines.length + requests.lines.length > 0,
    saving: cart.saving || requests.saving,
  };
}
