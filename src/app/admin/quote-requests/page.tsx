'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { QuoteRequest, RequestStatus } from '@/lib/types';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';

const STATUSES: RequestStatus[] = ['NEW', 'IN_PROGRESS', 'QUOTED', 'WON', 'LOST'];

export default function QuoteRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['quote-requests', statusFilter],
    queryFn: () =>
      api.get<QuoteRequest[]>(
        `/wholesale/quote-requests${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`,
      ),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: RequestStatus }) =>
      api.patch(`/wholesale/quote-requests/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quote-requests'] }),
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Quote Requests"
        description="Leads from the 'Request a Quote' / 'Request a Sample' forms."
      />

      <div className="mb-4 flex gap-2">
        {(['ALL', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === s
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            } border border-slate-200`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load quote requests." />}
      {data && data.length === 0 && <EmptyState message="No quote requests yet." />}

      {data && data.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Received</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((qr) => (
                <tr key={qr.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{qr.fullName}</p>
                    <p className="text-xs text-slate-500">{qr.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{qr.companyName || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{qr.type.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {qr.items.length > 0 ? `${qr.items.length} item(s)` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(qr.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={qr.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: qr.id, status: e.target.value as RequestStatus })
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1.5">
                      <Badge status={qr.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  );
}
