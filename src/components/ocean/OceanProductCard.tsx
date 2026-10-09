'use client';

import { useState } from 'react';
import { GitCompareArrows, Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatUsd, getDefaultVariant, getPriceRange } from '@/lib/pricing';
import { productImage } from '@/lib/gloss/images';
import { addProductToQuoteList, addReferenceToCart, useAddVariantToCart } from '@/lib/gloss/useUnifiedCart';
import { toggleCompare, toggleSavedReference, useCompare, useSavedReferences, notify } from '@/lib/gloss/stores';
import { useWishlistState } from '@/lib/useWishlistState';

/**
 * The ocean design's product card (reference retail-page.tsx `ProductCard` /
 * store-client.tsx `ClientCard` + `ProductActions`), markup unchanged.
 *
 * Two kinds of item:
 *  - `ours`: a product from our backend — "Add to cart" puts its default
 *    priced pack in the cart ("Ready to pay"); with no priced pack it goes to
 *    "Price to confirm". Wishlist is the account wishlist.
 *  - `reference`: a supplier reference from the copied reference catalog —
 *    "Request" puts it in "Price to confirm". Plain props only, so a server
 *    component can build it from src/lib/ocean data.
 */
export interface ReferenceCardData {
  slug: string;
  name: string;
  /** Category label, e.g. "Carrier oils". */
  category: string;
  categoryId: string;
  /** e.g. "Redox reference", "IMCD · product family" */
  sourceLabel: string;
  inci: string | null;
  /** Card subtitle when there is no INCI. */
  note?: string;
  image: string;
  sourceUrl: string;
  /** Defaults to /products/<slug>. */
  href?: string;
}

export type OceanCardItem = { kind: 'ours'; product: Product } | { kind: 'reference'; ref: ReferenceCardData };

export function OceanProductCard({ item }: { item: OceanCardItem }) {
  return item.kind === 'ours' ? <OurCard product={item.product} /> : <ReferenceCard data={item.ref} />;
}

function OurCard({ product: p }: { product: Product }) {
  const range = getPriceRange(p.variants || []);
  const variant = getDefaultVariant(p.variants || []);
  const href = '/products/' + p.slug;
  const category = p.category;
  return (
    <article className="r-product-card">
      <a className="r-product-photo" href={href}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage(p)}
          alt={p.imageUrl ? p.name : (category?.name || 'Ingredient') + ' representative ingredient texture'}
          width={420}
          height={370}
          loading="lazy"
        />
        <span>COCOJOJO ingredient</span>
      </a>
      <div className="r-product-info">
        {category && (
          <a className="r-card-category" href={'/categories/' + category.slug}>
            {category.name}
          </a>
        )}
        <h3>
          <a href={href}>{p.name}</a>
        </h3>
        <p>{p.inciName || 'View available technical information'}</p>
        <div className="r-card-price">
          {range ? formatUsd(range.min) : 'Price on request'}
          {range && variant?.label && <small>{variant.label}</small>}
        </div>
        <OurActions product={p} />
      </div>
    </article>
  );
}

function OurActions({ product: p }: { product: Product }) {
  const add = useAddVariantToCart();
  const { has, toggle } = useWishlistState();
  const compare = useCompare();
  const [busy, setBusy] = useState(false);
  const variant = getDefaultVariant(p.variants || []);
  const purchasable = !!variant && Number(variant.price) > 0;
  const saved = has(p.id);
  const compared = compare.some((c) => c.slug === p.slug);
  return (
    <div className="r-card-actions">
      <button
        type="button"
        disabled={busy}
        className="r-btn r-primary r-small"
        onClick={async () => {
          setBusy(true);
          if (purchasable && variant) await add(p, variant, 1);
          else await addProductToQuoteList(p, variant?.label || null, 1);
          setBusy(false);
        }}
      >
        <ShoppingBag size={16} />
        {purchasable ? 'Add to cart' : 'Request'}
      </button>
      <div className="r-secondary-actions">
        <button
          type="button"
          className={saved ? 'selected' : ''}
          aria-pressed={saved}
          aria-label={(saved ? 'Remove from wishlist: ' : 'Save ') + p.name}
          onClick={async () => {
            try {
              const now = await toggle(p.id);
              notify(now ? 'Saved to your wishlist' : 'Removed from wishlist');
            } catch {
              notify('Could not update your wishlist. Try again.');
            }
          }}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          className={compared ? 'selected' : ''}
          aria-pressed={compared}
          aria-label={(compared ? 'Remove from comparison: ' : 'Compare ') + p.name}
          onClick={() => toggleCompare({ slug: p.slug, name: p.name })}
        >
          <GitCompareArrows size={18} />
        </button>
      </div>
    </div>
  );
}

function ReferenceCard({ data: r }: { data: ReferenceCardData }) {
  const href = r.href || '/products/' + r.slug;
  return (
    <article className="r-product-card">
      <a className="r-product-photo" href={href}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={r.image} alt={r.category + ' representative ingredient texture'} width={420} height={370} loading="lazy" />
        <span>{r.sourceLabel}</span>
      </a>
      <div className="r-product-info">
        <a className="r-card-category" href={'/products?category=' + r.categoryId}>
          {r.category}
        </a>
        <h3>
          <a href={href}>{r.name}</a>
        </h3>
        <p>{r.inci || r.note || 'View available technical information'}</p>
        <div className="r-card-price">Price on request</div>
        <ReferenceActions data={r} />
      </div>
    </article>
  );
}

export function ReferenceActions({ data: r }: { data: ReferenceCardData }) {
  const saved = useSavedReferences().some((s) => s.slug === r.slug);
  const compared = useCompare().some((c) => c.slug === r.slug);
  const [busy, setBusy] = useState(false);
  return (
    <div className="r-card-actions">
      <button
        type="button"
        disabled={busy}
        className="r-btn r-primary r-small"
        onClick={async () => {
          setBusy(true);
          await addReferenceToCart({ slug: r.slug, name: r.name, category: r.category, sourceUrl: r.sourceUrl }, null, 1);
          setBusy(false);
        }}
      >
        <ShoppingBag size={16} />
        Request
      </button>
      <div className="r-secondary-actions">
        <button
          type="button"
          className={saved ? 'selected' : ''}
          aria-pressed={saved}
          aria-label={(saved ? 'Remove from wishlist: ' : 'Save ') + r.name}
          onClick={() => toggleSavedReference({ slug: r.slug, name: r.name })}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          className={compared ? 'selected' : ''}
          aria-pressed={compared}
          aria-label={(compared ? 'Remove from comparison: ' : 'Compare ') + r.name}
          onClick={() => toggleCompare({ slug: r.slug, name: r.name })}
        >
          <GitCompareArrows size={18} />
        </button>
      </div>
    </div>
  );
}
