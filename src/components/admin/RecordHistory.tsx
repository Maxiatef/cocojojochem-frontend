'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AuditLogEntry, Paginated } from '@/lib/types';
import { Badge, ErrorState, LoadingState, Pagination } from '@/components/ui';
import { useIsAdmin } from '@/components/AdminShell';
import {
  AuditChildChanges,
  AuditDiffTable,
  ChildChangeChips,
  visibleChildChanges,
} from '@/components/admin/AuditDiffTable';

/**
 * How many history entries are shown per page.
 *
 * Deliberately a named constant rather than a literal: a busy product can
 * accumulate hundreds of entries, and this is the one number to change to tune
 * the section's height against the rest of the detail page. Callers can still
 * override it per-instance via the `pageSize` prop.
 */
export const HISTORY_PAGE_SIZE = 5;

/**
 * One record's own audit trail, for embedding in a product / order / user
 * detail view.
 *
 * This is the reverse direction of the audit log's polymorphic link: the log
 * page answers "what happened recently", this answers "what happened to THIS
 * record". Backed by the (entityName, entityId, occurredAt) index.
 *
 * Renders nothing for a non-ADMIN — the API refuses them anyway, and a
 * permanent error box on an otherwise working page is just noise.
 */
export function RecordHistory({
  entityName,
  entityId,
  pageSize = HISTORY_PAGE_SIZE,
}: {
  entityName: string;
  entityId: number | string;
  pageSize?: number;
}) {
  const isAdmin = useIsAdmin();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Paged on the SERVER, not sliced in the browser: the whole point of the
  // (entityName, entityId, occurredAt) index is that a record with hundreds of
  // entries fetches ten of them, not all of them.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['record-history', entityName, String(entityId), page, pageSize],
    queryFn: () =>
      api.get<Paginated<AuditLogEntry>>(
        `/audit-logs?entityName=${encodeURIComponent(entityName)}&entityId=${encodeURIComponent(
          String(entityId),
        )}&page=${page}&limit=${pageSize}`,
      ),
    enabled: isAdmin,
    // Keeps the current page on screen while the next one loads, so paging
    // doesn't collapse the section to a spinner and jump the page around it.
    placeholderData: (previous) => previous,
  });

  if (!isAdmin) return null;

  const entries = data?.data || [];
  // totalPages is optional on the shared Paginated type, so it is derived from
  // the counts the API always sends rather than assumed to be present.
  const totalPages =
    data?.pagination.totalPages ??
    (data ? Math.max(1, Math.ceil(data.pagination.total / (data.pagination.limit || pageSize))) : 1);

  function goToPage(next: number) {
    setPage(next);
    // An expanded entry belongs to the page being left; keeping it open would
    // leave a detail panel open against an unrelated row.
    setExpanded(null);
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">History</h2>
        {data && entries.length > 0 && (
          <span className="text-xs text-slate-400">
            {data.pagination.total} change{data.pagination.total === 1 ? '' : 's'} recorded
          </span>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this record's history." />}
      {data && entries.length === 0 && (
        <p className="text-sm text-slate-400">
          No recorded changes yet. Only changes made since the audit log was switched on appear here.
        </p>
      )}

      {entries.length > 0 && (
        <ol className="space-y-2">
          {entries.map((entry) => {
            const isOpen = expanded === entry.id;
            return (
              <li key={entry.id} className="overflow-hidden rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="shrink-0 pt-0.5">
                    <Badge status={entry.action} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate-800">
                      {entry.summary}
                      {entry.childChanges && visibleChildChanges(entry.childChanges).length > 0 && (
                        <span className="ml-2">
                          <ChildChangeChips childChanges={entry.childChanges} />
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {entry.actorEmail || entry.actorSource || 'System'}
                      {entry.actorRole ? ` · ${entry.actorRole}` : ''} ·{' '}
                      <span title={entry.occurredAt}>
                        {new Date(entry.occurredAt).toLocaleString()}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-xs font-medium text-slate-400">
                    {isOpen ? 'Hide' : 'Details'}
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-5 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
                    <section>
                      <SectionLabel>Who &amp; when</SectionLabel>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                        <Row
                          label="Actor"
                          value={entry.actorEmail || entry.actorSource || 'System'}
                        />
                        <Row label="Role" value={entry.actorRole || entry.actorType} />
                        <Row label="When" value={new Date(entry.occurredAt).toLocaleString()} />
                        <Row label="Action" value={entry.action.replace(/_/g, ' ')} />
                      </div>
                    </section>

                    <section>
                      <SectionLabel>Field changes</SectionLabel>
                      <AuditDiffTable changes={entry.changes} />
                    </section>

                    {entry.childChanges && visibleChildChanges(entry.childChanges).length > 0 && (
                      <section>
                        <SectionLabel>Related records</SectionLabel>
                        <AuditChildChanges childChanges={entry.childChanges} />
                      </section>
                    )}

                    {/* A 4xx/5xx entry may describe a change that was rolled
                        back, so it says so rather than reading as settled. */}
                    {entry.statusCode != null && entry.statusCode >= 400 && (
                      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        This request failed ({entry.statusCode}) — the change may have been rolled back.
                      </p>
                    )}

                    <section>
                      <SectionLabel>Request</SectionLabel>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                        {entry.httpMethod && (
                          <Row label="Endpoint" value={`${entry.httpMethod} ${entry.route || ''}`} />
                        )}
                        {entry.statusCode != null && <Row label="Status" value={String(entry.statusCode)} />}
                        {entry.durationMs != null && <Row label="Duration" value={`${entry.durationMs} ms`} />}
                        {entry.ip && <Row label="IP address" value={entry.ip} />}
                        {entry.userAgent && <Row label="User agent" value={entry.userAgent} />}
                        <Row label="Request ID" value={entry.requestId} />
                      </div>
                    </section>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {data && totalPages > 1 && (
        <div className="mt-3">
          <Pagination
            page={data.pagination.page}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={data.pagination.total}
            itemLabel="change"
          />
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="w-24 shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 break-all text-slate-800">{value}</span>
    </div>
  );
}
