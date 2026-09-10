'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { Order } from '@/lib/types';
import { ConfirmDialog, Modal, useToast } from '@/components/ui';
import { OrderStatusStepper } from '@/components/OrderStatusStepper';
import { TrackingTimeline } from '@/components/storefront/TrackingTimeline';
import { formatUsd } from '@/lib/pricing';
import { carrierLabel, carrierTrackingUrl } from '@/lib/carrierTracking';
import { orderCancelEligibility } from '@/lib/orderCancel';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';

// Customer-facing shipping view, opened from the shipping icon on both
// /account/orders and the /account dashboard. Read-only apart from
// self-cancellation: no status editing, those controls stay admin-only.
//
// Shows the order's summary (status, date, item count, total) and its
// tracking, but deliberately NOT the line items — the pages this opens from
// already list them right behind the modal.
export function OrderShippingModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Read straight off the order so the number is visible even before (or
  // without) a successful live carrier lookup.
  const trackingUrl = carrierTrackingUrl(order.carrierCode, order.trackingNumber);
  const isCancelled = order.status === 'CANCELLED';
  const { canCancel, reason } = orderCancelEligibility(order);

  const cancelMutation = useMutation({
    mutationFn: () => customerApi.post(`/orders/${order.id}/cancel`, {}),
    onSuccess: () => {
      // Both the orders page and the /account dashboard read the same
      // ['customer-orders'] key, so one invalidation refreshes whichever is
      // mounted. Tracking is dropped too since a cancelled order has none.
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-tracking', order.id] });
      toast.success(`Order #${order.id} has been cancelled.`);
      setConfirmOpen(false);
      onClose();
    },
    onError: (err) => {
      // Covers the case where the order became uncancellable between render
      // and click (a label bought in the meantime) — the server refuses and
      // its message is the accurate one.
      toast.error(getFriendlyErrorMessage(err));
      setConfirmOpen(false);
    },
  });

  return (
    <>
      <Modal open onClose={onClose} title={`Shipping — Order #${order.id}`}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Placed {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s) ·{' '}
              {formatUsd(order.total)}
            </p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {order.status}
            </span>
          </div>

          {isCancelled ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              This order has been cancelled.
            </div>
          ) : (
            <OrderStatusStepper currentStatus={order.status} disabled />
          )}

          {!isCancelled && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tracking</p>
              {order.trackingNumber ? (
                <>
                  <div className="mt-2 space-y-1.5">
                    <p className="text-sm text-slate-900">
                      <span className="font-semibold">{carrierLabel(order.carrierCode)}</span>{' '}
                      <span className="select-all font-mono">{order.trackingNumber}</span>
                    </p>
                    {trackingUrl && (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium text-brand-700 underline hover:no-underline"
                      >
                        Track on {carrierLabel(order.carrierCode)} &rarr;
                      </a>
                    )}
                  </div>
                  {/* Live carrier checkpoints. Renders its own "unavailable"
                      note when the lookup can't run, which is why the number
                      and link above are read from the order instead. */}
                  <TrackingTimeline
                    orderId={order.id}
                    enabled
                    client={customerApi}
                    theme="admin"
                    showSummary={false}
                  />
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Your order hasn&apos;t shipped yet. We&apos;ll email you a tracking number as soon as it does.
                </p>
              )}
            </div>
          )}

          {/* Cancellation. The button stays visible but disabled when the
              order can't be cancelled, with the reason underneath — a
              vanishing control just leaves people wondering where it went. */}
          {!isCancelled && (
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={!canCancel || cancelMutation.isPending}
                onClick={() => setConfirmOpen(true)}
                title={canCancel ? undefined : reason}
                className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                  canCancel
                    ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                    : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                } disabled:opacity-100`}
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Order'}
              </button>
              {!canCancel && reason && <p className="mt-2 text-xs text-slate-500">{reason}</p>}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title={`Cancel order #${order.id}?`}
        message={`This cancels the whole order for ${formatUsd(order.total)} and can't be undone.${
          order.status === 'PROCESSING'
            ? ' Your payment will be refunded to the card you used at checkout, which usually takes 5–10 business days.'
            : ''
        } If you only want to change part of it, contact us instead.`}
        confirmLabel="Yes, cancel order"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
