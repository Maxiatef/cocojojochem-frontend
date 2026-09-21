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
import { AssignableStaff, ManagedTeamOption, TeamOverview } from '@/lib/types';
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

// A member sees the roster and stops there. Activity and Report are the
// manager's tools, and the server refuses both for a member anyway — these
// tabs are hidden so nobody is offered a door that 403s.
const MANAGER_TABS: [Tab, string][] = [
  ['members', 'Members'],
  ['activity', 'Activity'],
  ['report', 'Report'],
];
const MEMBER_TABS: [Tab, string][] = [['members', 'Members']];

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
  const canManageOwnPermission = useCan('canManageOwnTeam');
  const [rosterOpen, setRosterOpen] = useState(false);

  // Which of the caller's teams is on screen. Empty means "not chosen yet",
  // and the server then answers with their first team — so the page renders
  // correctly on the very first paint, before the switcher has loaded.
  const [teamId, setTeamId] = useState('');

  const { data: myTeams } = useQuery({
    queryKey: ['my-teams'],
    queryFn: () => api.get<ManagedTeamOption[]>('/teams/my-teams'),
    retry: false,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-team', teamId],
    queryFn: () =>
      api.get<TeamOverview>(`/teams/my-team${teamId ? `?teamId=${encodeURIComponent(teamId)}` : ''}`),
    retry: false,
  });

  // The switcher only earns its space when there is something to switch
  // between. One team is the normal case and gets the page it always had.
  const showSwitcher = (myTeams?.length ?? 0) > 1;

  // Not the permission alone: someone can hold canManageOwnTeam and still be
  // looking at a team they are merely in, where the roster is not theirs.
  const isManager = data?.viewerRole !== 'MEMBER';
  const canManageOwn = canManageOwnPermission && isManager;
  const tabs = isManager ? MANAGER_TABS : MEMBER_TABS;

  // What the server actually resolved to, which is what the <select> should
  // show — not `teamId`, which is '' until the manager picks something.
  const activeTeamId = data?.team.id ?? teamId;

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
            /not (the manager|in a team)/.test(getFriendlyErrorMessage(error))
              ? 'You are not in a team yet. An administrator can add you to one, or make you a manager, under Settings → Teams.'
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

      {showSwitcher && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-sci-border bg-white px-4 py-3">
          <label htmlFor="team-switcher" className="text-sm font-medium text-slate-700">
            Viewing
          </label>
          <select
            id="team-switcher"
            value={activeTeamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="rounded-lg border border-sci-border bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-sci-blue focus:outline-none focus:ring-1 focus:ring-sci-blue"
          >
            {(myTeams ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.memberCount} {t.memberCount === 1 ? 'member' : 'members'})
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500">
            You manage {myTeams!.length} teams. Members, activity and the report below are for the
            one selected here.
          </span>
        </div>
      )}

      <div className={`mb-6 grid gap-4 ${isManager ? 'sm:grid-cols-3' : 'sm:grid-cols-1'}`}>
        <StatCard label="Members" value={data.memberCount} icon={UsersIcon} />
        {isManager && (
          <>
            <StatCard
              label="Recorded actions"
              value={data.totalActions}
              icon={ChartIcon}
              accent="amber"
            />
            <StatCard
              label="Most recent activity"
              value={lastActive}
              icon={ClockIcon}
              accent="slate"
            />
          </>
        )}
      </div>

      <div
        className={`mb-6 flex flex-wrap gap-x-1 gap-y-2 border-b border-slate-200 ${
          tabs.length === 1 ? 'hidden' : ''
        }`}
      >
        {tabs.map(([key, label]) => (
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
          isManager={isManager}
          canManageOwn={canManageOwn}
          onEditRoster={() => setRosterOpen(true)}
        />
      )}
      {tab === 'activity' && isManager && (
        <TeamActivityFeed
          endpoint="/teams/my-team/activity"
          members={members}
          teamId={activeTeamId}
        />
      )}
      {tab === 'report' && isManager && (
        <TeamReportPanel endpoint="/teams/my-team/report" teamId={activeTeamId} />
      )}

      {rosterOpen && (
        <RosterModal
          teamId={activeTeamId}
          currentIds={data.members.map((m) => m.id)}
          onClose={() => setRosterOpen(false)}
        />
      )}
    </div>
  );
}

/** "Jamie Rivera" -> "JR". One letter when there is only one word. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function MembersTab({
  data,
  isManager,
  canManageOwn,
  onEditRoster,
}: {
  data: TeamOverview;
  /** Drops the two activity columns, which a member is not sent values for. */
  isManager: boolean;
  canManageOwn: boolean;
  onEditRoster: () => void;
}) {
  const tz = useSiteTimezone();

  return (
    <div className="space-y-4">
      {/* The manager is not in the roster below — a manager's own teamId is
          null, since they are the person the team reports TO. Without a row of
          their own they were a line of grey text an employee could miss, so
          they get a card: for a member this is the one name on the page they
          actually need, with an address to reach it at. */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {data.team.manager ? (
          <Card className="flex min-w-[260px] items-center gap-3 px-4 py-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sci-blue/10 text-sm font-semibold uppercase text-sci-blue"
            >
              {initialsOf(data.team.manager.fullName)}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Manager{isManager ? ' (you)' : ''}
              </span>
              <span className="block truncate text-sm font-medium text-slate-900">
                {data.team.manager.fullName}
              </span>
              <a
                href={`mailto:${data.team.manager.email}`}
                className="block truncate text-xs text-sci-blue hover:underline"
              >
                {data.team.manager.email}
              </a>
            </span>
          </Card>
        ) : (
          <p className="text-xs text-slate-500">
            This team has no manager set. An administrator can assign one under Settings →
            Teams.
          </p>
        )}
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
              {isManager && <Th align="right">Actions recorded</Th>}
              {isManager && <Th>Last active</Th>}
            </TableHead>
            <tbody>
              {data.members.map((m) => (
                <Tr key={m.id}>
                  <Td>
                    <div className="font-medium text-slate-900">{m.fullName}</div>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </Td>
                  <Td className="text-slate-600">{m.roleName ?? '—'}</Td>
                  {isManager && (
                    <Td align="right" className="text-slate-900">
                      {m.actionCount}
                    </Td>
                  )}
                  {isManager && (
                    <Td className="whitespace-nowrap text-slate-500">
                      {m.lastActiveAt ? formatDateTime(m.lastActiveAt, tz) : 'Never'}
                    </Td>
                  )}
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
function RosterModal({
  teamId,
  currentIds,
  onClose,
}: {
  /** The team on screen — without it a manager of several would always edit the first. */
  teamId: string;
  currentIds: string[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>(currentIds);
  const [error, setError] = useState<string | null>(null);

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ['assignable-staff'],
    queryFn: () => api.get<AssignableStaff[]>('/teams/assignable-staff'),
  });

  const save = useMutation({
    mutationFn: () => api.put('/teams/my-team/members', { memberIds: selected, teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
      // The switcher shows each team's member count, so it goes stale too.
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-activity'] });
      onClose();
      toast.show('Team updated.');
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  function toggle(id: string) {
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
