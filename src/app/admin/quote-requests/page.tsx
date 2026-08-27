'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { QuoteRequest, RequestStatus } from '@/lib/types';
import { Badge, Card, EmptyState, ErrorState, IconButton, LoadingState, Modal, PageHeader } from '@/components/ui';
import { EyeIcon } from '@/components/icons';

const STATUSES: RequestStatus[] = ['NEW', 'IN_PROGRESS', 'QUOTED', 'WON', 'LOST'];

export default function QuoteRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<QuoteRequest | null>(null);
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
                <th className="px-5 py-3 font-medium text-right">View</th>
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
                  <td className="px-5 py-3.5 text-right">
                    <IconButton icon={EyeIcon} label="View" onClick={() => setViewing(qr)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {viewing && <QuoteRequestDetailModal quoteRequest={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function QuoteRequestDetailModal({ quoteRequest, onClose }: { quoteRequest: QuoteRequest; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`Quote Request — ${quoteRequest.fullName}`} size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
            <p className="text-slate-900">{quoteRequest.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p>
            <p className="text-slate-900">{quoteRequest.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company</p>
            <p className="text-slate-900">{quoteRequest.companyName || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Type</p>
            <p className="text-slate-900">{quoteRequest.type.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Received</p>
            <p className="text-slate-900">{new Date(quoteRequest.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
            <Badge status={quoteRequest.status} />
          </div>
        </div>

        {quoteRequest.items.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Product(s) requested
            </p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Quantity</th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteRequest.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2 text-slate-900">{item.productName}</td>
                      <td className="px-3 py-2 text-slate-700">
                        {item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Message</p>
          {quoteRequest.message ? (
            <p className="whitespace-pre-line rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              {quoteRequest.message}
            </p>
          ) : (
            <p className="text-sm text-slate-400">No message provided.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
