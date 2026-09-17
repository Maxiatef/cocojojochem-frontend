'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDateTime, useSiteTimezone } from '@/lib/siteTimezone';
import { AuditLogEntry, Paginated, TeamMemberSummary } from '@/lib/types';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
  SelectField,
  Table,
  TableHead,
  Td,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { ChildChangeChips, visibleChildChanges } from '@/components/admin/AuditDiffTable';
import { displayId } from '@/lib/ids';

const PAGE_SIZE = 25;

const ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGIN_FAILED',
  'LOGOUT',
  'PASSWORD_CHANGE',
  'SESSION_REVOKE',
];

/**
 * A team's activity, read from the audit log.
 *
 * Takes the endpoint as a prop so the manager's own view
 * (`/teams/my-team/activity`) and an admin looking at any team
 * (`/teams/:id/activity`) share one component. Neither sends member ids: the
 * server resolves the team's roster itself and hard-limits the result to it,
 * so a filter typed here can only ever narrow the list, never widen it.
 *
 * This is deliberately every record type, not only orders or customers — a
 * manager asking "what has my team been doing" means all of it.
 */
export function TeamActivityFeed({
  endpoint,
  members,
}: {
  endpoint: string;
  /** Used only to populate the per-member filter. */
  members: Pick<TeamMemberSummary, 'id' | 'fullName'>[];
}) {
  const tz = useSiteTimezone();
  const [page, setPage] = useState(1);
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');

  // Every filter change goes through this, so none of them can leave the view
  // on a page number that no longer exists.
  function resetPageAnd(fn: () => void) {
    setPage(1);
    fn();
  }

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (actorId) params.set('actorId', actorId);
  if (action) params.set('action', action);
  if (search.trim()) params.set('search', search.trim());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['team-activity', endpoint, page, actorId, action, search],
    queryFn: () => api.get<Paginated<AuditLogEntry>>(`${endpoint}?${params.toString()}`),
  });

  const entries = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Member"
          value={actorId}
          onChange={(e) => resetPageAnd(() => setActorId(e.target.value))}
        >
          <option value="">Everyone on the team</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Action"
          value={action}
          onChange={(e) => resetPageAnd(() => setAction(e.target.value))}
        >
          <option value="">Any action</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Search"
          value={search}
          placeholder="Record name or summary"
          onChange={(e) => resetPageAnd(() => setSearch(e.target.value))}
        />
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load your team's activity." />}
      {data && entries.length === 0 && (
        <EmptyState
          message={
            members.length === 0
              ? 'This team has no members yet, so there is nothing to show.'
              : 'No activity matches these filters.'
          }
        />
      )}

      {data && entries.length > 0 && (
        <Card>
          <Table minWidth={860}>
            <TableHead>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>Action</Th>
              <Th>Record</Th>
              <Th>What changed</Th>
            </TableHead>
            <tbody>
              {entries.map((entry) => (
                <Tr key={entry.id}>
                  <Td className="whitespace-nowrap text-slate-500">
                    <span title={entry.occurredAt}>{formatDateTime(entry.occurredAt, tz)}</span>
                  </Td>
                  <Td className="text-slate-900">{entry.actorEmail || 'Unknown'}</Td>
                  <Td>
                    <Badge status={entry.action} />
                  </Td>
                  <Td>
                    <span className="text-slate-900">{entry.entityLabel || entry.entityName}</span>
                    <span className="ml-1 text-xs text-slate-400">
                      {entry.entityName} {displayId(entry.entityId)}
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
                        back, so say so rather than implying it stuck. */}
                    {entry.statusCode != null && entry.statusCode >= 400 && (
                      <span className="ml-1 text-xs text-amber-700">
                        (request failed — may have been rolled back)
                      </span>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>

          <Pagination
            page={page}
            totalPages={data.pagination.totalPages || 1}
            onPageChange={setPage}
            totalItems={data.pagination.total}
            itemLabel="entry"
          />
        </Card>
      )}
    </div>
  );
}
