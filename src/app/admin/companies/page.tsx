'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Company } from '@/lib/types';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';

export default function CompaniesPage() {
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
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Users</th>
                <th className="px-5 py-3 font-medium">Quote Requests</th>
                <th className="px-5 py-3 font-medium">Registered</th>
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
