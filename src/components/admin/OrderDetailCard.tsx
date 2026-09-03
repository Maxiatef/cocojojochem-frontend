import { Order } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { Badge } from '@/components/ui';

export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-0.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

// Full order breakdown — items, shipping address, totals, tracking, notes —
// same level of detail as the admin Orders page's ViewOrderModal, just
// rendered inline instead of in a separate modal. Shared between the
// Companies and Users admin detail views.
export function OrderDetailCard({ order }: { order: Order }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Order #{order.id}</p>
        <div className="flex items-center gap-2">
          <Badge status={order.status} />
          <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2.5 py-1.5 font-medium">Product</th>
              <th className="px-2.5 py-1.5 font-medium">SKU</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Qty</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Price</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 last:border-0">
                <td className="px-2.5 py-1.5 text-slate-900">
                  {item.productName}
                  {item.variantLabel && <span className="text-slate-500"> · {item.variantLabel}</span>}
                </td>
                <td className="px-2.5 py-1.5 text-slate-500">{item.sku}</td>
                <td className="px-2.5 py-1.5 text-right text-slate-700">{item.quantity}</td>
                <td className="px-2.5 py-1.5 text-right text-slate-700">{formatUsd(item.price)}</td>
                <td className="px-2.5 py-1.5 text-right font-medium text-slate-900">
                  {formatUsd(Number(item.price) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
        <DetailRow label="Subtotal" value={formatUsd(order.subtotal)} />
        {Number(order.couponAmount || 0) > 0 && (
          <DetailRow label="Coupon Discount" value={`-${formatUsd(order.couponAmount!)}`} />
        )}
        {Number(order.shippingCost || 0) > 0 && (
          <DetailRow label="Shipping" value={formatUsd(order.shippingCost!)} />
        )}
        {Number(order.taxAmount || 0) > 0 && (
          <DetailRow label="Tax" value={formatUsd(order.taxAmount!)} />
        )}
        <DetailRow label="Total" value={<span className="text-base">{formatUsd(order.total)}</span>} />
      </div>

      {order.shippingAddress && (
        <div className="mt-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Shipping Address</p>
          <p className="whitespace-pre-line text-sm text-slate-700">{order.shippingAddress}</p>
        </div>
      )}

      {(order.trackingNumber || order.carrierCode) && (
        <div className="mt-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Tracking</p>
          <DetailRow label="Carrier" value={order.carrierCode || '—'} />
          <DetailRow label="Tracking Number" value={order.trackingNumber || '—'} />
        </div>
      )}

      {order.notes && (
        <div className="mt-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
          <p className="whitespace-pre-line text-sm text-slate-700">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
