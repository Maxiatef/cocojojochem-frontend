import { OrderStatus } from '@/lib/types';

export const ORDER_STATUS_STEPS: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export const ORDER_STATUS_STEP_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// Shared shipping-flow illustration — used by the admin "Manage Shipping"
// modal (interactive, admin can click a step to change status) and the
// customer-facing shipping views (always disabled — read-only progress).
export function OrderStatusStepper({
  currentStatus,
  onSelect,
  disabled,
}: {
  currentStatus: OrderStatus;
  onSelect?: (status: OrderStatus) => void;
  disabled?: boolean;
}) {
  const isCancelled = currentStatus === 'CANCELLED';
  const currentIdx = isCancelled ? -1 : ORDER_STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center">
      {ORDER_STATUS_STEPS.map((step, idx) => {
        const filled = !isCancelled && idx <= currentIdx;
        const isCurrent = !isCancelled && idx === currentIdx;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={disabled || !onSelect}
              onClick={() => onSelect?.(step)}
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
                {ORDER_STATUS_STEP_LABEL[step]}
              </span>
            </button>
            {idx < ORDER_STATUS_STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${idx < currentIdx ? 'bg-brand-600' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
