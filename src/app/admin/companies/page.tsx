'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Company, CompanyDetail, CompanyUser, Order, QuoteRequest } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
  TextField,
  Button,
} from '@/components/ui';
import { ChevronDownIcon, EyeIcon } from '@/components/icons';
import { OrderDetailCard } from '@/components/admin/OrderDetailCard';

export default function CompaniesPage() {
  const [viewingId, setViewingId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<Company[]>('/companies'),
  });

  return (
    <div>
      <PageHeader
        title="Wholesale Companies"
        description="All registered B2B companies."
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load companies." />}
      {data && data.length === 0 && <EmptyState message="No companies registered yet." />}

      {data && data.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Users</th>
                <th className="px-5 py-3 font-medium">Quote Requests</th>
                <th className="px-5 py-3 font-medium">Registered</th>
                <th className="px-5 py-3 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    {c.website && (
                      <a
                        href={/^https?:\/\//i.test(c.website) ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.website}
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{c.industry || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.userCount ?? 0}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.quoteRequestCount ?? 0}</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <IconButton icon={EyeIcon} label="View" onClick={() => setViewingId(c.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {viewingId != null && <CompanyDetailModal companyId={viewingId} onClose={() => setViewingId(null)} />}
    </div>
  );
}

function CompanyDetailModal({ companyId, onClose }: { companyId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [taxId, setTaxId] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: company, isLoading, isError } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => api.get<CompanyDetail>(`/companies/${companyId}`),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['company-orders', companyId],
    queryFn: () => api.get<Order[]>(`/companies/${companyId}/orders`),
  });

  const { data: quoteRequests, isLoading: quoteRequestsLoading } = useQuery({
    queryKey: ['company-quote-requests', companyId],
    queryFn: () => api.get<QuoteRequest[]>(`/companies/${companyId}/quote-requests`),
  });

  const updateMutation = useMutation({
    mutationFn: (body: { name: string; website: string; industry: string; taxId: string }) =>
      api.patch<Company>(`/companies/${companyId}`, body),
    onSuccess: (res) => {
      queryClient.setQueryData(['company', companyId], (prev: CompanyDetail | undefined) =>
        prev ? { ...prev, ...res } : prev,
      );
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setEditing(false);
      setSaveError(null);
    },
    onError: (err) => setSaveError(getFriendlyErrorMessage(err)),
  });

  function startEditing() {
    if (!company) return;
    setName(company.name);
    setWebsite(company.website || '');
    setIndustry(company.industry || '');
    setTaxId(company.taxId || '');
    setSaveError(null);
    setEditing(true);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    updateMutation.mutate({ name, website, industry, taxId });
  }

  const unlinkedQuoteRequests = (quoteRequests || []).filter((qr) => !qr.user);

  return (
    <Modal open onClose={onClose} title={company ? company.name : 'Company'} size="xl">
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load company." />}

      {company && (
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company Details</p>
              {!editing && (
                <button
                  onClick={startEditing}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-3 rounded-lg border border-slate-200 p-4">
                <TextField label="Company Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <TextField
                  label="Website"
                  placeholder="yourcompany.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <TextField
                  label="Industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
                <TextField label="Tax ID" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                {saveError && (
                  <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{saveError}</div>
                )}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <Button type="submit" loading={updateMutation.isPending} size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</p>
                  <p className="text-slate-900">{company.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Website</p>
                  <p className="text-slate-900">
                    {company.website ? (
                      <a
                        href={/^https?:\/\//i.test(company.website) ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Industry</p>
                  <p className="text-slate-900">{company.industry || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tax ID</p>
                  <p className="text-slate-900">{company.taxId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Registered</p>
                  <p className="text-slate-900">{new Date(company.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Users ({company.users.length})
            </p>
            {company.users.length === 0 ? (
              <p className="text-sm text-slate-400">No users on this company yet.</p>
            ) : (
              <div className="space-y-2">
                {company.users.map((u) => (
                  <UserOrdersRow
                    key={u.id}
                    user={u}
                    orders={orders}
                    ordersLoading={ordersLoading}
                    quoteRequests={quoteRequests}
                    quoteRequestsLoading={quoteRequestsLoading}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Other Quote Requests ({unlinkedQuoteRequests.length})
            </p>
            <p className="mb-2 text-xs text-slate-400">
              Requests tied to this company by name only, not linked to a specific user account above.
            </p>
            {unlinkedQuoteRequests.length === 0 ? (
              <p className="text-sm text-slate-400">None.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-medium">Contact</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unlinkedQuoteRequests.map((qr) => (
                      <tr key={qr.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2">
                          <p className="font-medium text-slate-900">{qr.fullName}</p>
                          <p className="text-xs text-slate-500">{qr.email}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{qr.type.replace(/_/g, ' ')}</td>
                        <td className="px-3 py-2">
                          <Badge status={qr.status} />
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {new Date(qr.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function UserOrdersRow({
  user,
  orders,
  ordersLoading,
  quoteRequests,
  quoteRequestsLoading,
}: {
  user: CompanyUser;
  orders: Order[] | undefined;
  ordersLoading: boolean;
  quoteRequests: QuoteRequest[] | undefined;
  quoteRequestsLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const userOrders = (orders || []).filter((o) => o.user?.id === user.id);
  const userQuoteRequests = (quoteRequests || []).filter((qr) => qr.user?.id === user.id);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-slate-50 px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <Badge status={user.role} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {ordersLoading || quoteRequestsLoading
              ? 'Loading…'
              : `${userOrders.length} order${userOrders.length === 1 ? '' : 's'} · ${userQuoteRequests.length} quote${
                  userQuoteRequests.length === 1 ? '' : 's'
                }`}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-200 px-3 py-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Orders</p>
            {ordersLoading ? (
              <p className="py-2 text-sm text-slate-400">Loading orders…</p>
            ) : userOrders.length === 0 ? (
              <p className="py-2 text-sm text-slate-400">No orders placed by this user yet.</p>
            ) : (
              <div className="space-y-3">
                {userOrders.map((o) => (
                  <OrderDetailCard key={o.id} order={o} />
                ))}
              </div>
            )}
          </div>

          {/* No card at all when there are zero quote requests — not even a "none yet" placeholder. */}
          {!quoteRequestsLoading && userQuoteRequests.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Quote Requests</p>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-1.5 font-medium">Type</th>
                    <th className="py-1.5 font-medium">Status</th>
                    <th className="py-1.5 font-medium">Items</th>
                    <th className="py-1.5 font-medium">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {userQuoteRequests.map((qr) => (
                    <tr key={qr.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-1.5 text-slate-900">{qr.type.replace(/_/g, ' ')}</td>
                      <td className="py-1.5">
                        <Badge status={qr.status} />
                      </td>
                      <td className="py-1.5 text-slate-700">
                        {qr.items.length > 0 ? `${qr.items.length} item(s)` : '—'}
                      </td>
                      <td className="py-1.5 text-slate-500">{new Date(qr.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
