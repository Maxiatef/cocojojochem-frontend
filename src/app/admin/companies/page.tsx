'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { AccountStatus, Company } from '@/lib/types';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<Company[]>('/companies'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AccountStatus }) =>
      api.patch(`/companies/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Wholesale Companies"
        description="Approve or reject B2B account applications."
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load companies." />}
      {data && data.length === 0 && <EmptyState message="No companies registered yet." />}

      {data && data.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Users</th>
                <th className="px-5 py-3 font-medium">Quote Requests</th>
                <th className="px-5 py-3 font-medium">Registered</th>
                <th className="px-5 py-3 font-medium">Status</th>
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
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Badge status={c.status} />
                      {c.status === 'PENDING' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() =>
                              updateStatus.mutate({ id: c.id, status: 'APPROVED' })
                            }
                            className="rounded-lg bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateStatus.mutate({ id: c.id, status: 'REJECTED' })
                            }
                            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
