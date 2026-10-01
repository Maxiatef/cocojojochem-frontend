'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GitCompareArrows, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatUsd, getDefaultVariant, getPriceRange } from '@/lib/pricing';
import { productImage } from '@/lib/gloss/images';
import { notify, toggleCompare, useCompare } from '@/lib/gloss/stores';
import { addProductToQuoteList, useAddVariantToCart } from '@/lib/gloss/useUnifiedCart';
import { useWishlistState } from '@/lib/useWishlistState';

/** Wishlist heart, using the account wishlist when signed in. */
export function WishlistToggle({ product, labelled = false }: { product: Pick<Product, 'id' | 'name'>; labelled?: boolean }) {
  const { has, toggle } = useWishlistState();
  const [busy, setBusy] = useState(false);
  const saved = has(product.id);
  return (
    <button
      type="button"
      disabled={busy}
      className={saved ? 'selected' : ''}
      aria-pressed={saved}
      aria-label={(saved ? 'Remove from wishlist: ' : 'Save ') + product.name}
      onClick={async () => {
        setBusy(true);
        try {
          const now = await toggle(product.id);
          notify(now ? 'Saved to your wishlist' : 'Removed from wishlist');
        } catch {
          notify('Could not update your wishlist. Try again.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      {labelled ? (saved ? 'Saved' : 'Wishlist') : null}
    </button>
  );
}

/** Compare toggle, capped at four like the prototype. */
export function CompareToggle({ product, labelled = false }: { product: Pick<Product, 'slug' | 'name'>; labelled?: boolean }) {
  const list = useCompare();
  const on = list.some((i) => i.slug === product.slug);
  return (
    <button
      type="button"
      className={on ? 'selected' : ''}
      aria-pressed={on}
      aria-label={(on ? 'Remove from comparison: ' : 'Compare ') + product.name}
      onClick={() => toggleCompare({ slug: product.slug, name: product.name })}
    >
      <GitCompareArrows size={18} />
      {labelled ? 'Compare' : null}
    </button>
  );
}

/**
 * The card's action row (`r-card-actions`): add the default pack size to the
 * cart, or — for a product with no priced size — add it to the quote list.
 */
export function CardActions({ product }: { product: Product }) {
  const add = useAddVariantToCart();
  const [busy, setBusy] = useState(false);
  const variant = getDefaultVariant(product.variants || []);
  const purchasable = !!variant && Number(variant.price) > 0;

  return (
    <div className="r-card-actions">
      <button
        type="button"
        disabled={busy}
        className="r-btn r-primary r-small"
        onClick={async () => {
          setBusy(true);
          if (purchasable && variant) await add(product, variant, 1);
          else await addProductToQuoteList(product, variant?.label || null, 1);
          setBusy(false);
        }}
      >
        <ShoppingBag size={16} />
        {purchasable ? 'Add to cart' : 'Request'}
      </button>
      <div className="r-secondary-actions">
        <WishlistToggle product={product} />
        <CompareToggle product={product} />
      </div>
    </div>
  );
}

/** The prototype's `r-product-card`, fed by a catalog Product. */
export function ProductCard({ product }: { product: Product }) {
  const range = getPriceRange(product.variants || []);
  const category = product.category;
  return (
    <article className="r-product-card">
      <Link className="r-product-photo" href={'/products/' + product.slug}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage(product)}
          alt={product.imageUrl ? product.name : (category?.name || 'Ingredient') + ' representative ingredient texture'}
          width={420}
          height={370}
          loading="lazy"
        />
        <span>COCOJOJO</span>
      </Link>
      <div className="r-product-info">
        {category ? (
          <Link className="r-card-category" href={'/categories/' + category.slug}>
            {category.name}
          </Link>
        ) : (
          <span className="r-card-category">Ingredient</span>
        )}
        <h3>
          <Link href={'/products/' + product.slug}>{product.name}</Link>
        </h3>
        <p>{product.inciName || 'View ingredient specifications'}</p>
        <div className="r-card-price">{range ? 'From ' + formatUsd(range.min) : 'Price on request'}</div>
        <CardActions product={product} />
      </div>
    </article>
  );
}
