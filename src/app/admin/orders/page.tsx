'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Order, OrderStatus, Paginated } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
  SelectField,
  TextField,
} from '@/components/ui';
import { TrackingTimeline } from '@/components/storefront/TrackingTimeline';

const STEPS: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const STEP_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const CARRIERS: { value: string; label: string }[] = [
  { value: 'usps', label: 'USPS' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'dhl_express', label: 'DHL Express' },
  { value: 'other', label: 'Other' },
];

function ShippingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M3 7h11v10H3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v4h-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
    </svg>
  );
}

function StatusStepper({
  currentStatus,
  onSelect,
  disabled,
}: {
  currentStatus: OrderStatus;
  onSelect: (status: OrderStatus) => void;
  disabled?: boolean;
}) {
  const isCancelled = currentStatus === 'CANCELLED';
  const currentIdx = isCancelled ? -1 : STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center">
      {STEPS.map((step, idx) => {
        const filled = !isCancelled && idx <= currentIdx;
        const isCurrent = !isCancelled && idx === currentIdx;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(step)}
              className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition ${
                  filled
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-400'
                } ${isCurrent ? 'ring-2 ring-brand-200' : ''}`}
              >
                {filled ? (idx < currentIdx ? '✓' : idx + 1) : idx + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-medium ${
                  filled ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {STEP_LABEL[step]}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${idx < currentIdx ? 'bg-brand-600' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders-admin'],
    queryFn: () => api.get<Paginated<Order>>('/orders/admin?page=1&limit=50'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders-admin'] });
      setActiveOrder((prev) => (prev && prev.id === vars.id ? { ...prev, status: vars.status } : prev));
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  // Keep the modal's order in sync once the order list refetches.
  const orders = data?.data || [];
  const modalOrder = activeOrder ? orders.find((o) => o.id === activeOrder.id) || activeOrder : null;

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
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Placed</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Shipping</th>
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
                    <Badge status={o.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <IconButton
                      icon={ShippingIcon}
                      label="Manage Shipping"
                      onClick={() => setActiveOrder(o)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {modalOrder && (
        <ManageShippingModal
          order={modalOrder}
          onClose={() => setActiveOrder(null)}
          onStatusSelect={(status) => updateStatus.mutate({ id: modalOrder.id, status })}
          statusPending={updateStatus.isPending}
        />
      )}
    </div>
  );
}

function ManageShippingModal({
  order,
  onClose,
  onStatusSelect,
  statusPending,
}: {
  order: Order;
  onClose: () => void;
  onStatusSelect: (status: OrderStatus) => void;
  statusPending: boolean;
}) {
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [carrierCode, setCarrierCode] = useState(order.carrierCode || 'usps');
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingSaved, setTrackingSaved] = useState(false);

  const saveTracking = useMutation({
    mutationFn: () =>
      api.patch(`/orders/${order.id}/tracking`, { trackingNumber, carrierCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-admin'] });
      setTrackingError(null);
      setTrackingSaved(true);
    },
    onError: (err) => {
      setTrackingSaved(false);
      setTrackingError(getFriendlyErrorMessage(err));
    },
  });

  const cancelOrder = useMutation({
    mutationFn: () => api.patch(`/orders/${order.id}/status`, { status: 'CANCELLED' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders-admin'] }),
  });

  return (
    <Modal open onClose={onClose} title={`Manage Shipping — Order #${order.id}`} size="lg">
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order Status</p>
            {order.status !== 'CANCELLED' && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={cancelOrder.isPending}
                onClick={() => cancelOrder.mutate()}
              >
                Cancel Order
              </Button>
            )}
          </div>
          {order.status === 'CANCELLED' ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              This order has been cancelled.
            </div>
          ) : (
            <StatusStepper
              currentStatus={order.status}
              onSelect={onStatusSelect}
              disabled={statusPending}
            />
          )}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Tracking Info</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                setTrackingSaved(false);
              }}
              placeholder="e.g. 1Z999AA10123456784"
            />
            <SelectField
              label="Carrier"
              value={carrierCode}
              onChange={(e) => {
                setCarrierCode(e.target.value);
                setTrackingSaved(false);
              }}
            >
              {CARRIERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </SelectField>
          </div>

          {trackingError && (
            <div className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{trackingError}</div>
          )}
          {trackingSaved && !trackingError && (
            <p className="mt-3 text-xs font-medium text-emerald-700">Tracking info saved.</p>
          )}

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              loading={saveTracking.isPending}
              disabled={!trackingNumber.trim()}
              onClick={() => saveTracking.mutate()}
            >
              Save Tracking
            </Button>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="border-t border-slate-100 pt-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Live Status</p>
            <p className="mb-2 text-xs text-slate-400">
              What the customer sees when they check tracking on this order.
            </p>
            <TrackingTimeline orderId={order.id} enabled client={api} adminView theme="admin" />
          </div>
        )}
      </div>
    </Modal>
  );
}
