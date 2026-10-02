'use client';

import { Suspense, useEffect, useState } from 'react';
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
  // Set by checkout just before the Stripe redirect when the cart also had
  // "Price to confirm" items (see PENDING_REQUEST_REF_KEY in checkout).
  const [requestRef, setRequestRef] = useState<string | null>(null);
  useEffect(() => {
    try {
      setRequestRef(sessionStorage.getItem('cocojojochem_pending_request_ref'));
      sessionStorage.removeItem('cocojojochem_pending_request_ref');
    } catch {
      /* storage blocked — the request is still in their account */
    }
  }, []);

  return (
    <section className="r-wrap r-section">
      <div className="r-confirmation">
        <CircleCheck size={54} aria-hidden />
        <span className="r-eyebrow">Successfully received</span>
        <h1>Payment received.</h1>
        <p>{orderId ? `Order #${orderId}` : 'Your order'} has been placed and paid.</p>
        <p>We&apos;ll email you a confirmation shortly.</p>
        {requestRef && (
          <p>
            Pricing for your other items is also requested: reference <strong>{requestRef}</strong>. We&apos;ll reply
            with prices and availability — nothing has been charged for those items.
          </p>
        )}
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
