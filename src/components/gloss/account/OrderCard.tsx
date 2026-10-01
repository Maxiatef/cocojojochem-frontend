'use client';

import type { ReactNode } from 'react';
import { Truck } from 'lucide-react';
import type { Order } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { displayId } from '@/lib/ids';
import { categoryImage } from '@/lib/gloss/images';

function shortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** The prototype's r-status pill, coloured per order status. */
export function OrderStatus({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span className="r-status" data-status={key}>
      {key}
    </span>
  );
}

/**
 * One order as a docket: number, date and status on top, the lines, then the
 * total. Order numbers, SKUs and money are set in the account mono — they are
 * strings people compare against a printed document.
 */
export function OrderCard({
  order,
  onTrack,
  showSku,
  action,
}: {
  order: Order;
  onTrack: (order: Order) => void;
  showSku?: boolean;
  action?: ReactNode;
}) {
  return (
    <li className="ga-order">
      <div className="ga-order-head">
        <div>
          <strong className="ga-mono">Order {displayId(order.id)}</strong>
          <small className="ga-mono">
            {shortDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
          </small>
        </div>
        <div>
          <OrderStatus status={order.status} />
          {order.status !== 'CANCELLED' && (
            <button type="button" className="ga-order-track" onClick={() => onTrack(order)}>
              <Truck size={16} aria-hidden />
              Tracking
            </button>
          )}
        </div>
      </div>

      <ul className="ga-order-lines">
        {order.items.map((item) => (
          <li key={item.id}>
            <div className="ga-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl || categoryImage(item.productName)} alt="" loading="lazy" />
            </div>
            <div className="ga-line-text">
              <p>{item.productName}</p>
              <small className="ga-mono">
                {item.variantLabel}
                {showSku ? ` · SKU ${item.sku}` : ''} × {item.quantity}
              </small>
            </div>
            <span className="ga-line-price ga-mono">{formatUsd(Number(item.price) * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="ga-order-foot">
        {action}
        <span>
          Total
          <strong className="ga-mono">{formatUsd(order.total)}</strong>
        </span>
      </div>
    </li>
  );
}
