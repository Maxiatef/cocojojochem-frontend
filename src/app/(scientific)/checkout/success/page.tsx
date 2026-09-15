'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@/components/icons';

// Note: the backend has no guest-accessible single-order lookup endpoint
// (GET /orders/:id requires JwtAuthGuard and checks ownership), so this page
// can't safely fetch and display order details for guest checkouts — it uses
// a simple static confirmation referencing the order id from the query
// string instead of fetching the order.
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sci-blue/10 text-sci-blue">
        <CheckCircleIcon className="h-7 w-7" />
      </div>
      <h1 className="font-sci-heading text-3xl font-semibold text-sci-navy">Payment received</h1>
      <p className="mt-2 font-sci-body text-sci-label text-sci-muted">
        {orderId ? `Order #${orderId}` : 'Your order'} has been placed and paid.
      </p>
      <p className="mt-4 font-sci-body text-sci-label text-sci-muted">
        We&apos;ll email you a confirmation shortly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/account/orders"
          className="border border-sci-border px-5 py-2.5 font-sci-body text-sci-label font-medium text-sci-navy transition hover:bg-sci-pale"
        >
          View my orders
        </Link>
        <Link
          href="/products"
          className="bg-sci-navy px-5 py-2.5 font-sci-body text-sci-label font-medium text-white transition hover:brightness-110"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
