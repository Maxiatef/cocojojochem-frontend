'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { displayId } from '@/lib/ids';
import { QuoteRequest, RequestStatus, requestReference } from '@/lib/types';
import { Badge, Card, EmptyState, ErrorState, IconButton, LoadingState, Modal, PageHeader } from '@/components/ui';
import { EyeIcon } from '@/components/icons';
import { useCan } from '@/components/AdminShell';
import { QuoteEditor, QuoteState } from '@/components/admin/QuoteEditor';

const STATUSES: RequestStatus[] = ['NEW', 'IN_PROGRESS', 'QUOTED', 'WON', 'LOST'];

type AccountFilter = 'ALL' | 'GUEST' | 'CUSTOMER';
type SourceFilter = 'ALL' | 'SUPPLIER' | 'CATALOG';
type KindFilter = 'ALL' | 'ORDER' | 'QUOTE';

const kindOf = (qr: QuoteRequest) => (qr.kind === 'ORDER' ? 'ORDER' : 'QUOTE');

const isGuest = (qr: QuoteRequest) => !qr.userId;
const supplierCount = (qr: QuoteRequest) => qr.items.filter((i) => i.source === 'SUPPLIER_REFERENCE').length;

/** Paid / payment not completed / request only — the payment side of a request. */
function PaymentCell({ qr }: { qr: QuoteRequest }) {
  if (qr.orderId) {
    return (
      <span className="inline-flex flex-col">
        <span className="w-fit rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Paid</span>
        <Link href={`/admin/orders?open=${qr.orderId}`} className="mt-1 text-xs text-sci-blue hover:underline">
          Order {displayId(qr.orderId)}
        </Link>
      </span>
    );
  }
  if (qr.paymentRequested) {
    return (
      <span className="w-fit rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        Payment not completed
      </span>
    );
  }
  return <span className="text-xs text-slate-400">Request only</span>;
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {options.map(([key, text]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition ${
            value === key ? 'bg-sci-blue text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export default function QuoteRequestsPage() {
  // Without the edit permission the status is shown as a read-only badge —
  // a dropdown whose every change is refused reads as a broken control.
  const canEdit = useCan('canEditQuoteRequest');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('ALL');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL');
  const [kindFilter, setKindFilter] = useState<KindFilter>('ALL');
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

  // ?open=<id> (from an order's "Pricing also requested") opens that request.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('open');
    const match = id && data?.find((qr) => qr.id === id);
    if (match) setViewing(match);
  }, [data]);

  const rows = useMemo(
    () =>
      (data || []).filter((qr) => {
        if (accountFilter === 'GUEST' && !isGuest(qr)) return false;
        if (accountFilter === 'CUSTOMER' && isGuest(qr)) return false;
        if (sourceFilter === 'SUPPLIER' && supplierCount(qr) === 0) return false;
        if (sourceFilter === 'CATALOG' && supplierCount(qr) > 0) return false;
        if (kindFilter !== 'ALL' && kindOf(qr) !== kindFilter) return false;
        return true;
      }),
    [data, accountFilter, sourceFilter, kindFilter],
  );

  const updateStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: RequestStatus; reason?: string }) =>
      api.patch(`/wholesale/quote-requests/${id}/status`, { status, reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quote-requests'] }),
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Order & Quote Requests"
        description="Items customers asked us to price, from guests and signed-in customers. Price a request and send the quote; the customer accepts it into their cart and pays at checkout. The customer is emailed when a request moves to In progress, is quoted, or is closed."
      />

      <div className="mb-4 space-y-2">
        <FilterGroup
          label="Status"
          value={statusFilter}
          options={[['ALL', 'All'], ...STATUSES.map((s) => [s, s.replace(/_/g, ' ')] as [RequestStatus, string])]}
          onChange={setStatusFilter}
        />
        <FilterGroup
          label="Type"
          value={kindFilter}
          options={[
            ['ALL', 'All'],
            ['ORDER', 'Order requests'],
            ['QUOTE', 'Quote requests'],
          ]}
          onChange={setKindFilter}
        />
        <FilterGroup
          label="Account"
          value={accountFilter}
          options={[
            ['ALL', 'All'],
            ['GUEST', 'Guests'],
            ['CUSTOMER', 'Customers'],
          ]}
          onChange={setAccountFilter}
        />
        <FilterGroup
          label="Source"
          value={sourceFilter}
          options={[
            ['ALL', 'All'],
            ['SUPPLIER', 'Has supplier reference'],
            ['CATALOG', 'Our catalog only'],
          ]}
          onChange={setSourceFilter}
        />
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load requests." />}
      {data && rows.length === 0 && (
        <EmptyState message={data.length ? 'No requests match these filters.' : 'No requests yet.'} />
      )}

      {rows.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Ship to</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Quote</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Received</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((qr) => {
                  const refs = supplierCount(qr);
                  return (
                    <tr key={qr.id} className="border-b border-slate-100 last:border-0 align-top">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{requestReference(qr.id)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            kindOf(qr) === 'ORDER' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
                          }`}
                        >
                          {kindOf(qr) === 'ORDER' ? 'Order request' : 'Quote request'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{qr.fullName}</p>
                        <p className="text-xs text-slate-500">{qr.email}</p>
                        {qr.companyName && <p className="text-xs text-slate-500">{qr.companyName}</p>}
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isGuest(qr) ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {isGuest(qr) ? 'Guest' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{qr.destination || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {qr.items.length > 0 ? `${qr.items.length} item${qr.items.length === 1 ? '' : 's'}` : '—'}
                        {refs > 0 && (
                          <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            {refs} supplier ref
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <QuoteState qr={qr} />
                      </td>
                      <td className="px-5 py-3.5">
                        <PaymentCell qr={qr} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{new Date(qr.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        {canEdit && (
                          <select
                            aria-label={`Status of ${requestReference(qr.id)}`}
                            value={qr.status}
                            onChange={(e) => {
                              const status = e.target.value as RequestStatus;
                              // Closing emails the customer, so ask for the reason they'll read.
                              if (status === 'LOST') {
                                const reason = window.prompt(
                                  'Close this request? The customer is emailed. Reason shown to them (optional):',
                                  '',
                                );
                                if (reason === null) return;
                                updateStatus.mutate({ id: qr.id, status, reason: reason || undefined });
                                return;
                              }
                              updateStatus.mutate({ id: qr.id, status });
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className={canEdit ? 'mt-1.5' : ''}>
                          <Badge status={qr.status} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <IconButton icon={EyeIcon} label="View" onClick={() => setViewing(qr)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {viewing && (
        <QuoteRequestDetailModal
          quoteRequest={viewing}
          canEdit={canEdit}
          onClose={() => setViewing(null)}
          onSaved={(next) => {
            setViewing(next);
            queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="text-slate-900">{children}</div>
    </div>
  );
}

function QuoteRequestDetailModal({
  quoteRequest: qr,
  canEdit,
  onClose,
  onSaved,
}: {
  quoteRequest: QuoteRequest;
  canEdit: boolean;
  onClose: () => void;
  onSaved: (next: QuoteRequest) => void;
}) {
  return (
    <Modal open onClose={onClose} title={`Request ${requestReference(qr.id)} — ${qr.fullName}`} size="xl">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <Field label="Email">{qr.email}</Field>
          <Field label="Phone">{qr.phone || '—'}</Field>
          <Field label="Company">{qr.companyName || '—'}</Field>
          <Field label="Account">{isGuest(qr) ? 'Guest (no account)' : 'Registered customer'}</Field>
          <Field label="Ship to">{qr.destination || '—'}</Field>
          <Field label="Type">{kindOf(qr) === 'ORDER' ? 'Order request (ready to buy)' : 'Quote request (pricing only)'}</Field>
          <Field label="Received">{new Date(qr.createdAt).toLocaleString()}</Field>
          <Field label="Status">
            <Badge status={qr.status} />
          </Field>
          <Field label="Payment">
            <PaymentCell qr={qr} />
          </Field>
        </div>

        {qr.items.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">What the customer asked for</p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Quantity · size</th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {qr.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 align-top">
                      <td className="px-3 py-2 text-slate-900">
                        {item.productName}
                        {item.source === 'SUPPLIER_REFERENCE' ? (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                              Supplier reference{item.referenceCode ? ` · ${item.referenceCode.toUpperCase()}` : ''}
                            </span>
                            {item.sourceUrl && (
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-sci-blue hover:underline"
                              >
                                Original listing ↗
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="mt-1">
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                              Our catalog
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {item.quantity ?? '—'}
                        {item.unit ? ` · ${item.unit}` : ' · size to confirm'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-5">
          <QuoteEditor key={`${qr.id}-${qr.quotedAt ?? ''}`} qr={qr} canEdit={canEdit} onSaved={onSaved} />
        </div>

        {qr.status === 'LOST' && qr.closeReason && (
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="font-medium">{qr.declinedAt ? 'Customer declined: ' : 'Closed: '}</span>
            {qr.closeReason}
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Customer message</p>
          {qr.message ? (
            <p className="whitespace-pre-line rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              {qr.message}
            </p>
          ) : (
            <p className="text-sm text-slate-400">No message provided.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
