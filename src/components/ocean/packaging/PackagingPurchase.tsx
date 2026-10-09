'use client';

import { useState } from 'react';
import { GitCompareArrows, Heart, Minus, Package, Plus, ShoppingBag } from 'lucide-react';
import { addReferenceToCart } from '@/lib/gloss/useUnifiedCart';
import { toggleCompare, toggleSavedReference, useCompare, useSavedReferences } from '@/lib/gloss/stores';
import type { ReferenceCardData } from '@/components/ocean/OceanProductCard';

/**
 * The full purchase panel on a packaging detail page (reference store-client
 * `ProductActions full`). Packaging has no price, so the chosen size and
 * quantity go to the cart's "Price to confirm" section.
 */
export function PackagingPurchase({ data: r }: { data: ReferenceCardData }) {
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
      {/* Packaging has no priced packs, so the reference's pack-size list has
          only its "Request a size" entry. Kept for the identical layout. */}
      <label className="r-field">
        Pack size
        <select value="request" onChange={() => {}}>
          <option value="request">Request a size</option>
        </select>
      </label>
      <label className="r-field">
        Preferred size
        <input
          value={requestedSize}
          onChange={(e) => setRequestedSize(e.target.value)}
          placeholder="For example, 30 ml bottle, 1,000 units"
          maxLength={120}
        />
      </label>
      <div className="r-stock">
        <Package size={16} />
        Availability and pack size confirmed on request
      </div>
      <div className="r-buy-row">
        <div className="r-quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus size={15} />
          </button>
          <input
            type="number"
            min={1}
            max={999}
            aria-label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(999, Math.floor(Number(e.target.value) || 1))))}
          />
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= 999}
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus size={15} />
          </button>
        </div>
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
