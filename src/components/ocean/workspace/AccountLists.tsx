'use client';

import { useQuery } from '@tanstack/react-query';
import { Truck } from 'lucide-react';
import { customerApi } from '@/lib/customerApi';
import { QuoteRequest, requestReference, type Order } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { displayId } from '@/lib/ids';
import { ReorderButton } from '@/components/gloss/account/ReorderButton';

/**
 * The reference account's `r-request-list` (details/summary per request),
 * fed by our signed-in customer's quote requests and orders.
 */

const REQUEST_STATUS: Record<string, string> = {
  NEW: 'Received',
  IN_PROGRESS: 'Being reviewed',
  QUOTED: 'Quote ready',
  WON: 'Paid',
  LOST: 'Closed',
};

const date = (value: string) => new Date(value).toLocaleDateString('en-US');

export function AccountRequests() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['customer-quote-requests'],
    queryFn: () => customerApi.get<QuoteRequest[]>('/wholesale/quote-requests/mine'),
  });

  if (isLoading) return <p className="r-muted-panel">Loading your requests…</p>;
  if (isError) return <p className="r-error">We couldn’t load your requests. Please refresh the page.</p>;
  if (!data?.length)
    return <p className="r-muted-panel">Your submitted requests will appear here with their current status.</p>;

  return (
    <div className="r-request-list">
      {data.map((x) => (
        <details key={x.id}>
          <summary>
            <span>
              <strong>{requestReference(x.id)}</strong>
              <small>
                {date(x.createdAt)} · {x.kind === 'ORDER' ? 'Order request' : 'Inquiry'}
              </small>
            </span>
            <span className="r-status">{REQUEST_STATUS[x.status] || x.status}</span>
          </summary>
          <p>{x.message || 'No additional notes.'}</p>
          {x.items.map((item) => {
            const quoted = !!x.quotedAt && item.isAvailable !== false && item.quotedPrice != null;
            const qty = item.quotedQuantity ?? item.quantity ?? 1;
            return (
              <p key={item.id}>
                {item.productName} · {(x.quotedAt && item.quotedPackSize) || item.unit || 'Size to confirm'} · Quantity{' '}
                {qty}
                {quoted ? ' · ' + formatUsd(Number(item.quotedPrice) * qty) : ''}
              </p>
            );
          })}
          {x.status === 'QUOTED' && x.quoteToken && (
            <p>
              <a className="r-btn r-primary" href={`/quotes/${x.quoteToken}`}>
                {x.acceptedAt ? 'In your cart · view quote' : 'View quote & add to cart'}
              </a>
            </p>
          )}
          {x.status === 'LOST' && x.closeReason && <p>Closed: {x.closeReason}</p>}
        </details>
      ))}
    </div>
  );
}

export function AccountOrders({
  orders,
  loading,
  onTrack,
}: {
  orders: Order[] | undefined;
  loading: boolean;
  onTrack: (order: Order) => void;
}) {
  if (loading) return <p className="r-muted-panel">Loading your orders…</p>;
  if (!orders?.length)
    return <p className="r-muted-panel">Your orders will appear here with their current status.</p>;
  return (
    <div className="r-request-list">
      {orders.map((order) => (
        <details key={order.id}>
          <summary>
            <span>
              <strong>Order {displayId(order.id)}</strong>
              <small>
                {date(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? '' : 's'} ·{' '}
                {formatUsd(order.total)}
              </small>
            </span>
            <span className="r-status" data-status={order.status.toLowerCase()}>
              {order.status.toLowerCase()}
            </span>
          </summary>
          {order.items.map((item) => (
            <p key={item.id}>
              {item.productName} · {item.variantLabel} · Quantity {item.quantity} ·{' '}
              {formatUsd(Number(item.price) * item.quantity)}
            </p>
          ))}
          <div className="r-project-actions">
            {order.status !== 'CANCELLED' && (
              <button type="button" onClick={() => onTrack(order)}>
                <Truck size={16} aria-hidden />
                Tracking
              </button>
            )}
            <ReorderButton order={order} />
          </div>
        </details>
      ))}
    </div>
  );
}
