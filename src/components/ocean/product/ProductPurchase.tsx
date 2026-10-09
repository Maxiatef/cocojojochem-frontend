'use client';

import { useEffect, useState } from 'react';
import { GitCompareArrows, Heart, Minus, Package, Plus, ShoppingBag } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { addProductToQuoteList, addReferenceToCart, useAddVariantToCart } from '@/lib/gloss/useUnifiedCart';
import { notify, toggleCompare, toggleSavedReference, useCompare, useSavedReferences } from '@/lib/gloss/stores';
import { useWishlistState } from '@/lib/useWishlistState';
import type { ReferenceCardData } from '@/components/ocean/OceanProductCard';

/**
 * The full purchase panel of the ingredient page (reference store-client.tsx
 * `ProductActions full`), markup unchanged, wired to our cart:
 *  - `OurPurchase`: our backend product. A priced pack goes to the cart
 *    ("Ready to pay"); "Request a size" or an unpriced pack goes to the
 *    cart's "Price to confirm" group. MOQ / per-order limits / stock /
 *    availability dates are enforced as before.
 *  - `ReferencePurchase`: a supplier reference — always "Price to confirm".
 */

const REQUEST = 'request';

function unitPrice(v: ProductVariant): number {
  return Number(v.effectivePrice ?? v.price);
}

function stockLabel(v: ProductVariant): string {
  return v.stockStatus === 'IN_STOCK' ? 'In stock' : v.stockStatus === 'ON_BACKORDER' ? 'On backorder' : 'Out of stock';
}

function Quantity({
  value,
  onChange,
  min = 1,
  max = 999,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.floor(n || min)));
  return (
    <div className="r-quantity">
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        <Minus size={15} />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        aria-label="Quantity"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        <Plus size={15} />
      </button>
    </div>
  );
}

export function OurPurchase({ product }: { product: Product }) {
  const variants = product.variants || [];
  const inStock = variants.filter((v) => v.stockStatus !== 'OUT_OF_STOCK');
  const [offerId, setOfferId] = useState<string>((inStock[0] || variants[0])?.id ?? REQUEST);
  const [quantity, setQuantity] = useState(1);
  const [requestedSize, setRequestedSize] = useState('');
  const [busy, setBusy] = useState(false);
  const addToCart = useAddVariantToCart();
  const { has, toggle } = useWishlistState();
  const compared = useCompare().some((c) => c.slug === product.slug);
  const saved = has(product.id);

  const variant = offerId === REQUEST ? null : variants.find((v) => v.id === offerId) || null;
  const price = variant ? unitPrice(variant) : null;
  const priced = price != null && price > 0;
  const notYetAvailable = !!variant?.availableFrom && new Date(variant.availableFrom) > new Date();
  const outOfStock = variant?.stockStatus === 'OUT_OF_STOCK';
  const min = variant?.moq && variant.moq > 1 ? variant.moq : 1;
  const max = variant?.limitPerOrder && variant.maxOrderQuantity ? variant.maxOrderQuantity : 999;

  // Keep the quantity inside the selected pack's minimum and per-order limit.
  useEffect(() => {
    if (quantity > max) setQuantity(max);
    else if (quantity < min) setQuantity(min);
  }, [quantity, min, max]);

  async function add() {
    if (busy) return;
    setBusy(true);
    if (variant && priced) {
      await addToCart(product, variant, quantity);
    } else {
      const label = variant
        ? variant.label || variant.sku
        : requestedSize.trim()
          ? 'Requested size: ' + requestedSize.trim()
          : 'Requested size';
      await addProductToQuoteList(product, label, quantity);
    }
    setBusy(false);
  }

  const stock = variant
    ? stockLabel(variant) +
      ' · SKU ' +
      variant.sku +
      (notYetAvailable && variant.availableFrom
        ? ' · Available ' +
          new Date(variant.availableFrom).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '') +
      (min > 1 ? ' · Minimum ' + min : '') +
      (variant.limitPerOrder && variant.maxOrderQuantity ? ' · Limit ' + variant.maxOrderQuantity + ' per order' : '')
    : 'Availability and pack size confirmed on request';

  return (
    <div className="r-purchase">
      <div className="r-price">
        {priced ? formatUsd(price as number) : 'Price on request'}
        <span>{priced ? 'USD · before shipping and tax' : 'Pricing confirmed before payment'}</span>
      </div>
      <label className="r-field">
        Pack size
        <select value={offerId} onChange={(e) => setOfferId(e.target.value)}>
          {variants.map((v) => {
            const p = unitPrice(v);
            return (
              <option key={v.id} value={v.id} disabled={v.stockStatus === 'OUT_OF_STOCK'}>
                {v.label || v.sku}
                {p > 0 ? ' · ' + formatUsd(p) : ''}
                {v.stockStatus === 'OUT_OF_STOCK' ? ' · out of stock' : ''}
              </option>
            );
          })}
          <option value={REQUEST}>Request a size</option>
        </select>
      </label>
      {offerId === REQUEST && (
        <label className="r-field">
          Preferred size
          <input
            value={requestedSize}
            onChange={(e) => setRequestedSize(e.target.value)}
            placeholder="For example, 100 g or 8 fl oz"
            maxLength={120}
          />
        </label>
      )}
      <div className="r-stock">
        <Package size={16} />
        {stock}
      </div>
      <div className="r-buy-row">
        <Quantity value={quantity} onChange={setQuantity} min={min} max={max} />
        <button
          type="button"
          disabled={busy || (!!variant && priced && (outOfStock || notYetAvailable))}
          className="r-btn r-primary"
          onClick={add}
        >
          <ShoppingBag size={18} />
          {outOfStock ? 'Out of stock' : notYetAvailable ? 'Not yet available' : 'Add to cart'}
        </button>
      </div>
      <p className="r-fine">
        {variant && priced
          ? 'Shipping is calculated at checkout by weight and destination.'
          : 'Our team confirms your selected size, grade and delivery timing.'}
      </p>
      <div className="r-secondary-actions">
        <button
          type="button"
          className={saved ? 'selected' : ''}
          aria-pressed={saved}
          aria-label={(saved ? 'Remove from wishlist: ' : 'Save ') + product.name}
          onClick={async () => {
            try {
              const now = await toggle(product.id);
              notify(now ? 'Saved to your wishlist' : 'Removed from wishlist');
            } catch {
              notify('Could not update your wishlist. Try again.');
            }
          }}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Wishlist'}
        </button>
        <button
          type="button"
          className={compared ? 'selected' : ''}
          aria-pressed={compared}
          aria-label={(compared ? 'Remove from comparison: ' : 'Compare ') + product.name}
          onClick={() => toggleCompare({ slug: product.slug, name: product.name })}
        >
          <GitCompareArrows size={18} />
          Compare
        </button>
      </div>
    </div>
  );
}

export function ReferencePurchase({ data: r }: { data: ReferenceCardData }) {
  const [quantity, setQuantity] = useState(1);
  const [requestedSize, setRequestedSize] = useState('');
  const [busy, setBusy] = useState(false);
  const saved = useSavedReferences().some((s) => s.slug === r.slug);
  const compared = useCompare().some((c) => c.slug === r.slug);
  return (
    <div className="r-purchase">
      <div className="r-price">
        Price on request
        <span>Pricing confirmed before payment</span>
      </div>
      {/* A supplier reference has no priced packs: the reference's list holds
          only its "Request a size" entry. */}
      <label className="r-field">
        Pack size
        <select value={REQUEST} onChange={() => {}}>
          <option value={REQUEST}>Request a size</option>
        </select>
      </label>
      <label className="r-field">
        Preferred size
        <input
          value={requestedSize}
          onChange={(e) => setRequestedSize(e.target.value)}
          placeholder="For example, 100 g or 8 fl oz"
          maxLength={120}
        />
      </label>
      <div className="r-stock">
        <Package size={16} />
        Availability and pack size confirmed on request
      </div>
      <div className="r-buy-row">
        <Quantity value={quantity} onChange={setQuantity} />
        <button
          type="button"
          disabled={busy}
          className="r-btn r-primary"
          onClick={async () => {
            setBusy(true);
            await addReferenceToCart(
              { slug: r.slug, name: r.name, category: r.category, sourceUrl: r.sourceUrl, image: r.image },
              requestedSize || null,
              quantity,
            );
            setBusy(false);
          }}
        >
          <ShoppingBag size={18} />
          Add to sourcing list
        </button>
      </div>
      <p className="r-fine">Supplier reference only. Specifications and availability are confirmed with your quote.</p>
      <div className="r-secondary-actions">
        <button
          type="button"
          className={saved ? 'selected' : ''}
          aria-pressed={saved}
          aria-label={(saved ? 'Remove from wishlist: ' : 'Save ') + r.name}
          onClick={() => toggleSavedReference({ slug: r.slug, name: r.name })}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Wishlist'}
        </button>
        <button
          type="button"
          className={compared ? 'selected' : ''}
          aria-pressed={compared}
          aria-label={(compared ? 'Remove from comparison: ' : 'Compare ') + r.name}
          onClick={() => toggleCompare({ slug: r.slug, name: r.name })}
        >
          <GitCompareArrows size={18} />
          Compare
        </button>
      </div>
    </div>
  );
}
