'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface WorkspaceItem {
  slug: string;
  name: string;
}

interface WorkspaceProject {
  id: string;
  name: string;
  notes: string;
  items: WorkspaceItem[];
  updatedAt: string;
}

/**
 * What a customer is comparing and formulating on the storefront — read-only,
 * for sales follow-ups. Product names link to the live product page.
 */
export function CustomerWorkspace({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-customer-workspace', userId],
    queryFn: () =>
      api.get<{ compare: WorkspaceItem[]; projects: WorkspaceProject[] }>(`/workspace/user/${userId}`),
  });

  const heading = (text: string) => (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{text}</p>
  );
  const productLink = (item: WorkspaceItem) => (
    <a
      key={item.slug}
      href={`/products/${item.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
    >
      {item.name}
    </a>
  );

  if (isLoading) return <p className="text-sm text-slate-500">Loading comparison and projects…</p>;
  if (isError || !data) return <p className="text-sm text-slate-500">Couldn&rsquo;t load comparison and projects.</p>;

  return (
    <div className="space-y-5">
      <div>
        {heading('Comparing')}
        {data.compare.length ? (
          <div className="flex flex-wrap gap-2">{data.compare.map(productLink)}</div>
        ) : (
          <p className="text-sm text-slate-500">Nothing in their comparison.</p>
        )}
      </div>

      <div>
        {heading(`Formulation projects (${data.projects.length})`)}
        {data.projects.length ? (
          <ul className="space-y-3">
            {data.projects.map((p) => (
              <li key={p.id} className="rounded-lg bg-slate-50 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="shrink-0 text-xs text-slate-400">
                    Updated {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {p.notes && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{p.notes}</p>}
                {p.items.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">{p.items.map(productLink)}</div>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">No ingredients yet.</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
