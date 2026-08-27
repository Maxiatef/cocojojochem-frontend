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
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-olive-100 text-olive-700">
        <CheckCircleIcon className="h-7 w-7" />
      </div>
      <h1 className="font-display text-3xl text-ink">Payment received!</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {orderId ? `Order #${orderId}` : 'Your order'} has been placed and paid.
      </p>
      <p className="mt-4 text-sm text-ink-soft">
        Thanks for your order! We&apos;ll email you a confirmation shortly.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account/orders" className="border border-sand-300 px-5 py-2.5 text-sm font-medium text-ink hover:bg-sand-50">
          View my orders
        </Link>
        <Link href="/products" className="bg-olive-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-olive-700">
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
