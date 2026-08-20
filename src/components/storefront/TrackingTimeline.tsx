'use client';

import { useQuery } from '@tanstack/react-query';
import { TrackingInfo } from '@/lib/types';

interface TrackingApiClient {
  get: <T>(path: string) => Promise<T>;
}

const REASON_MESSAGE: Record<string, string> = {
  not_shipped_yet: 'Not shipped yet',
  tracking_not_configured: "Tracking updates aren't available for this carrier right now",
  lookup_failed: "Couldn't retrieve tracking right now — try again later.",
};

const CURRENT_STATUS_LABEL: Record<string, string> = {
  PRE_TRANSIT: 'Label created',
  TRANSIT: 'In transit',
  OUT_FOR_DELIVERY: 'Out for delivery',
  PICKUP: 'Ready for pickup',
  DELIVERED: 'Delivered',
  RETURNED: 'Returned',
  FAILURE: 'Delivery failed',
  UNKNOWN: 'Status unknown',
};

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Renders a checkpoint timeline for an order's shipment tracking.
 * Reused on both the customer account page (theme="shop") and the admin
 * order modal (theme="admin") so the admin sees exactly what the customer sees.
 */
export function TrackingTimeline({
  orderId,
  enabled,
  client,
  adminView = false,
  theme = 'shop',
}: {
  orderId: number;
  enabled: boolean;
  client: TrackingApiClient;
  /** GET /orders/:id/tracking/admin vs GET /orders/:id/tracking */
  adminView?: boolean;
  theme?: 'shop' | 'admin';
}) {
  const path = `/orders/${orderId}/tracking${adminView ? '/admin' : ''}`;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order-tracking', orderId, adminView],
    queryFn: () => client.get<TrackingInfo>(path),
    enabled,
  });

  const fontMono = theme === 'shop' ? { fontFamily: 'var(--font-account-mono), monospace' } : undefined;

  if (!enabled) return null;

  if (isLoading) {
    return (
      <div className={theme === 'shop' ? 'space-y-2 py-3' : 'space-y-2 py-2'}>
        <div className={`h-3 w-40 animate-pulse ${theme === 'shop' ? 'bg-[#16241c]/10' : 'rounded bg-slate-200'}`} />
        <div className={`h-3 w-56 animate-pulse ${theme === 'shop' ? 'bg-[#16241c]/10' : 'rounded bg-slate-200'}`} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p
        style={fontMono}
        className={theme === 'shop' ? 'py-3 text-xs text-[#16241c]/50' : 'py-2 text-xs text-slate-500'}
      >
        Couldn&apos;t retrieve tracking right now — try again later.
      </p>
    );
  }

  if (!data.available) {
    return (
      <p
        style={fontMono}
        className={theme === 'shop' ? 'py-3 text-xs text-[#16241c]/50' : 'py-2 text-xs text-slate-500'}
      >
        {REASON_MESSAGE[data.reason] || REASON_MESSAGE.lookup_failed}
      </p>
    );
  }

  const checkpoints = data.checkpoints;
  const lastIdx = checkpoints.length - 1;

  if (theme === 'admin') {
    return (
      <div className="py-2">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <span className="font-medium text-slate-900">{CURRENT_STATUS_LABEL[data.currentStatus] || data.currentStatus}</span>
          <span>{data.carrier.toUpperCase()} · {data.trackingNumber}</span>
          {data.eta && <span>ETA {formatTimestamp(data.eta)}</span>}
        </div>
        {checkpoints.length === 0 ? (
          <p className="text-xs text-slate-500">No checkpoints yet.</p>
        ) : (
          <ol className="space-y-0">
            {checkpoints.map((cp, idx) => {
              const isCurrent = idx === lastIdx;
              return (
                <li key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                  {idx < lastIdx && (
                    <span className="absolute left-[5px] top-3 h-full w-px bg-slate-200" aria-hidden />
                  )}
                  <span
                    className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 ${
                      isCurrent ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${isCurrent ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                      {cp.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {cp.location ? `${cp.location} · ` : ''}
                      {formatTimestamp(cp.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  return (
    <div className="py-3">
      <div style={fontMono} className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#16241c]/60">
        <span className="font-semibold uppercase tracking-wide text-[#16241c]">
          {CURRENT_STATUS_LABEL[data.currentStatus] || data.currentStatus}
        </span>
        <span>
          {data.carrier.toUpperCase()} · {data.trackingNumber}
        </span>
        {data.eta && <span>ETA {formatTimestamp(data.eta)}</span>}
      </div>
      {checkpoints.length === 0 ? (
        <p style={fontMono} className="text-xs text-[#16241c]/50">No checkpoints yet.</p>
      ) : (
        <ol className="space-y-0">
          {checkpoints.map((cp, idx) => {
            const isCurrent = idx === lastIdx;
            return (
              <li key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                {idx < lastIdx && (
                  <span className="absolute left-[4px] top-2.5 h-full w-px bg-[#16241c]/15" aria-hidden />
                )}
                <span
                  className={`relative z-10 mt-1.5 h-2 w-2 shrink-0 rounded-full border ${
                    isCurrent ? 'border-brand-600 bg-brand-600' : 'border-[#16241c]/30 bg-transparent'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] ${isCurrent ? 'font-semibold text-[#16241c]' : 'text-[#16241c]/70'}`}>
                    {cp.description}
                  </p>
                  <p style={fontMono} className="text-[11px] text-[#16241c]/40">
                    {cp.location ? `${cp.location} · ` : ''}
                    {formatTimestamp(cp.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
