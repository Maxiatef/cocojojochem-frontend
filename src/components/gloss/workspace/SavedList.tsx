'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/gloss/ProductCard';
import { EmptyState } from '@/components/gloss/EmptyState';
import { useSavedProducts } from './useSavedProducts';

/** The prototype's wishlist (fn V): a product grid, or the empty state. */
export function SavedList() {
  const { products, loading, signedIn } = useSavedProducts();

  if (loading) return <p className="r-loading">Loading your wishlist…</p>;

  if (!products.length) {
    return (
      <EmptyState
        title="Save a little inspiration."
        text="Keep ingredients here while you plan your next formula."
        href="/products"
        label="Find ingredients"
      />
    );
  }

  return (
    <>
      {!signedIn && (
        <p className="r-muted-panel">
          These are saved in this browser only.{' '}
          <Link href="/account/login?redirect=/saved">Sign in</Link> to keep them across your devices —
          anything saved here moves to your account automatically.
        </p>
      )}
      <div className="r-product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
