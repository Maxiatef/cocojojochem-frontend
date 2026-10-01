'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { ApiError } from '@/lib/api';
import { Order } from '@/lib/types';
import { RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui';
import { OrderCard } from '@/components/gloss/account/OrderCard';
import { OrderShippingModal } from '@/components/commerce/OrderShippingModal';

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
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Your account</span>
        <h1>Your orders.</h1>
        <p>Follow every shipment, and reorder a past batch in one step.</p>
      </div>

      <section className="r-wrap r-section">
        <div className="ga-orders-wrap">
          {isLoading && (
            <div className="ga-orders" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="ga-skeleton" style={{ height: 150 }} />
              ))}
            </div>
          )}

          {data && data.length === 0 && (
            <div className="r-muted-panel">
              You haven&apos;t placed any orders yet.
              <p>
                <Link href="/products" className="ga-link">
                  Browse products
                </Link>
              </p>
            </div>
          )}

          {data && data.length > 0 && (
            <>
              <div className="ga-tabs" role="group" aria-label="Filter orders">
                {(
                  [
                    ['ongoing', `Ongoing (${ongoingOrders.length})`],
                    ['completed', `Completed (${completedOrders.length})`],
                  ] as [Tab, string][]
                ).map(([key, label]) => (
                  <button key={key} type="button" aria-pressed={tab === key} onClick={() => setTab(key)}>
                    {label}
                  </button>
                ))}
              </div>

              {visibleOrders.length === 0 ? (
                <p className="r-muted-panel">
                  {tab === 'ongoing' ? "You don't have any orders in progress right now." : 'No completed orders yet.'}
                </p>
              ) : (
                <ul className="ga-orders">
                  {visibleOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      showSku
                      onTrack={setShippingModalOrder}
                      action={
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          disabled={reorderingId === order.id}
                          className="r-btn r-outline"
                        >
                          <RotateCcw size={15} aria-hidden />
                          {reorderingId === order.id ? 'Adding to cart…' : 'Reorder'}
                        </button>
                      }
                    />
                  ))}
                </ul>
              )}
            </>
          )}

          <p className="r-fine ga-back">
            <Link href="/account">Back to your account</Link>
          </p>
        </div>
      </section>

      {shippingModalOrder && (
        <OrderShippingModal order={shippingModalOrder} onClose={() => setShippingModalOrder(null)} />
      )}
    </>
  );
}
