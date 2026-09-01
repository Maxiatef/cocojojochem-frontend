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
  ConfirmDialog,
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
import { EyeIcon, ShippingIcon } from '@/components/icons';
import { OrderStatusStepper } from '@/components/OrderStatusStepper';
import { formatUsd } from '@/lib/pricing';
import { StatusCard } from '@/components/admin/StatusCard';

interface OrderAdminStats {
  total: number;
  customerOrders: number;
  guestOrders: number;
}

const CARRIERS: { value: string; label: string }[] = [
  { value: 'usps', label: 'USPS' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'dhl_express', label: 'DHL Express' },
  { value: 'other', label: 'Other' },
];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'customer' | 'guest'>('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders-admin'],
    queryFn: () => api.get<Paginated<Order>>('/orders/admin?page=1&limit=50'),
  });

  const { data: stats } = useQuery({
    queryKey: ['orders-admin-stats'],
    queryFn: () => api.get<OrderAdminStats>('/orders/admin/stats'),
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
  const allOrders = data?.data || [];
  const orders = allOrders.filter((o) => {
    if (customerTypeFilter === 'customer') return !!o.user;
    if (customerTypeFilter === 'guest') return !o.user;
    return true;
  });
  const modalOrder = activeOrder ? allOrders.find((o) => o.id === activeOrder.id) || activeOrder : null;
  const viewedOrder = viewOrder ? allOrders.find((o) => o.id === viewOrder.id) || viewOrder : null;

  return (
    <div>
      <PageHeader title="Orders" description="All wholesale orders placed through the storefront." />

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatusCard
            label="Total Orders"
            value={stats.total}
            active={customerTypeFilter === 'all'}
            onClick={() => setCustomerTypeFilter('all')}
          />
          <StatusCard
            label="By Customers"
            value={stats.customerOrders}
            tone="green"
            active={customerTypeFilter === 'customer'}
            onClick={() => setCustomerTypeFilter((v) => (v === 'customer' ? 'all' : 'customer'))}
          />
          <StatusCard
            label="By Guests"
            value={stats.guestOrders}
            tone="amber"
            active={customerTypeFilter === 'guest'}
            onClick={() => setCustomerTypeFilter((v) => (v === 'guest' ? 'all' : 'guest'))}
          />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load orders." />}
      {data && allOrders.length === 0 && <EmptyState message="No orders yet." />}
      {data && allOrders.length > 0 && orders.length === 0 && (
        <EmptyState message="No orders match this filter." />
      )}

      {data && orders.length > 0 && (
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
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-slate-900">#{o.id}</td>
                  <td className="px-5 py-3.5">
                    {o.user ? (
                      <>
                        <p className="text-slate-900">{o.user.fullName}</p>
                        <p className="text-xs text-slate-500">{o.user.email}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-900">
                          {o.guestName || 'Guest'}
                          <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Guest
                          </span>
                        </p>
                        {o.guestEmail && <p className="text-xs text-slate-500">{o.guestEmail}</p>}
                      </>
                    )}
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
                    <div className="flex items-center justify-end gap-1">
                      <IconButton icon={EyeIcon} label="View Order" onClick={() => setViewOrder(o)} />
                      <IconButton
                        icon={ShippingIcon}
                        label="Manage Shipping"
                        onClick={() => setActiveOrder(o)}
                      />
                    </div>
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

      {viewedOrder && <ViewOrderModal order={viewedOrder} onClose={() => setViewOrder(null)} />}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function ViewOrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const isGuest = !order.user;
  const customerName = order.user?.fullName || order.guestName || null;
  const customerEmail = order.user?.email || order.guestEmail || null;
  const customerPhone = order.user?.phone || order.guestPhone || null;
  const company = order.user?.company || null;

  return (
    <Modal open onClose={onClose} title={`Order #${order.id}`} size="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge status={order.status} />
          <p className="text-xs text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString()}
            {order.updatedAt && order.updatedAt !== order.createdAt && (
              <> · Updated {new Date(order.updatedAt).toLocaleString()}</>
            )}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</p>
          {customerName || customerEmail ? (
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <DetailRow label="Name" value={customerName || '—'} />
              <DetailRow label="Email" value={customerEmail || '—'} />
              <DetailRow label="Phone" value={customerPhone || '—'} />
              <DetailRow label="Account" value={isGuest ? 'Guest checkout (no account)' : 'Registered customer'} />
              {company && (
                <>
                  <DetailRow label="Company" value={company.name} />
                  <DetailRow label="Company Status" value={company.status} />
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No customer information on this order.</p>
          )}
        </div>

        {order.shippingAddress && (
          <div className="border-t border-slate-100 pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Shipping Address</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{order.shippingAddress}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Items ({order.items.length})
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Price</th>
                  <th className="px-3 py-2 text-right font-medium">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2 text-slate-900">
                      {item.productName}
                      {item.variantLabel && <span className="text-slate-500"> · {item.variantLabel}</span>}
                      {!item.productVariantId && (
                        <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          removed
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{item.sku}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{formatUsd(item.price)}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">
                      {formatUsd(Number(item.price) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 space-y-1 rounded-lg bg-slate-50 px-4 py-3">
            <DetailRow label="Subtotal" value={formatUsd(order.subtotal)} />
            {Number(order.couponAmount || 0) > 0 && (
              <DetailRow label="Coupon Discount" value={`-${formatUsd(order.couponAmount!)}`} />
            )}
            <DetailRow label="Total" value={<span className="text-base">{formatUsd(order.total)}</span>} />
          </div>
        </div>

        {(order.trackingNumber || order.carrierCode) && (
          <div className="border-t border-slate-100 pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Shipping</p>
            <DetailRow label="Carrier" value={order.carrierCode || '—'} />
            <DetailRow label="Tracking Number" value={order.trackingNumber || '—'} />
          </div>
        )}

        {order.notes && (
          <div className="border-t border-slate-100 pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{order.notes}</p>
          </div>
        )}
      </div>
    </Modal>
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
  const [confirmingCancel, setConfirmingCancel] = useState(false);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-admin'] });
      setConfirmingCancel(false);
    },
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
                onClick={() => setConfirmingCancel(true)}
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
            <OrderStatusStepper
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

      <ConfirmDialog
        open={confirmingCancel}
        title="Cancel order"
        message={`Cancel order #${order.id}? The customer will not be automatically notified, and this cannot be undone from here.`}
        confirmLabel="Cancel Order"
        loading={cancelOrder.isPending}
        onConfirm={() => cancelOrder.mutate()}
        onCancel={() => setConfirmingCancel(false)}
      />
    </Modal>
  );
}
