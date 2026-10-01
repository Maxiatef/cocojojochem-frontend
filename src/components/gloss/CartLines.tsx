'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatUsd } from '@/lib/pricing';
import { useUnifiedCart } from '@/lib/gloss/useUnifiedCart';
import { EmptyState } from './EmptyState';
import { Quantity } from './Quantity';

/** The prototype's `r-cart-lines` — used by the drawer and the cart page. */
export function CartLines() {
  const cart = useUnifiedCart();

  if (!cart.loaded) return <p className="r-loading">Loading your cart…</p>;

  if (!cart.lines.length) {
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

  return (
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
          <button className="r-icon-button" aria-label={'Remove ' + line.name} onClick={() => cart.remove(line.key)}>
            <Trash2 size={18} />
          </button>
        </article>
      ))}
    </div>
  );
}

/** The prototype's `r-totals`. Shipping and tax are worked out at checkout. */
export function CartTotals() {
  const { subtotal } = useUnifiedCart();
  return (
    <div className="r-totals">
      <div>
        <span>Subtotal</span>
        <strong>{formatUsd(subtotal)}</strong>
      </div>
      <div>
        <span>Shipping &amp; tax</span>
        <span>Calculated at checkout</span>
      </div>
      <p>Bulk or custom sizes? Add them to your quote list and we’ll price them for you.</p>
    </div>
  );
}
