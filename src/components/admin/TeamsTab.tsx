'use client';

/**
 * Team administration, rendered as a tab on the Settings page next to Roles
 * and Staff — the three together are "who works here and what may they do".
 *
 * A role decides what someone CAN do; a team decides WHOSE activity a manager
 * sees. They are independent on purpose: being named a team's manager grants
 * nothing at all on its own, and a manager still needs canViewOwnTeam on their
 * role before /admin/my-team will open.
 */

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { AssignableStaff, Team } from '@/lib/types';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  SelectField,
  Table,
  TableHead,
  Td,
  TextAreaField,
  TextField,
  Th,
  Tr,
  useToast,
} from '@/components/ui';
import { ChartIcon, EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { useCan } from '@/components/AdminShell';
import { TeamActivityFeed } from '@/components/admin/TeamActivityFeed';
import { TeamReportPanel } from '@/components/admin/TeamReportPanel';

interface TeamFormState {
  id: string | null;
  name: string;
  description: string;
  managerId: string;
  memberIds: string[];
}

const EMPTY_FORM: TeamFormState = {
  id: null,
  name: '',
  description: '',
  managerId: '',
  memberIds: [],
};

export function TeamsTab() {
  const canManage = useCan('canManageTeams');
  const queryClient = useQueryClient();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TeamFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Team | null>(null);
  /** Which team's activity is being inspected; null closes the drawer. */
  const [inspecting, setInspecting] = useState<Team | null>(null);

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: () => api.get<Team[]>('/teams'),
  });

  // Only fetched once the editor is open: it needs canManageTeams, so asking
  // for it up front would 403 for a view-only account looking at this tab.
  const { data: staff } = useQuery({
    queryKey: ['assignable-staff'],
    queryFn: () => api.get<AssignableStaff[]>('/teams/assignable-staff'),
    enabled: modalOpen && canManage,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
    queryClient.invalidateQueries({ queryKey: ['assignable-staff'] });
    // The team pickers on the Staff tab and the user editor read a thinner
    // query; a rename or a new team has to reach them too.
    queryClient.invalidateQueries({ queryKey: ['admin-team-options'] });
    // The users list shows each person's team.
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  }

  const saveMutation = useMutation({
    mutationFn: (body: TeamFormState) => {
      const payload = {
        name: body.name.trim(),
        description: body.description.trim() || null,
        managerId: body.managerId || null,
        memberIds: body.memberIds,
      };
      return body.id
        ? api.patch<Team>(`/teams/${body.id}`, payload)
        : api.post<Team>('/teams', payload);
    },
    onSuccess: (_data, body) => {
      invalidate();
      setModalOpen(false);
      toast.show(body.id ? 'Team updated.' : 'Team created.');
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/teams/${id}`),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.show('Team deleted. Its members were moved out of it, not removed.');
    },
    onError: (err) => {
      setPendingDelete(null);
      toast.show(getFriendlyErrorMessage(err), 'error');
    },
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  }

  async function openEdit(team: Team) {
    setError(null);
    // The list endpoint carries no roster, so the current members are read
    // fresh — editing a stale one would silently remove whoever joined since
    // the page loaded, because the API replaces the roster wholesale.
    const full = await queryClient.fetchQuery({
      queryKey: ['admin-team', team.id],
      queryFn: () => api.get<Team>(`/teams/${team.id}`),
    });
    setForm({
      id: full.id,
      name: full.name,
      description: full.description ?? '',
      managerId: full.managerId ? String(full.managerId) : '',
      memberIds: (full.members ?? []).map((m) => m.id),
    });
    setModalOpen(true);
  }

  function toggleMember(id: string) {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter((m) => m !== id)
        : [...prev.memberIds, id],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError('Give the team a name.');
      return;
    }
    saveMutation.mutate(form);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Teams</h2>
          <p className="text-xs text-slate-500">
            Group staff under a manager. The manager sees everything their members do, provided
            their role has &ldquo;View your own team&rsquo;s activity&rdquo;.
          </p>
        </div>
        {canManage && (
          <Button icon={PlusIcon} onClick={openCreate} size="sm">
            New team
          </Button>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load teams." />}
      {!isLoading && !isError && (teams ?? []).length === 0 && (
        <EmptyState message="No teams yet. Create one and pick a manager for it." />
      )}

      {!isLoading && (teams ?? []).length > 0 && (
        <Card>
          <Table minWidth={760}>
            <TableHead>
              <Th>Team</Th>
              <Th>Manager</Th>
              <Th align="right">Members</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {(teams ?? []).map((team) => (
                <Tr key={team.id}>
                  <Td>
                    <span className="font-medium text-slate-900">{team.name}</span>
                    {team.description && (
                      <div className="mt-0.5 text-xs text-slate-500">{team.description}</div>
                    )}
                  </Td>
                  <Td>
                    {team.manager ? (
                      <>
                        <span className="text-slate-900">{team.manager.fullName}</span>
                        <div className="text-xs text-slate-500">{team.manager.email}</div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">No manager yet</span>
                    )}
                  </Td>
                  <Td align="right" className="text-slate-600">
                    {team.memberCount ?? 0}
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        icon={ChartIcon}
                        label="View activity & report"
                        onClick={() => setInspecting(team)}
                      />
                      {canManage && (
                        <>
                          <IconButton
                            icon={EditIcon}
                            label="Edit team"
                            onClick={() => openEdit(team)}
                          />
                          <IconButton
                            icon={TrashIcon}
                            label="Delete team"
                            variant="danger"
                            onClick={() => setPendingDelete(team)}
                          />
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? `Edit team — ${form.name}` : 'New team'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Wholesale Sales"
              disabled={!canManage}
            />
            <SelectField
              label="Manager"
              value={form.managerId}
              onChange={(e) => setForm((p) => ({ ...p, managerId: e.target.value }))}
              disabled={!canManage}
            >
              <option value="">No manager yet</option>
              {(staff ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} {s.roleName ? `(${s.roleName})` : ''}
                </option>
              ))}
            </SelectField>
          </div>

          <TextAreaField
            label="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="What does this team handle?"
            disabled={!canManage}
          />

          <div className="border-t border-slate-100 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-sci-heading text-sm font-semibold text-sci-navy">Members</h3>
              <span className="text-xs text-slate-500">{form.memberIds.length} selected</span>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              Only staff accounts can join a team — a customer has no activity to report on.
            </p>

            <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-sci-border p-2">
              {(staff ?? []).length === 0 && (
                <p className="px-2 py-3 text-xs text-slate-500">No staff accounts to assign.</p>
              )}
              {(staff ?? []).map((s) => {
                const checked = form.memberIds.includes(s.id);
                // Someone already in another team is still selectable — picking
                // them moves them, which is the expected outcome. Saying where
                // they are now makes that a decision rather than a surprise.
                const elsewhere = s.teamId != null && s.teamId !== form.id;
                return (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-sci-pale"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!canManage}
                      onChange={() => toggleMember(s.id)}
                      className="h-4 w-4 rounded border-sci-border text-sci-blue focus:ring-sci-blue"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-900">{s.fullName}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {s.email}
                        {s.roleName && <span className="ml-1 text-slate-400">· {s.roleName}</span>}
                      </span>
                    </span>
                    {elsewhere && (
                      <span className="shrink-0 text-xs text-amber-700">in {s.teamName}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {canManage && (
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saveMutation.isPending}>
                {form.id ? 'Save team' : 'Create team'}
              </Button>
            </div>
          )}
        </form>
      </Modal>

      {inspecting && (
        <TeamInspectModal team={inspecting} onClose={() => setInspecting(null)} />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete team?"
        message={`"${pendingDelete?.name}" will be removed. Its ${
          pendingDelete?.memberCount ?? 0
        } member(s) keep their accounts and roles — they simply stop being in a team.`}
        confirmLabel="Delete team"
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

/** An admin's read-only window onto any team's activity and report. */
function TeamInspectModal({ team, onClose }: { team: Team; onClose: () => void }) {
  const [view, setView] = useState<'activity' | 'report'>('activity');

  const { data } = useQuery({
    queryKey: ['admin-team', team.id],
    queryFn: () => api.get<Team>(`/teams/${team.id}`),
  });

  const members = useMemo(
    () => (data?.members ?? []).map((m) => ({ id: m.id, fullName: m.fullName })),
    [data],
  );

  return (
    <Modal open onClose={onClose} title={`${team.name} — activity`} size="xl">
      <div className="mb-5 flex gap-1 border-b border-slate-200">
        {(['activity', 'report'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
              view === key
                ? 'border-sci-blue text-sci-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {view === 'activity' ? (
        <TeamActivityFeed endpoint={`/teams/${team.id}/activity`} members={members} />
      ) : (
        <TeamReportPanel endpoint={`/teams/${team.id}/report`} />
      )}
    </Modal>
  );
}
