'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { formatUsd } from '@/lib/pricing';
import { Order } from '@/lib/types';
import { CheckCircleIcon } from '@/components/icons';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getCustomerToken()) {
      router.replace('/account/login');
      return;
    }
    setReady(true);
  }, [router]);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => customerApi.get<Order>(`/orders/${orderId}`),
    enabled: ready && !!orderId,
  });

  if (!ready || isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-olive-100 text-olive-700">
        <CheckCircleIcon className="h-7 w-7" />
      </div>
      <h1 className="font-display text-3xl text-ink">Order placed!</h1>
      {order ? (
        <>
          <p className="mt-2 text-sm text-ink-soft">
            Order #{order.id} · {formatUsd(order.total)}
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            We've recorded your order for manual invoicing. You'll be contacted with payment
            details shortly.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">Your order has been placed.</p>
      )}
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
