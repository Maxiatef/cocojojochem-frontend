'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { PermissionGroup, Role } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
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
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { RequirePermission, useCan } from '@/components/AdminShell';

interface RoleFormState {
  id: number | null;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}

const EMPTY_FORM: RoleFormState = { id: null, name: '', description: '', permissions: {} };

function RolesAdminPageContent() {
  const canManage = useCan('canManageRoles');
  const queryClient = useQueryClient();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<RoleFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

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
    setForm(EMPTY_FORM);
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
      <PageHeader
        title="Roles"
        description="Create roles and choose exactly what each one can do. Changes apply to everyone holding the role on their next request."
      />

      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button icon={PlusIcon} onClick={openCreate}>
            New role
          </Button>
        </div>
      )}

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
                  <Td className="text-slate-600">{role.userCount ?? 0}</Td>
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

export default function RolesAdminPage() {
  return (
    <RequirePermission permission="canViewRoles">
      <RolesAdminPageContent />
    </RequirePermission>
  );
}
