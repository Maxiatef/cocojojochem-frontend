'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CircleCheck } from 'lucide-react';

// Note: the backend has no guest-accessible single-order lookup endpoint
// (GET /orders/:id requires JwtAuthGuard and checks ownership), so this page
// can't safely fetch and display order details for guest checkouts — it uses
// a simple static confirmation referencing the order id from the query
// string instead of fetching the order.
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <section className="r-wrap r-section">
      <div className="r-confirmation">
        <CircleCheck size={54} aria-hidden />
        <span className="r-eyebrow">Successfully received</span>
        <h1>Payment received.</h1>
        <p>{orderId ? `Order #${orderId}` : 'Your order'} has been placed and paid.</p>
        <p>We&apos;ll email you a confirmation shortly.</p>
        <Link href="/account/orders" className="r-btn r-primary">
          View my orders
        </Link>
        <Link href="/products" className="r-btn r-outline">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
