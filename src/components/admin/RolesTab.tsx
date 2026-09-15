'use client';

/**
 * Role CRUD, rendered as a tab on the Settings page rather than as its own
 * admin route — roles are configuration, and they sit next to the Staff tab
 * that assigns them. Moved here from /admin/roles.
 */

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Paginated, PermissionGroup, Role, UserListItem } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  Table,
  TableHead,
  Td,
  TextAreaField,
  TextField,
  Th,
  Tr,
  IconButton,
  useToast,
} from '@/components/ui';
import { EditIcon, PlusIcon, TrashIcon, UsersIcon } from '@/components/icons';
import { useCan } from '@/components/AdminShell';

interface RoleFormState {
  id: number | null;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}

const EMPTY_FORM: RoleFormState = { id: null, name: '', description: '', permissions: {} };

export function RolesTab() {
  const canManage = useCan('canManageRoles');
  const canViewUsers = useCan('canViewUsers');
  const canEditUser = useCan('canEditUser');
  const queryClient = useQueryClient();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<RoleFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);
  // Which role's members are being inspected; null closes the dialog.
  const [membersOf, setMembersOf] = useState<Role | null>(null);

  // Reuses the existing admin users list rather than adding a roles/:id/users
  // endpoint — it already filters by roleId and is gated on canViewUsers.
  //
  // status=ACTIVE,DELETED on purpose: the Users count on this page, and the
  // server's "can't delete a role that's still assigned" check, both count
  // every holder regardless of status. Listing only active users here would
  // show 0 members next to a count of 1 and make a blocked delete look like a
  // bug.
  const { data: members, isLoading: membersLoading, isError: membersError } = useQuery({
    queryKey: ['role-members', membersOf?.id],
    queryFn: () =>
      api.get<Paginated<UserListItem>>(
        `/users?roleId=${membersOf!.id}&status=ACTIVE,DELETED&limit=100&page=1`,
      ),
    enabled: membersOf !== null,
  });

  const {
    data: roles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => api.get<Role[]>('/roles'),
  });

  // The catalog of grantable permissions comes from the server so this page
  // can never drift from what the guards actually check.
  const { data: groups } = useQuery({
    queryKey: ['permission-groups'],
    queryFn: () => api.get<PermissionGroup[]>('/roles/permissions/groups'),
  });

  const totalPermissions = useMemo(
    () => (groups ?? []).reduce((n, g) => n + g.permissions.length, 0),
    [groups],
  );

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    // The user/staff role pickers read a separate, thinner query — a rename or
    // a new role has to reach them too.
    queryClient.invalidateQueries({ queryKey: ['admin-role-options'] });
    // A permission change alters what the current account may see, so the
    // sidebar and every page gate have to re-read /auth/me.
    queryClient.invalidateQueries({ queryKey: ['auth-me'] });
  }

  const saveMutation = useMutation({
    mutationFn: (body: RoleFormState) => {
      const payload = {
        name: body.name.trim(),
        description: body.description.trim() || null,
        permissions: body.permissions,
      };
      return body.id
        ? api.patch<Role>(`/roles/${body.id}`, payload)
        : api.post<Role>('/roles', payload);
    },
    onSuccess: (_data, body) => {
      invalidate();
      setModalOpen(false);
      toast.show(body.id ? 'Role updated.' : 'Role created.');
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.show('Role deleted.');
    },
    onError: (err) => {
      setPendingDelete(null);
      toast.show(getFriendlyErrorMessage(err), 'error');
    },
  });

  function openCreate() {
    // The catalog decides which boxes start ticked (`defaultOn`), so a new
    // default added on the server shows up here without a frontend change.
    const defaults: Record<string, boolean> = {};
    for (const group of groups ?? []) {
      for (const p of group.permissions) if (p.defaultOn) defaults[p.key] = true;
    }
    setForm({ ...EMPTY_FORM, permissions: defaults });
    setError(null);
    setModalOpen(true);
  }

  function openEdit(role: Role) {
    setForm({
      id: role.id,
      name: role.name,
      description: role.description ?? '',
      permissions: { ...role.permissions },
    });
    setError(null);
    setModalOpen(true);
  }

  function togglePermission(key: string) {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }));
  }

  function toggleGroup(group: PermissionGroup, on: boolean) {
    setForm((prev) => {
      const next = { ...prev.permissions };
      for (const p of group.permissions) next[p.key] = on;
      return { ...prev, permissions: next };
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError('Give the role a name.');
      return;
    }
    saveMutation.mutate(form);
  }

  const grantedCount = (role: Role) =>
    Object.values(role.permissions ?? {}).filter(Boolean).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Roles</h2>
          <p className="text-xs text-slate-500">
            Create roles and choose exactly what each one can do. Changes apply to everyone holding
            the role on their next request.
          </p>
        </div>
        {canManage && (
          <Button icon={PlusIcon} onClick={openCreate} size="sm">
            New role
          </Button>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load roles." />}
      {!isLoading && !isError && (roles ?? []).length === 0 && (
        <EmptyState message="No roles yet." />
      )}

      {!isLoading && (roles ?? []).length > 0 && (
        <Card>
          <Table minWidth={760}>
            <TableHead>
              <Th>Role</Th>
              <Th>Permissions</Th>
              <Th>Users</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {(roles ?? []).map((role) => (
                <Tr key={role.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{role.name}</span>
                      {role.isSystem && <Badge status="SYSTEM" />}
                    </div>
                    {role.description && (
                      <div className="mt-0.5 text-xs text-slate-500">{role.description}</div>
                    )}
                  </Td>
                  <Td className="text-slate-600">
                    {grantedCount(role)}
                    {totalPermissions > 0 && (
                      <span className="text-slate-400"> / {totalPermissions}</span>
                    )}
                  </Td>
                  <Td className="text-slate-600">
                    {/* Only clickable when there's something to show and the
                        account may read users — the endpoint behind it needs
                        canViewUsers, so otherwise this would just 403. */}
                    {canViewUsers && (role.userCount ?? 0) > 0 ? (
                      <button
                        type="button"
                        onClick={() => setMembersOf(role)}
                        className="inline-flex items-center gap-1.5 rounded font-medium text-sci-blue underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sci-blue"
                        title={`See who has the ${role.name} role`}
                      >
                        <UsersIcon className="h-4 w-4" />
                        {role.userCount}
                      </button>
                    ) : (
                      (role.userCount ?? 0)
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        icon={EditIcon}
                        label={canManage ? 'Edit role' : 'View role'}
                        onClick={() => openEdit(role)}
                      />
                      {/* System roles and roles still in use can't be deleted
                          server-side, so don't offer an action that would 403. */}
                      {canManage && !role.isSystem && (role.userCount ?? 0) === 0 && (
                        <IconButton
                          icon={TrashIcon}
                          label="Delete role"
                          variant="danger"
                          onClick={() => setPendingDelete(role)}
                        />
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
        title={form.id ? `Edit role — ${form.name}` : 'New role'}
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
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Warehouse"
              disabled={!canManage || (form.id !== null && isSystemRole(roles, form.id))}
            />
            <TextAreaField
              label="Description"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="What is this role for?"
              disabled={!canManage}
            />
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-5">
            {(groups ?? []).map((group) => {
              const all = group.permissions.every((p) => form.permissions[p.key]);
              return (
                <div key={group.group}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-sci-heading text-sm font-semibold text-sci-navy">
                      {group.group}
                    </h3>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group, !all)}
                        className="text-xs font-medium text-sci-blue hover:underline"
                      >
                        {all ? 'Clear all' : 'Select all'}
                      </button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map((p) => (
                      <label
                        key={p.key}
                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                          form.permissions[p.key]
                            ? 'border-sci-blue/40 bg-sci-blue/5'
                            : 'border-slate-200'
                        } ${canManage ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={form.permissions[p.key] === true}
                          disabled={!canManage}
                          onChange={() => togglePermission(p.key)}
                        />
                        <span>
                          <span className="block text-slate-800">{p.label}</span>
                          <span className="block font-mono text-[11px] text-slate-400">{p.key}</span>
                          {p.defaultOn && (
                            <span className="mt-0.5 block text-[11px] text-slate-400">
                              On by default — staff land on the dashboard after signing in.
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {canManage && (
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saveMutation.isPending}>
                {form.id ? 'Save changes' : 'Create role'}
              </Button>
            </div>
          )}
        </form>
      </Modal>

      {/* Who holds this role */}
      <Modal
        open={membersOf !== null}
        onClose={() => setMembersOf(null)}
        title={membersOf ? `Users with the ${membersOf.name} role` : ''}
        size="lg"
      >
        {membersLoading && <LoadingState />}
        {membersError && <ErrorState message="Couldn't load the users for this role." />}

        {!membersLoading && !membersError && (members?.data.length ?? 0) === 0 && (
          <EmptyState message="Nobody holds this role." />
        )}

        {!membersLoading && (members?.data.length ?? 0) > 0 && (
          <div className="divide-y divide-slate-100">
            {members!.data.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-slate-900">{u.fullName}</span>
                    {/* Recycled accounts still hold the role and still block
                        deleting it, so they're listed and marked rather than
                        hidden. */}
                    {u.status === 'DELETED' && <Badge status="DELETED" />}
                  </div>
                  <div className="truncate text-xs text-slate-500">{u.email}</div>
                </div>

                {canEditUser && (
                  <Link
                    href={`/admin/users/${u.id}/edit`}
                    className="shrink-0 text-xs font-medium text-sci-blue hover:underline"
                  >
                    Open
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* The request caps at 100; say so rather than silently truncating. */}
        {(members?.pagination.total ?? 0) > (members?.data.length ?? 0) && (
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            Showing the first {members!.data.length} of {members!.pagination.total}. Use the Users
            page to see the rest.
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={() => setMembersOf(null)}>
            Close
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete role"
        message={`Delete the role "${pendingDelete?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
      />
    </>
  );
}

function isSystemRole(roles: Role[] | undefined, id: number) {
  return roles?.find((r) => r.id === id)?.isSystem === true;
}
