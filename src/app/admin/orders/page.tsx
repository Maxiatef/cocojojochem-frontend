'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Order, OrderStatus, Paginated } from '@/lib/types';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';

const STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders-admin'],
    queryFn: () => api.get<Paginated<Order>>('/orders/admin?page=1&limit=50'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders-admin'] }),
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader title="Orders" description="All wholesale orders placed through the storefront." />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load orders." />}
      {data && data.data.length === 0 && <EmptyState message="No orders yet." />}

      {data && data.data.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Placed</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-slate-900">#{o.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-900">{o.user?.fullName || '—'}</p>
                    <p className="text-xs text-slate-500">{o.user?.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{o.user?.company?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{o.items.length}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">${o.total}</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: o.id, status: e.target.value as OrderStatus })
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1.5">
                      <Badge status={o.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  );
}
