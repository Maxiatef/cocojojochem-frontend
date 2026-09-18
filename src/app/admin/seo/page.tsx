'use client';

import { Fragment, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequirePermission, useCan } from '@/components/AdminShell';
import { PageSeoDetail } from '@/components/admin/PageSeoDetail';
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

/**
 * Buckets a crawled path into the section it belongs under.
 *
 * `/products/[slug]` and `/categories/[slug]` are templates, not pages: the
 * crawler scores one sampled record and files it under the template path, so
 * the list stays the same size and the same shape whatever happens to the
 * catalogue. They get their own section because reading them as ordinary
 * rows invites the wrong conclusion — that one product was checked and the
 * rest were not.
 *
 * Order matters: a template must be tested before the landing page whose
 * prefix it shares.
 */
const TEMPLATE_PATHS = ['/products/[slug]', '/categories/[slug]'];

const METRIC_GROUPS: { key: string; label: string; match: (path: string) => boolean }[] = [
  { key: 'templates', label: 'Page templates', match: (p) => TEMPLATE_PATHS.includes(p) },
  { key: 'legal', label: 'Legal', match: (p) => p.startsWith('/legal') },
  {
    key: 'main',
    label: 'Main pages',
    match: (p) => ['/', '/products', '/categories', '/functions', '/about', '/contact', '/quote-request'].includes(p),
  },
  // Anything an admin registered by hand that matches none of the above.
  { key: 'other', label: 'Other', match: () => true },
];

function groupMetrics(metrics: SeoMetric[]) {
  // Main first — they are the pages anyone actually asks about — then the
  // long generated lists, then the tail.
  const order = ['main', 'templates', 'legal', 'other'];
  const buckets = new Map<string, SeoMetric[]>();

  for (const metric of metrics) {
    const group = METRIC_GROUPS.find((g) => g.match(metric.path))!;
    const existing = buckets.get(group.key);
    if (existing) existing.push(metric);
    else buckets.set(group.key, [metric]);
  }

  return order
    .filter((key) => buckets.has(key))
    .map((key) => ({
      key,
      label: METRIC_GROUPS.find((g) => g.key === key)!.label,
      rows: buckets.get(key)!,
    }));
}

/** Row disclosure arrow. Rotates rather than swapping glyphs, so it animates. */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
        open ? 'rotate-90' : ''
      }`}
    >
      <path d="M7 5l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-slate-300">—</span>;
  }
  return (
    <span
      className={`inline-block min-w-[2.75rem] rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${scorePillClass(
        score,
      )}`}
    >
      {score}
    </span>
  );
}

export default function SeoAdminPage() {
  return (
    <RequirePermission permission="canViewSeoPages">
      <div>
        <PageHeader title="SEO" description="Real-time crawl-based site analysis." />
        <SiteAnalysisTab />
      </div>
    </RequirePermission>
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
  // Running the crawler is a write (it stores metrics and issues), so it has
  // its own permission rather than riding on read access to this page.
  const canAnalyze = useCan('canRunSeoAnalyzer');
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [expandedMetricId, setExpandedMetricId] = useState<string | null>(null);

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
        {canAnalyze && (
          <Button onClick={() => analyzeMutation.mutate()} loading={analyzeMutation.isPending} icon={GlobeIcon}>
            Analyze Site
          </Button>
        )}
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
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <span className="text-sm font-semibold text-slate-900">Per-Page Metrics</span>
          {metrics.length > 0 && (
            <span className="text-xs text-slate-500">
              {metrics.length} page{metrics.length === 1 ? '' : 's'} covered
            </span>
          )}
        </div>
        {metricsQuery.isLoading && <LoadingState />}
        {metricsQuery.isError && <ErrorState message="Couldn't load SEO metrics." />}
        {!metricsQuery.isLoading && !metricsQuery.isError && metrics.length === 0 && (
          <EmptyState message="No pages analyzed yet — click Analyze Site to run a crawl." />
        )}
        {!metricsQuery.isLoading && metrics.length > 0 && (
          <Table minWidth={820}>
            <TableHead>
              <Th>Path</Th>
              <Th>Title</Th>
              <Th>Meta</Th>
              <Th align="right">Words</Th>
              <Th align="right">SEO</Th>
              <Th align="right">Readability</Th>
              <Th align="right">To fix</Th>
            </TableHead>
            <tbody>
              {groupMetrics(metrics).map((group) => (
              <Fragment key={group.key}>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <td colSpan={7} className="px-5 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {group.label}
                    </span>
                    <span className="ml-2 text-xs tabular-nums text-slate-400">
                      {group.rows.length}
                    </span>
                    {/* Said once, on the section, rather than repeated on each
                        row — otherwise a template row reads as "we checked
                        this one product and skipped the others". */}
                    {group.key === 'templates' && (
                      <span className="ml-2 text-xs font-normal normal-case text-slate-400">
                        — scored from one sample page each; per-product SEO is in the product
                        editor
                      </span>
                    )}
                  </td>
                </tr>
                {group.rows.map((m) => {
                const isOpen = expandedMetricId === m.id;
                const toFix = m.seoProblems + m.readabilityProblems;
                const hasReport = !!m.yoastChecks?.length;
                return (
                  // Keyed Fragment, not the shorthand: each row contributes TWO
                  // sibling <tr>s and React needs the key on the element it is
                  // actually iterating over.
                  <Fragment key={m.id}>
                    <Tr onClick={() => setExpandedMetricId(isOpen ? null : m.id)}>
                      <Td className="font-medium text-slate-900">
                        <span className="inline-flex items-center gap-2">
                          <ChevronIcon open={isOpen} />
                          {m.path}
                        </span>
                      </Td>
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
                      <Td align="right" className="tabular-nums text-slate-600">
                        {m.wordCount ?? '—'}
                      </Td>
                      <Td align="right">
                        <ScorePill score={m.yoastSeoScore} />
                      </Td>
                      <Td align="right">
                        <ScorePill score={m.readabilityScore} />
                      </Td>
                      <Td align="right">
                        {!hasReport ? (
                          <span className="text-xs text-slate-300">—</span>
                        ) : toFix === 0 ? (
                          <span className="text-xs font-medium text-green-700">Clean</span>
                        ) : (
                          <span className="text-xs font-medium text-red-600">{toFix}</span>
                        )}
                      </Td>
                    </Tr>

                    {isOpen && (
                      <tr className="border-b border-slate-100 last:border-0">
                        <td colSpan={7} className="bg-slate-50/70 px-5 py-4">
                          <PageSeoDetail metric={m} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
                })}
              </Fragment>
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
