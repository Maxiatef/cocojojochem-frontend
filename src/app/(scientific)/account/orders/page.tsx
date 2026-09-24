'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { ApiError } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { IconButton, useToast } from '@/components/ui';
import { ShippingIcon, ImagePlaceholderIcon } from '@/components/icons';
import { OrderShippingModal } from '@/components/commerce/OrderShippingModal';
import { displayId } from '@/lib/ids';

type Tab = 'ongoing' | 'completed';

// DELIVERED/CANCELLED orders have nothing left to track or act on — everything
// else (PENDING/PROCESSING/SHIPPED) is still actively moving toward the customer.
const COMPLETED_STATUSES = new Set(['DELIVERED', 'CANCELLED']);

export default function CustomerOrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const [ready, setReady] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('ongoing');
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!getCustomerToken()) {
      // Full page load, not router.replace — see account/page.tsx.
      window.location.replace('/account/login?redirect=/account/orders');
      return;
    }
    setReady(true);
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => customerApi.get<Order[]>('/orders'),
    enabled: ready,
  });

  async function handleReorder(order: Order) {
    setReorderingId(order.id);
    const added: string[] = [];
    const skipped: string[] = [];

    for (const item of order.items) {
      if (!item.productVariantId) {
        skipped.push(`${item.productName} (${item.sku}) is no longer available`);
        continue;
      }
      try {
        await customerApi.post('/cart/items', {
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        });
        added.push(item.productName);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'could not be added';
        skipped.push(`${item.productName} (${item.sku}) — ${message}`);
      }
    }

    setReorderingId(null);

    if (added.length > 0) {
      window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
      toast.success(
        `${added.length} item${added.length === 1 ? '' : 's'} added to cart${skipped.length ? '' : '.'}`,
      );
    }
    if (skipped.length > 0) {
      toast.error(`Skipped: ${skipped.join('; ')}`);
    }
    if (added.length === 0 && skipped.length === 0) {
      toast.error('This order has no items to reorder.');
    }
  }

  // Reserve the screen until the sign-in check runs — see account/page.tsx.
  if (!ready) return <div className="min-h-screen" aria-busy="true" />;

  const allOrders = data || [];
  const ongoingOrders = allOrders.filter((o) => !COMPLETED_STATUSES.has(o.status));
  const completedOrders = allOrders.filter((o) => COMPLETED_STATUSES.has(o.status));
  const visibleOrders = tab === 'ongoing' ? ongoingOrders : completedOrders;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-sci-navy">My Orders</h1>

      {isLoading && (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
        </div>
      )}

      {data && data.length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed border-sci-border py-16 text-center text-sm text-sci-muted">
          You haven't placed any orders yet.{' '}
          <Link href="/products" className="font-medium text-sci-blue hover:underline">
            Browse products
          </Link>
        </p>
      )}

      {data && data.length > 0 && (
        <>
          <div className="mt-6 flex gap-1 border-b border-sci-border">
            {(
              [
                ['ongoing', `Ongoing (${ongoingOrders.length})`],
                ['completed', `Completed (${completedOrders.length})`],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                  tab === key
                    ? 'border-sci-blue text-sci-blue'
                    : 'border-transparent text-sci-muted hover:text-sci-navy'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {visibleOrders.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-sci-border py-12 text-center text-sm text-sci-muted">
              {tab === 'ongoing' ? "You don't have any orders in progress right now." : 'No completed orders yet.'}
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {visibleOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-sci-border bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sci-navy">Order {displayId(order.id)}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-sci-pale px-2.5 py-1 text-xs font-medium text-sci-muted">
                        {order.status}
                      </span>
                      {order.status !== 'CANCELLED' && (
                        <IconButton
                          icon={ShippingIcon}
                          label="Shipping"
                          onClick={() => setShippingModalOrder(order)}
                        />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-sci-muted">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                  </p>

                  <div className="mt-3 space-y-2 border-t border-sci-border pt-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sci-pale">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                          ) : (
                            <ImagePlaceholderIcon className="h-4 w-4 text-sci-muted" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-sci-navy">
                          {item.productName}
                          <span className="ml-2 text-xs text-sci-muted">
                            {item.variantLabel} · SKU {item.sku} · ×{item.quantity}
                          </span>
                        </div>
                        <div className="shrink-0 text-sci-muted">{formatUsd(Number(item.price) * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-sci-border pt-3">
                    <button
                      onClick={() => handleReorder(order)}
                      disabled={reorderingId === order.id}
                      className="rounded-lg border border-sci-border bg-sci-pale px-3 py-1.5 text-xs font-semibold text-sci-blue hover:bg-sci-pale disabled:opacity-60"
                    >
                      {reorderingId === order.id ? 'Adding to cart…' : 'Reorder'}
                    </button>
                    <p className="text-sm font-semibold text-sci-navy">{formatUsd(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {shippingModalOrder && (
        <OrderShippingModal order={shippingModalOrder} onClose={() => setShippingModalOrder(null)} />
      )}
    </div>
  );
}
