'use client';

import { customerApi } from '@/lib/customerApi';
import { Order } from '@/lib/types';
import { Modal } from '@/components/ui';
import { OrderStatusStepper } from '@/components/OrderStatusStepper';
import { TrackingTimeline } from '@/components/storefront/TrackingTimeline';

// Customer-facing shipping view — mirrors the admin "Manage Shipping" modal's
// illustration (same step flow, same tracking timeline component/theme) but
// read-only: no status-editing controls, no cancel button, those stay admin-only.
export function OrderShippingModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`Shipping — Order #${order.id}`}>
      <div className="space-y-6">
        {order.status === 'CANCELLED' ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            This order has been cancelled.
          </div>
        ) : (
          <OrderStatusStepper currentStatus={order.status} disabled />
        )}
        <TrackingTimeline orderId={order.id} enabled client={customerApi} theme="admin" />
      </div>
    </Modal>
  );
}
