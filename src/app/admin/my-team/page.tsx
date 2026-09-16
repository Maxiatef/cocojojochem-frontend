'use client';

/**
 * A manager's view of their own team.
 *
 * Every request from this page hits `/teams/my-team/...`, which takes no team
 * id — the server resolves the team from `teams.managerId = <the caller>`. So
 * there is nothing on this page a manager could edit to see another team, and
 * the gating below is presentation only.
 *
 * The one write here (editing the roster) is behind a separate permission from
 * reading, so an admin can hand out a view-only manager or a manager who also
 * picks their own people.
 */

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { formatDateTime, useSiteTimezone } from '@/lib/siteTimezone';
import { AssignableStaff, TeamOverview } from '@/lib/types';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
  StatCard,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
  useToast,
} from '@/components/ui';
import { ChartIcon, ClockIcon, UsersIcon } from '@/components/icons';
import { RequirePermission, useCan } from '@/components/AdminShell';
import { TeamActivityFeed } from '@/components/admin/TeamActivityFeed';
import { TeamReportPanel } from '@/components/admin/TeamReportPanel';

type Tab = 'members' | 'activity' | 'report';

const TABS: [Tab, string][] = [
  ['members', 'Members'],
  ['activity', 'Activity'],
  ['report', 'Report'],
];

export default function MyTeamPage() {
  return (
    <RequirePermission permission="canViewOwnTeam">
      <MyTeam />
    </RequirePermission>
  );
}

function MyTeam() {
  const tz = useSiteTimezone();
  const [tab, setTab] = useState<Tab>('members');
  const canManageOwn = useCan('canManageOwnTeam');
  const [rosterOpen, setRosterOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-team'],
    queryFn: () => api.get<TeamOverview>('/teams/my-team'),
    retry: false,
  });

  const members = useMemo(
    () => (data?.members ?? []).map((m) => ({ id: m.id, fullName: m.fullName })),
    [data],
  );

  // ISO strings sort lexicographically, so the last one is the latest.
  const lastActive = useMemo(() => {
    const latest = (data?.members ?? [])
      .map((m) => m.lastActiveAt)
      .filter((d): d is string => Boolean(d))
      .sort()
      .pop();
    return latest ? formatDateTime(latest, tz) : '—';
  }, [data, tz]);

  if (isLoading) return <LoadingState />;

  // The most likely failure by far is "you are not the manager of a team",
  // which is a 403 and not really an error — someone was given the permission
  // but never put in charge of anything. Say that, rather than showing a red
  // box that suggests something is broken.
  if (isError) {
    return (
      <div>
        <PageHeader title="My team" />
        <EmptyState
          message={
            getFriendlyErrorMessage(error).includes('not the manager')
              ? 'You are not set as the manager of a team yet. An administrator can assign you one under Settings → Teams.'
              : getFriendlyErrorMessage(error)
          }
        />
      </div>
    );
  }

  if (!data) return <ErrorState message="Couldn't load your team." />;

  return (
    <div>
      <PageHeader
        title={data.team.name}
        description={data.team.description || 'Everything your team has been doing.'}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Members" value={data.memberCount} icon={UsersIcon} />
        <StatCard label="Recorded actions" value={data.totalActions} icon={ChartIcon} accent="amber" />
        <StatCard label="Most recent activity" value={lastActive} icon={ClockIcon} accent="slate" />
      </div>

      <div className="mb-6 flex flex-wrap gap-x-1 gap-y-2 border-b border-slate-200">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === key
                ? 'border-sci-blue text-sci-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <MembersTab
          data={data}
          canManageOwn={canManageOwn}
          onEditRoster={() => setRosterOpen(true)}
        />
      )}
      {tab === 'activity' && (
        <TeamActivityFeed endpoint="/teams/my-team/activity" members={members} />
      )}
      {tab === 'report' && <TeamReportPanel endpoint="/teams/my-team/report" />}

      {rosterOpen && (
        <RosterModal
          currentIds={data.members.map((m) => m.id)}
          onClose={() => setRosterOpen(false)}
        />
      )}
    </div>
  );
}

function MembersTab({
  data,
  canManageOwn,
  onEditRoster,
}: {
  data: TeamOverview;
  canManageOwn: boolean;
  onEditRoster: () => void;
}) {
  const tz = useSiteTimezone();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {data.team.manager
            ? `Managed by ${data.team.manager.fullName}.`
            : 'This team has no manager set.'}
        </p>
        {canManageOwn && (
          <Button size="sm" variant="secondary" onClick={onEditRoster}>
            Edit members
          </Button>
        )}
      </div>

      {data.members.length === 0 ? (
        <EmptyState
          message={
            canManageOwn
              ? 'No members yet. Use “Edit members” to add people to your team.'
              : 'No members yet. An administrator can add people to this team.'
          }
        />
      ) : (
        <Card>
          <Table minWidth={640}>
            <TableHead>
              <Th>Member</Th>
              <Th>Role</Th>
              <Th align="right">Actions recorded</Th>
              <Th>Last active</Th>
            </TableHead>
            <tbody>
              {data.members.map((m) => (
                <Tr key={m.id}>
                  <Td>
                    <div className="font-medium text-slate-900">{m.fullName}</div>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </Td>
                  <Td className="text-slate-600">{m.roleName ?? '—'}</Td>
                  <Td align="right" className="text-slate-900">
                    {m.actionCount}
                  </Td>
                  <Td className="whitespace-nowrap text-slate-500">
                    {m.lastActiveAt ? formatDateTime(m.lastActiveAt, tz) : 'Never'}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}

/**
 * Roster editing for a manager who has canManageOwnTeam.
 *
 * Sends the complete intended member list, matching the admin tab — the API
 * replaces the roster rather than applying a delta, so what is ticked here is
 * exactly what the team ends up as.
 */
function RosterModal({ currentIds, onClose }: { currentIds: number[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selected, setSelected] = useState<number[]>(currentIds);
  const [error, setError] = useState<string | null>(null);

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ['assignable-staff'],
    queryFn: () => api.get<AssignableStaff[]>('/teams/assignable-staff'),
  });

  const save = useMutation({
    mutationFn: () => api.put('/teams/my-team/members', { memberIds: selected }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-activity'] });
      onClose();
      toast.show('Team updated.');
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <Modal open onClose={onClose} title="Edit team members" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Couldn't load the staff list." />}

        {staff && (
          <>
            <p className="text-xs text-slate-500">{selected.length} selected</p>
            <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-sci-border p-2">
              {staff.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-sci-pale"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggle(s.id)}
                    className="h-4 w-4 rounded border-sci-border text-sci-blue focus:ring-sci-blue"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-900">{s.fullName}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {s.email}
                      {s.roleName && <span className="ml-1 text-slate-400">· {s.roleName}</span>}
                    </span>
                  </span>
                  {s.teamId != null && !currentIds.includes(s.id) && (
                    <span className="shrink-0 text-xs text-amber-700">in {s.teamName}</span>
                  )}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button loading={save.isPending} onClick={() => save.mutate()}>
                Save members
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
