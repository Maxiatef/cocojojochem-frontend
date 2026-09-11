'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  AuditFilterOptions,
  AuditLogEntry,
  Paginated,
} from '@/lib/types';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
  SelectField,
  Table,
  TableHead,
  Td,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { EyeIcon } from '@/components/icons';
import { RequireAdmin } from '@/components/AdminShell';
import {
  AuditChildChanges,
  AuditDiffTable,
  ChildChangeChips,
  visibleChildChanges,
} from '@/components/admin/AuditDiffTable';

// Staff are grouped by role so a long list stays scannable, with anyone no
// longer on staff kept at the bottom rather than dropped — their entries are
// still in the log and have to stay reachable.
const ACTOR_GROUPS: {
  key: string;
  label: string;
  match: (a: { role: string; status?: string }) => boolean;
}[] = [
  { key: 'ADMIN', label: 'Admins', match: (a) => a.status !== 'GONE' && a.role === 'ADMIN' },
  { key: 'SALES', label: 'Sales', match: (a) => a.status !== 'GONE' && a.role === 'SALES' },
  {
    key: 'GONE',
    label: 'No longer staff',
    match: (a) => a.status === 'GONE' || (a.role !== 'ADMIN' && a.role !== 'SALES'),
  },
];

export default function AuditLogPage() {
  return (
    <RequireAdmin>
      <AuditLog />
    </RequireAdmin>
  );
}

function AuditLog() {
  const [search, setSearch] = useState('');
  const [entityName, setEntityName] = useState('');
  const [action, setAction] = useState('');
  const [actorId, setActorId] = useState('');
  const [actorType, setActorType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);

  // Any filter change invalidates the current page number.
  function resetPageAnd<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  const { data, isLoading, isError } = useQuery({
    // Every filter belongs in the key, or react-query serves a stale page.
    queryKey: ['admin-audit-log', search, entityName, action, actorId, actorType, from, to, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (search) params.set('search', search);
      if (entityName) params.set('entityName', entityName);
      if (action) params.set('action', action);
      if (actorId) params.set('actorId', actorId);
      if (actorType) params.set('actorType', actorType);
      if (from) params.set('from', new Date(from).toISOString());
      if (to) {
        // A bare date parses as midnight, which would exclude everything
        // that happened later that same day — the classic "I set today and
        // got nothing" bug. Push it to the end of the day instead.
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        params.set('to', end.toISOString());
      }
      return api.get<Paginated<AuditLogEntry>>(`/audit-logs?${params.toString()}`);
    },
  });

  const { data: filters } = useQuery({
    queryKey: ['admin-audit-log-filters'],
    queryFn: () => api.get<AuditFilterOptions>('/audit-logs/filters'),
  });

  const hasFilters = !!(search || entityName || action || actorId || actorType || from || to);

  function clearFilters() {
    setSearch('');
    setEntityName('');
    setAction('');
    setActorId('');
    setActorType('');
    setFrom('');
    setTo('');
    setPage(1);
  }

  const entries = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Every change made by admin and staff, with the exact values before and after. Entries are permanent — nothing here can be edited or deleted."
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-64">
          <TextField
            label=""
            placeholder="Search summary, record or person…"
            value={search}
            onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
          />
        </div>
        <div className="w-48">
          <SelectField
            label=""
            value={entityName}
            onChange={(e) => resetPageAnd(setEntityName)(e.target.value)}
          >
            <option value="">All records</option>
            {(filters?.entityNames || []).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-44">
          <SelectField label="" value={action} onChange={(e) => resetPageAnd(setAction)(e.target.value)}>
            <option value="">All actions</option>
            {(filters?.actions || []).map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, ' ')}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-40">
          {/* Roles come from the table, so SYSTEM only appears once an
              automated change has actually been recorded. */}
          <SelectField
            label=""
            value={actorType}
            onChange={(e) => resetPageAnd(setActorType)(e.target.value)}
          >
            <option value="">All roles</option>
            {(filters?.roles || []).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-56">
          <SelectField
            label=""
            value={actorId}
            onChange={(e) => resetPageAnd(setActorId)(e.target.value)}
          >
            <option value="">Anyone</option>
            {ACTOR_GROUPS.map(({ key, label, match }) => {
              const group = (filters?.actors || []).filter(match);
              if (group.length === 0) return null;
              return (
                <optgroup key={key} label={label}>
                  {group.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.email}
                      {a.status === 'DELETED' ? ' (deactivated)' : ''}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </SelectField>
        </div>
        {/* The two dates are one control, so they read as a range rather
            than two unexplained mm/dd/yyyy boxes. Each bounds the other, so
            an impossible range can't be entered in the first place. */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5">
          <span className="shrink-0 text-xs font-medium text-slate-500">Date</span>
          <input
            type="date"
            aria-label="From date"
            value={from}
            max={to || undefined}
            onChange={(e) => resetPageAnd(setFrom)(e.target.value)}
            className="w-[7.5rem] border-0 bg-transparent p-0 text-sm text-slate-900 focus:outline-none"
          />
          <span className="shrink-0 text-slate-300">&ndash;</span>
          <input
            type="date"
            aria-label="To date"
            value={to}
            min={from || undefined}
            onChange={(e) => resetPageAnd(setTo)(e.target.value)}
            className="w-[7.5rem] border-0 bg-transparent p-0 text-sm text-slate-900 focus:outline-none"
          />
        </div>

        {/* Only offered when something is actually filtered — six controls
            back to their defaults is otherwise a tedious manual reset. */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="self-center rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load the audit log." />}
      {data && entries.length === 0 && <EmptyState message="No matching activity." />}

      {data && entries.length > 0 && (
        <Card>
          <Table minWidth={900}>
            <TableHead>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>Action</Th>
              <Th>Record</Th>
              <Th>What changed</Th>
              <Th align="right">Details</Th>
            </TableHead>
            <tbody>
              {entries.map((entry) => (
                <Tr key={entry.id}>
                  <Td className="whitespace-nowrap text-slate-500">
                    <span title={entry.occurredAt}>{new Date(entry.occurredAt).toLocaleString()}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900">
                        {entry.actorEmail || entry.actorSource || 'System'}
                      </span>
                      <Badge status={entry.actorType} />
                    </div>
                  </Td>
                  <Td>
                    <Badge status={entry.action} />
                  </Td>
                  <Td>
                    <span className="text-slate-900">{entry.entityLabel || entry.entityName}</span>
                    <span className="ml-1 text-xs text-slate-400">
                      {entry.entityName} #{entry.entityId}
                    </span>
                  </Td>
                  <Td className="text-slate-600">
                    {entry.summary}
                    {entry.childChanges && visibleChildChanges(entry.childChanges).length > 0 && (
                      <span className="ml-2">
                        <ChildChangeChips childChanges={entry.childChanges} />
                      </span>
                    )}
                    {/* A failed request may describe a change that was rolled
                        back, so the row says so rather than implying it stuck. */}
                    {entry.statusCode != null && entry.statusCode >= 400 && (
                      <span className="ml-1 text-xs text-amber-700">
                        (request failed — may have been rolled back)
                      </span>
                    )}
                  </Td>
                  <Td align="right">
                    <IconButton
                      icon={EyeIcon}
                      label="View details"
                      onClick={() => setViewingId(entry.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>

          <Pagination
            page={page}
            totalPages={data?.pagination.totalPages || 1}
            onPageChange={setPage}
            totalItems={data?.pagination.total}
            itemLabel="entry"
          />
        </Card>
      )}

      {viewingId != null && (
        <AuditDetailModal id={viewingId} onClose={() => setViewingId(null)} />
      )}
    </div>
  );
}

function AuditDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: entry, isLoading, isError } = useQuery({
    queryKey: ['admin-audit-log-detail', id],
    queryFn: () => api.get<AuditLogEntry>(`/audit-logs/${id}`),
  });

  return (
    <Modal open onClose={onClose} title={entry ? entry.summary : 'Audit entry'} size="xl">
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this entry." />}

      {entry && (
        <div className="space-y-6">
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <DetailRow label="When" value={new Date(entry.occurredAt).toLocaleString()} />
            <DetailRow
              label="Who"
              value={`${entry.actorEmail || entry.actorSource || 'System'}${
                entry.actorRole ? ` (${entry.actorRole})` : ''
              }`}
            />
            <DetailRow label="Action" value={entry.action.replace(/_/g, ' ')} />
            <DetailRow
              label="Record"
              value={`${entry.entityName} #${entry.entityId}${
                entry.entityLabel ? ` — ${entry.entityLabel}` : ''
              }`}
            />
          </div>

          {entry.truncated && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This action changed more rows than the log records in a single entry, so the list below
              is partial.
            </p>
          )}

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Field changes
            </p>
            <AuditDiffTable changes={entry.changes} />
          </div>

          {entry.childChanges && visibleChildChanges(entry.childChanges).length > 0 && (
            <div className="border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Related records
              </p>
              <AuditChildChanges childChanges={entry.childChanges} />
            </div>
          )}

          <div className="border-t border-slate-100 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Request
            </p>
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              {entry.httpMethod && (
                <DetailRow label="Endpoint" value={`${entry.httpMethod} ${entry.route || ''}`} />
              )}
              {entry.statusCode != null && <DetailRow label="Status" value={String(entry.statusCode)} />}
              {entry.durationMs != null && <DetailRow label="Duration" value={`${entry.durationMs} ms`} />}
              {entry.ip && <DetailRow label="IP address" value={entry.ip} />}
              {entry.userAgent && <DetailRow label="User agent" value={entry.userAgent} />}
              <DetailRow label="Request ID" value={entry.requestId} />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1 text-sm">
      <span className="w-28 shrink-0 text-slate-500">{label}</span>
      <span className="break-all text-slate-900">{value}</span>
    </div>
  );
}
