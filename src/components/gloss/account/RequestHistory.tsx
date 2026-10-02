'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { QuoteRequest, requestReference } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';

/**
 * The signed-in customer's order requests (the "Price to confirm" part of the
 * cart, sent from checkout), newest first, with a status worded for them
 * rather than our internal pipeline names.
 */
const CUSTOMER_STATUS: Record<string, { label: string; key: string }> = {
  NEW: { label: 'Received', key: 'pending' },
  IN_PROGRESS: { label: 'Being reviewed', key: 'processing' },
  QUOTED: { label: 'Quote ready', key: 'shipped' },
  WON: { label: 'Paid', key: 'delivered' },
  LOST: { label: 'Closed', key: 'cancelled' },
};

function shortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function RequestHistory() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['customer-quote-requests'],
    queryFn: () => customerApi.get<QuoteRequest[]>('/wholesale/quote-requests/mine'),
  });

  if (isLoading) {
    return (
      <div className="ga-orders" aria-busy="true">
        <div className="ga-skeleton" style={{ height: 96 }} />
      </div>
    );
  }
  if (isError) return <p className="r-muted-panel">We couldn’t load your requests. Please refresh the page.</p>;

  if (!data?.length) {
    return (
      <p className="r-muted-panel">
        No requests yet. Add anything without a listed price — or a material from the{' '}
        <Link href="/products?source=makingcosmetics" className="ga-link">
          supplier reference library
        </Link>{' '}
        — to your cart, and send it from checkout. We reply with prices and availability.
      </p>
    );
  }

  return (
    <ul className="ga-orders">
      {data.map((qr) => {
        const status = CUSTOMER_STATUS[qr.status] || { label: qr.status, key: 'pending' };
        const references = qr.items.filter((i) => i.source === 'SUPPLIER_REFERENCE').length;
        return (
          <li className="ga-order" key={qr.id}>
            <div className="ga-order-head">
              <div>
                <strong className="ga-mono">
                  {qr.kind === 'ORDER' ? 'Order request' : 'Quote request'} {requestReference(qr.id)}
                </strong>
                <small className="ga-mono">
                  {shortDate(qr.createdAt)} · {qr.items.length} item{qr.items.length === 1 ? '' : 's'}
                  {references ? ` · ${references} sourced on request` : ''}
                </small>
              </div>
              <div>
                <span className="r-status" data-status={status.key}>
                  {status.label}
                </span>
              </div>
            </div>
            <ul className="ga-order-lines">
              {qr.items.map((item) => {
                const quoted = !!qr.quotedAt && item.isAvailable !== false && item.quotedPrice != null;
                const qty = item.quotedQuantity ?? item.quantity ?? 1;
                return (
                  <li key={item.id}>
                    <div className="ga-line-text">
                      <p>{item.productName}</p>
                      <small className="ga-mono">
                        {(qr.quotedAt && item.quotedPackSize) || item.unit || 'Size to confirm'} × {qty}
                        {item.source === 'SUPPLIER_REFERENCE' ? ' · Supplier reference' : ''}
                        {qr.quotedAt && item.availability ? ` · ${item.availability}` : ''}
                      </small>
                    </div>
                    <span className="ga-line-price">
                      {quoted
                        ? formatUsd(Number(item.quotedPrice) * qty)
                        : qr.quotedAt && item.isAvailable === false
                          ? 'Not available'
                          : 'Price to confirm'}
                    </span>
                  </li>
                );
              })}
            </ul>
            {qr.status === 'QUOTED' && qr.quoteToken && (
              <div className="ga-order-foot">
                <Link href={`/quotes/${qr.quoteToken}`} className="r-btn r-primary">
                  {qr.acceptedAt ? 'In your cart · view quote' : 'View quote & add to cart'}
                </Link>
              </div>
            )}
            {qr.status === 'LOST' && qr.closeReason && (
              <div className="ga-order-foot">
                <span>Closed: {qr.closeReason}</span>
              </div>
            )}
            {qr.quoteOrderId && (
              <div className="ga-order-foot">
                <span>
                  Quote paid ·{' '}
                  <Link href="/account/orders" className="ga-link">
                    view orders
                  </Link>
                </span>
              </div>
            )}
            {(qr.orderId || qr.paymentRequested) && (
              <div className="ga-order-foot">
                <span>
                  {qr.orderId ? (
                    <>
                      Sent with a paid order ·{' '}
                      <Link href="/account/orders" className="ga-link">
                        view orders
                      </Link>
                    </>
                  ) : (
                    'Sent with a payment that wasn’t completed — we’ll still price these items.'
                  )}
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
