'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { customerApi } from '@/lib/customerApi';
import { Product, ServerCart } from '@/lib/types';
import { CartLines, CartTotals, useCartTotalCount } from '@/components/gloss/CartLines';
import { ProductCard } from '@/components/gloss/ProductCard';
import { useUnifiedCart } from '@/lib/gloss/useUnifiedCart';

/**
 * The prototype's cart page (fn R): lines on the left, order summary on the
 * right. Checkout entry is unchanged from the old page — everyone, guest or
 * signed in, goes to /checkout, which handles both.
 */
export function CartView() {
  const cart = useUnifiedCart();
  const all = useCartTotalCount();
  // Either group counts: an all-"Price to confirm" cart still goes to
  // checkout, where it becomes an order request.
  const hasLines = all.hasLines;

  return (
    <>
      <div className="r-cart-layout">
        <CartLines />
        <aside className="r-summary">
          <h2>Order summary</h2>
          <CartTotals />
          {hasLines ? (
            <Link
              className="r-btn r-primary"
              href="/checkout"
              aria-disabled={all.saving}
              onClick={(e) => {
                // A quantity change still in flight would reach checkout stale.
                if (all.saving) e.preventDefault();
              }}
            >
              Continue to checkout
            </Link>
          ) : (
            <Link className="r-btn r-primary" href="/products">
              Browse ingredients
            </Link>
          )}
          {hasLines && (
            <Link className="r-btn r-outline" href="/products">
              Continue shopping
            </Link>
          )}
          <div className="r-summary-help">
            <Package size={22} />
            <p>Priced items are paid securely by card at checkout. Items marked “Price to confirm” are sent to us as an order request — we reply with pricing before anything is charged for them.</p>
          </div>
          <Link href="/shipping-returns">Shipping &amp; return information</Link>
        </aside>
      </div>
      {cart.lines.length > 0 && <CartSuggestions />}
    </>
  );
}

/**
 * "Often ordered together" — the same cart-suggestions endpoint the checkout
 * upsell uses, shown as the prototype's product grid. Seeded once from the
 * cart as first seen, so adding a suggestion does not reshuffle the cards.
 */
function CartSuggestions() {
  const cart = useUnifiedCart();
  const { data: server } = useQuery({
    queryKey: ['customer-cart'],
    queryFn: () => customerApi.get<ServerCart>('/cart'),
    enabled: cart.signedIn,
  });

  // Guests' line keys are variant ids; a customer's are cart-item ids.
  const variantIds = cart.signedIn
    ? (server?.items || []).map((i) => i.productVariantId)
    : cart.lines.map((l) => l.key);

  const [seed, setSeed] = useState<string[]>([]);
  const joined = variantIds.join(',');
  useEffect(() => {
    if (!seed.length && joined) setSeed(joined.split(','));
  }, [joined, seed.length]);

  const { data: products } = useQuery({
    queryKey: ['cart-page-suggestions', [...seed].sort().join(',')],
    queryFn: () =>
      customerApi.get<Product[]>(`/wholesale/products/cart-suggestions?limit=4&variantIds=${seed.join(',')}`),
    enabled: seed.length > 0,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  if (!products?.length) return null;

  return (
    <section className="r-cart-suggestions">
      <div className="r-section-heading">
        <h2>Often ordered together.</h2>
        <Link href="/products">Explore the shop</Link>
      </div>
      <div className="r-product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
