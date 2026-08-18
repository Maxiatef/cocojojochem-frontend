'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { Order } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getCustomerToken()) {
      router.replace('/account/login?redirect=/account/orders');
      return;
    }
    setReady(true);
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => customerApi.get<Order[]>('/orders'),
    enabled: ready,
  });

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">My Orders</h1>

      {isLoading && (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      {data && data.length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500">
          You haven't placed any orders yet.{' '}
          <Link href="/products" className="font-medium text-brand-700 hover:underline">
            Browse products
          </Link>
        </p>
      )}

      {data && data.length > 0 && (
        <div className="mt-6 space-y-4">
          {data.map((order) => (
            <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">Order #{order.id}</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{formatUsd(order.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
