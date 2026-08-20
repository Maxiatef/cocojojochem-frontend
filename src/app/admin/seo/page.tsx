'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { SeoAnalyzeResult, SeoIssue, SeoMetric, SeoOverview } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatCard,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { AlertTriangleIcon, ChartIcon, CheckCircleIcon, ClockIcon, GlobeIcon } from '@/components/icons';

/* ---------------------------------------------------------------------------
 * Meta Tags editor — DISABLED, kept for reference in case it's needed again.
 *
 * This used to be a tab on this page (a per-path meta title/description/OG
 * image CRUD editor over the `SeoPage` entity), removed alongside disabling
 * the backend's SeoPagesModule (see the commented-out import + registration
 * in `cocojojochem-backend/src/app.module.ts`).
 *
 * To bring this back:
 *   1. Uncomment SeoPagesModule in the backend's app.module.ts.
 *   2. Uncomment the block below.
 *   3. Restore these imports at the top of this file:
 *      `FormEvent` from 'react' (add to the existing `useState` import line)
 *      `ConfirmDialog, IconButton, Modal, TextAreaField, TextField` from '@/components/ui'
 *      `EditIcon, PlusIcon, TrashIcon` from '@/components/icons'
 *      `SeoPage` from '@/lib/types'
 *   4. Add a tab switcher back to `SeoAdminPage()` below (it previously
 *      toggled between 'meta-tags' and 'site-analysis' with local useState),
 *      and render `<MetaTagsTab />` alongside `<SiteAnalysisTab />`.
 *
 * interface SeoFormState {
 *   id: number | null;
 *   path: string;
 *   metaTitle: string;
 *   metaDescription: string;
 *   ogImageUrl: string;
 * }
 *
 * const EMPTY_FORM: SeoFormState = {
 *   id: null,
 *   path: '',
 *   metaTitle: '',
 *   metaDescription: '',
 *   ogImageUrl: '',
 * };
 *
 * function MetaTagsTab() {
 *   const queryClient = useQueryClient();
 *   const [modalOpen, setModalOpen] = useState(false);
 *   const [form, setForm] = useState<SeoFormState>(EMPTY_FORM);
 *   const [error, setError] = useState<string | null>(null);
 *   const [pendingDelete, setPendingDelete] = useState<SeoPage | null>(null);
 *
 *   const { data, isLoading, isError } = useQuery({
 *     queryKey: ['admin-seo-pages'],
 *     queryFn: () => api.get<SeoPage[]>('/seo-pages'),
 *   });
 *
 *   const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-seo-pages'] });
 *
 *   const createMutation = useMutation({
 *     mutationFn: (body: Record<string, unknown>) => api.post('/seo-pages', body),
 *     onSuccess: () => {
 *       invalidate();
 *       closeModal();
 *     },
 *     onError: (err) => setError(getFriendlyErrorMessage(err)),
 *   });
 *
 *   const updateMutation = useMutation({
 *     mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
 *       api.patch(`/seo-pages/${id}`, body),
 *     onSuccess: () => {
 *       invalidate();
 *       closeModal();
 *     },
 *     onError: (err) => setError(getFriendlyErrorMessage(err)),
 *   });
 *
 *   const deleteMutation = useMutation({
 *     mutationFn: (id: number) => api.delete(`/seo-pages/${id}`),
 *     onSuccess: () => {
 *       invalidate();
 *       setPendingDelete(null);
 *     },
 *   });
 *
 *   function openCreateModal() {
 *     setForm(EMPTY_FORM);
 *     setError(null);
 *     setModalOpen(true);
 *   }
 *
 *   function openEditModal(p: SeoPage) {
 *     setForm({
 *       id: p.id,
 *       path: p.path,
 *       metaTitle: p.metaTitle || '',
 *       metaDescription: p.metaDescription || '',
 *       ogImageUrl: p.ogImageUrl || '',
 *     });
 *     setError(null);
 *     setModalOpen(true);
 *   }
 *
 *   function closeModal() {
 *     setModalOpen(false);
 *   }
 *
 *   function handleSubmit(e: FormEvent) {
 *     e.preventDefault();
 *     setError(null);
 *     const body = {
 *       path: form.path,
 *       metaTitle: form.metaTitle || null,
 *       metaDescription: form.metaDescription || null,
 *       ogImageUrl: form.ogImageUrl || null,
 *     };
 *     if (form.id) {
 *       updateMutation.mutate({ id: form.id, body });
 *     } else {
 *       createMutation.mutate(body);
 *     }
 *   }
 *
 *   const pages = data || [];
 *   const saving = createMutation.isPending || updateMutation.isPending;
 *
 *   return (
 *     <div>
 *       <div className="mb-4 flex items-center justify-between">
 *         <div>
 *           <h2 className="text-sm font-semibold text-slate-900">Meta Tags</h2>
 *           <p className="text-xs text-slate-500">Per-path meta title, description, and social image overrides.</p>
 *         </div>
 *         <Button onClick={openCreateModal} icon={PlusIcon}>
 *           Add SEO Page
 *         </Button>
 *       </div>
 *
 *         {isLoading && <LoadingState />}
 *         {isError && <ErrorState message="Couldn't load SEO pages." />}
 *         {!isLoading && !isError && pages.length === 0 && <EmptyState message="No SEO pages configured yet." />}
 *
 *         {!isLoading && pages.length > 0 && (
 *           <Card>
 *             <Table minWidth={640}>
 *               <TableHead>
 *                 <Th>Path</Th>
 *                 <Th>Meta Title</Th>
 *                 <Th>Has Description</Th>
 *                 <Th align="right">Actions</Th>
 *               </TableHead>
 *               <tbody>
 *                 {pages.map((p) => (
 *                   <Tr key={p.id}>
 *                     <Td className="font-medium text-slate-900">{p.path}</Td>
 *                     <Td className="text-slate-600">{p.metaTitle || '—'}</Td>
 *                     <Td>
 *                       {p.metaDescription ? (
 *                         <CheckCircleIcon className="h-4 w-4 text-green-600" />
 *                       ) : (
 *                         <span className="text-slate-300">—</span>
 *                       )}
 *                     </Td>
 *                     <Td align="right">
 *                       <div className="flex justify-end gap-1.5">
 *                         <IconButton icon={EditIcon} label="Edit" onClick={() => openEditModal(p)} />
 *                         <IconButton
 *                           icon={TrashIcon}
 *                           label="Delete"
 *                           variant="danger"
 *                           onClick={() => setPendingDelete(p)}
 *                         />
 *                       </div>
 *                     </Td>
 *                   </Tr>
 *                 ))}
 *               </tbody>
 *             </Table>
 *           </Card>
 *         )}
 *
 *         <Modal open={modalOpen} onClose={closeModal} title={form.id ? 'Edit SEO Page' : 'Add SEO Page'}>
 *           <form onSubmit={handleSubmit} className="space-y-4">
 *             <TextField
 *               label="Path"
 *               placeholder="/products/example-product"
 *               required
 *               value={form.path}
 *               onChange={(e) => setForm({ ...form, path: e.target.value })}
 *             />
 *             <TextField
 *               label="Meta Title"
 *               value={form.metaTitle}
 *               onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
 *             />
 *             <TextAreaField
 *               label="Meta Description"
 *               rows={3}
 *               value={form.metaDescription}
 *               onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
 *             />
 *             <TextField
 *               label="OG Image URL"
 *               value={form.ogImageUrl}
 *               onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
 *             />
 *
 *             {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
 *
 *             <div className="flex justify-end gap-2 pt-2">
 *               <Button type="button" variant="secondary" onClick={closeModal}>
 *                 Cancel
 *               </Button>
 *               <Button type="submit" loading={saving}>
 *                 {form.id ? 'Save Changes' : 'Create SEO Page'}
 *               </Button>
 *             </div>
 *           </form>
 *         </Modal>
 *
 *         <ConfirmDialog
 *           open={!!pendingDelete}
 *           title="Delete SEO page"
 *           message={`Delete SEO overrides for "${pendingDelete?.path}"? This cannot be undone.`}
 *           confirmLabel="Delete"
 *           loading={deleteMutation.isPending}
 *           onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
 *           onCancel={() => setPendingDelete(null)}
 *         />
 *     </div>
 *   );
 * }
 * ------------------------------------------------------------------------- */

export default function SeoAdminPage() {
  return (
    <RequireAdmin>
      <div>
        <PageHeader title="SEO" description="Real-time crawl-based site analysis." />
        <SiteAnalysisTab />
      </div>
    </RequireAdmin>
  );
}

// --- Site Analysis ----------------------------------------------------------

function scorePillClass(score: number | null): string {
  if (score === null) return 'bg-slate-100 text-slate-500';
  if (score >= 80) return 'bg-green-50 text-green-700';
  if (score >= 60) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

function fmtDateTime(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

function SiteAnalysisTab() {
  const queryClient = useQueryClient();
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const overviewQuery = useQuery({
    queryKey: ['seo-analyzer-overview'],
    queryFn: () => api.get<SeoOverview>('/seo-analyzer/overview'),
  });

  const metricsQuery = useQuery({
    queryKey: ['seo-analyzer-metrics'],
    queryFn: () => api.get<SeoMetric[]>('/seo-analyzer/metrics'),
  });

  const issuesQuery = useQuery({
    queryKey: ['seo-analyzer-issues'],
    queryFn: () => api.get<SeoIssue[]>('/seo-analyzer/issues'),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => api.post<SeoAnalyzeResult>('/seo-analyzer/analyze', {}),
    onSuccess: () => {
      setAnalyzeError(null);
      queryClient.invalidateQueries({ queryKey: ['seo-analyzer-overview'] });
      queryClient.invalidateQueries({ queryKey: ['seo-analyzer-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['seo-analyzer-issues'] });
    },
    onError: (err) => setAnalyzeError(getFriendlyErrorMessage(err)),
  });

  const overview = overviewQuery.data;
  const metrics = metricsQuery.data || [];
  const issues = issuesQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Site Analysis</h2>
          <p className="text-xs text-slate-500">
            Crawls the live storefront pages and detects real SEO issues — titles, meta descriptions, headings, content length, and image alt text.
          </p>
        </div>
        <Button onClick={() => analyzeMutation.mutate()} loading={analyzeMutation.isPending} icon={GlobeIcon}>
          Analyze Site
        </Button>
      </div>

      {analyzeError && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{analyzeError}</div>}

      {overviewQuery.isLoading && <LoadingState />}
      {overviewQuery.isError && <ErrorState message="Couldn't load SEO overview." />}

      {overview && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pages Analyzed" value={overview.totalPagesAnalyzed} icon={GlobeIcon} />
          <StatCard label="Average SEO Score" value={overview.averageScore} accent="brand" icon={ChartIcon} />
          <StatCard
            label="Open Issues"
            value={overview.totalIssues}
            accent={overview.totalIssues > 0 ? 'red' : 'slate'}
            icon={AlertTriangleIcon}
          />
          <StatCard
            label="Last Analyzed"
            value={overview.lastAnalyzed ? fmtDateTime(overview.lastAnalyzed) : 'Never'}
            accent="slate"
            icon={ClockIcon}
          />
        </div>
      )}

      {overview && overview.totalIssues > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <div key={sev} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5">
              <Badge status={sev} />
              <span className="text-sm font-semibold text-slate-900">{overview.issuesBySeverity[sev] || 0}</span>
            </div>
          ))}
        </div>
      )}

      <Card>
        <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Per-Page Metrics</div>
        {metricsQuery.isLoading && <LoadingState />}
        {metricsQuery.isError && <ErrorState message="Couldn't load SEO metrics." />}
        {!metricsQuery.isLoading && !metricsQuery.isError && metrics.length === 0 && (
          <EmptyState message="No pages analyzed yet — click Analyze Site to run a crawl." />
        )}
        {!metricsQuery.isLoading && metrics.length > 0 && (
          <Table minWidth={780}>
            <TableHead>
              <Th>Path</Th>
              <Th>Title</Th>
              <Th>Meta Description</Th>
              <Th align="right">Word Count</Th>
              <Th align="right">SEO Score</Th>
              <Th>Last Analyzed</Th>
            </TableHead>
            <tbody>
              {metrics.map((m) => (
                <Tr key={m.id}>
                  <Td className="font-medium text-slate-900">{m.path}</Td>
                  <Td>
                    {m.title ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </Td>
                  <Td>
                    {m.metaDescription ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </Td>
                  <Td align="right" className="text-slate-600">
                    {m.wordCount ?? '—'}
                  </Td>
                  <Td align="right">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${scorePillClass(m.seoScore)}`}>
                      {m.seoScore ?? '—'}
                    </span>
                  </Td>
                  <Td className="text-slate-500">{fmtDateTime(m.lastAnalyzed)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Issues</div>
        {issuesQuery.isLoading && <LoadingState />}
        {issuesQuery.isError && <ErrorState message="Couldn't load SEO issues." />}
        {!issuesQuery.isLoading && !issuesQuery.isError && issues.length === 0 && (
          <EmptyState message="No issues detected." />
        )}
        {!issuesQuery.isLoading && issues.length > 0 && (
          <Table minWidth={780}>
            <TableHead>
              <Th>Path</Th>
              <Th>Issue</Th>
              <Th>Severity</Th>
              <Th>Description</Th>
            </TableHead>
            <tbody>
              {issues.map((i) => (
                <Tr key={i.id}>
                  <Td className="font-medium text-slate-900">{i.path}</Td>
                  <Td className="text-slate-600">{i.issueType.replace(/_/g, ' ')}</Td>
                  <Td>
                    <Badge status={i.severity} />
                  </Td>
                  <Td className="text-slate-500">{i.description}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
