'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { QuoteRequest, requestReference } from '@/lib/types';
import { useCan } from '@/components/AdminShell';

/**
 * Order detail: "Pricing also requested: CJ-…" when the order was paid in a
 * combined checkout (the cart also had "Price to confirm" items, sent as an
 * order request). Only for staff who can see quote requests.
 */
export function LinkedRequestNote({ orderId }: { orderId: string }) {
  const canView = useCan('canViewQuoteRequests');
  const { data } = useQuery({
    queryKey: ['quote-requests-for-order', orderId],
    queryFn: () => api.get<QuoteRequest[]>(`/wholesale/quote-requests?orderId=${orderId}`),
    enabled: canView,
  });
  const qr = data?.[0];
  if (!canView || !qr) return null;

  const references = qr.items.filter((i) => i.source === 'SUPPLIER_REFERENCE').length;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">
        Pricing also requested:{' '}
        <Link href={`/admin/quote-requests?open=${qr.id}`} className="underline">
          {requestReference(qr.id)}
        </Link>
      </p>
      <p className="mt-0.5 text-xs text-amber-800">
        {qr.items.length} item{qr.items.length === 1 ? '' : 's'} to price
        {references ? `, ${references} from the supplier reference library` : ''}. Not included in this order&rsquo;s
        total.
      </p>
    </div>
  );
}
