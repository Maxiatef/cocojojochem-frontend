'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RecordHistory } from '@/components/admin/RecordHistory';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { Paginated, UserDetail, UserListItem, UserRole } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
  useToast,
} from '@/components/ui';
import { EditIcon, EyeIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { EMPTY_STAFF_FORM, StaffFormState, StaffModal } from '@/components/admin/StaffModal';
import { OrderDetailCard } from '@/components/admin/OrderDetailCard';
import { StatusCard } from '@/components/admin/StatusCard';

interface UserAdminStats {
  total: number;
  customers: number;
  sales: number;
  admins: number;
  deleted: number;
}

// Which lifecycle action a confirm dialog is currently asking about. One
// dialog driven by this beats three near-identical ConfirmDialogs.
type PendingAction = { action: 'soft' | 'restore' | 'purge'; user: UserListItem };

export default function UsersAdminPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  // Status is a separate axis from role — folding it into roleFilter would
  // break the moment anyone wants "deleted customers only", and the tiles
  // would fight over one piece of state.
  const [statusFilter, setStatusFilter] = useState<'' | 'DELETED'>('');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [error, setError] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search, roleFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', limit: '200' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      return api.get<Paginated<UserListItem>>(`/users?${params.toString()}`);
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: () => api.get<UserAdminStats>('/users/admin/stats'),
  });

  function toggleRoleFilter(role: UserRole) {
    setRoleFilter((prev) => (prev === role ? '' : role));
    setStatusFilter('');
  }

  // Also refreshes the stat tiles — the list-only invalidation left the
  // counts stale immediately after every delete/restore.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users-stats'] });
  };

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: invalidate,
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => api.delete<{ revokedSessions: number }>(`/users/${id}`),
    onSuccess: (res) => {
      invalidate();
      setPending(null);
      const revoked = res?.revokedSessions ?? 0;
      toast.success(
        revoked > 0
          ? `Moved to Recycle Bin. Signed out of ${revoked} active session${revoked === 1 ? '' : 's'}.`
          : 'Moved to Recycle Bin.',
      );
    },
    onError: (err) => {
      setPending(null);
      toast.error(getFriendlyErrorMessage(err));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/users/${id}/restore`, {}),
    onSuccess: () => {
      invalidate();
      setPending(null);
      toast.success('Account restored. They can sign in again.');
    },
    onError: (err) => {
      setPending(null);
      toast.error(getFriendlyErrorMessage(err));
    },
  });

  const purgeMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete<{ detachedOrders: number; detachedQuoteRequests: number }>(`/users/${id}/permanent`),
    onSuccess: (res) => {
      invalidate();
      setPending(null);
      const kept = res?.detachedOrders ?? 0;
      toast.success(
        kept > 0
          ? `Account permanently deleted. ${kept} order${kept === 1 ? '' : 's'} kept as guest order${kept === 1 ? '' : 's'}.`
          : 'Account permanently deleted.',
      );
    },
    onError: (err) => {
      setPending(null);
      toast.error(getFriendlyErrorMessage(err));
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/users', body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  function closeModal() {
    setModalOpen(false);
    setForm(EMPTY_STAFF_FORM);
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    createStaffMutation.mutate({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      role: form.role,
    });
  }

  const users = data?.data || [];
  const inBin = statusFilter === 'DELETED';

  return (
    <RequireAdmin>
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <PageHeader title="Users" description="Manage customer, sales, and admin accounts." />
          <Button onClick={() => setModalOpen(true)} icon={PlusIcon}>
            Add Staff Account
          </Button>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatusCard
              label="Total"
              value={stats.total}
              active={!roleFilter && !statusFilter}
              onClick={() => {
                setRoleFilter('');
                setStatusFilter('');
              }}
            />
            <StatusCard
              label="Customers"
              value={stats.customers}
              tone="green"
              active={roleFilter === 'CUSTOMER'}
              onClick={() => toggleRoleFilter('CUSTOMER')}
            />
            <StatusCard
              label="Sales"
              value={stats.sales}
              tone="amber"
              active={roleFilter === 'SALES'}
              onClick={() => toggleRoleFilter('SALES')}
            />
            <StatusCard
              label="Admins"
              value={stats.admins}
              tone="brand"
              active={roleFilter === 'ADMIN'}
              onClick={() => toggleRoleFilter('ADMIN')}
            />
            <StatusCard
              label="Recycle Bin"
              value={stats.deleted}
              tone="red"
              active={statusFilter === 'DELETED'}
              onClick={() => {
                setStatusFilter((prev) => (prev === 'DELETED' ? '' : 'DELETED'));
                setRoleFilter('');
              }}
            />
          </div>
        )}

        {inBin && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            These accounts can&apos;t sign in. <strong className="font-semibold">Restore</strong> reactivates
            an account; <strong className="font-semibold">Delete forever</strong> removes it from the database
            for good — past orders are kept as guest orders. A recycled email address can&apos;t be used to
            register again until the account is restored or permanently deleted.
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SALES">Sales</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Couldn't load users." />}
        {!isLoading && !isError && users.length === 0 && <EmptyState message="No users found." />}

        {!isLoading && users.length > 0 && (
          <Card>
            <Table minWidth={860}>
              <TableHead>
                <Th>Name / Email</Th>
                <Th>Role</Th>
                <Th>Company</Th>
                <Th>Orders</Th>
                <Th>{inBin ? 'Deleted' : 'Joined'}</Th>
                <Th align="right">Actions</Th>
              </TableHead>
              <tbody>
                {users.map((u) => (
                  <Tr key={u.id}>
                    <Td>
                      <div className="font-medium text-slate-900">{u.fullName}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </Td>
                    <Td>
                      {/* Changing a recycled user's role is meaningless, and
                          the PATCH would succeed — so the bin shows the role
                          read-only. */}
                      {inBin ? (
                        <Badge status={u.role} />
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as UserRole })}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="SALES">SALES</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <Badge status={u.role} />
                        </div>
                      )}
                    </Td>
                    <Td className="text-slate-600">{u.company?.name ?? '—'}</Td>
                    <Td className="text-slate-600">
                      {u.orderCount} order{u.orderCount === 1 ? '' : 's'}
                      <span className="block text-xs text-slate-400">${u.totalSpent.toFixed(2)} spent</span>
                    </Td>
                    <Td className="text-slate-500">
                      {inBin
                        ? u.deletedAt
                          ? new Date(u.deletedAt).toLocaleDateString()
                          : '—'
                        : new Date(u.createdAt).toLocaleDateString()}
                    </Td>
                    <Td align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton icon={EyeIcon} label={`View ${u.fullName}`} onClick={() => setViewingId(u.id)} />
                        {inBin ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPending({ action: 'restore', user: u })}
                            >
                              Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setPending({ action: 'purge', user: u })}
                            >
                              Delete forever
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link href={`/admin/users/${u.id}/edit`}>
                              <IconButton icon={EditIcon} label={`Edit ${u.fullName}`} />
                            </Link>
                            {/* Admin accounts aren't deletable server-side, so
                                don't offer an action that would 403. The
                                role-change workaround is otherwise
                                unguessable, hence the title text. */}
                            {u.role === 'ADMIN' ? (
                              <span
                                title="Admin accounts can't be deleted. Change the role to Sales or Customer first."
                                className="inline-flex h-8 w-8 items-center justify-center text-slate-300"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </span>
                            ) : (
                              <IconButton
                                icon={TrashIcon}
                                label={`Delete ${u.fullName}`}
                                variant="danger"
                                onClick={() => setPending({ action: 'soft', user: u })}
                              />
                            )}
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

        {/* One dialog for all three lifecycle actions — the copy and tone
            derive from `pending.action`, which beats three near-identical
            ConfirmDialogs drifting apart. */}
        <ConfirmDialog
          open={!!pending}
          title={
            pending?.action === 'restore'
              ? 'Restore user'
              : pending?.action === 'purge'
                ? 'Delete forever'
                : 'Move user to Recycle Bin'
          }
          message={
            pending?.action === 'restore'
              ? `${pending.user.fullName} will be able to log in again. They'll need to sign in from scratch — their previous sessions were revoked.`
              : pending?.action === 'purge'
                ? `This permanently removes ${pending.user.fullName} (${pending.user.email}) from the database, along with their cart, saved quote list and sessions. Any past orders are kept as guest orders so your sales records stay intact. This cannot be undone.`
                : pending
                  ? `${pending.user.fullName} (${pending.user.email}) will be signed out immediately and won't be able to log in. Their orders and quote history are kept. You can restore them from the Recycle Bin at any time.`
                  : ''
          }
          confirmLabel={
            pending?.action === 'restore'
              ? 'Restore'
              : pending?.action === 'purge'
                ? 'Delete forever'
                : 'Move to Recycle Bin'
          }
          danger={pending?.action !== 'restore'}
          loading={
            softDeleteMutation.isPending || restoreMutation.isPending || purgeMutation.isPending
          }
          onConfirm={() => {
            if (!pending) return;
            if (pending.action === 'soft') softDeleteMutation.mutate(pending.user.id);
            else if (pending.action === 'restore') restoreMutation.mutate(pending.user.id);
            else purgeMutation.mutate(pending.user.id);
          }}
          onCancel={() => setPending(null)}
        />

        <StaffModal
          open={modalOpen}
          form={form}
          setForm={setForm}
          error={error}
          saving={createStaffMutation.isPending}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />

        {viewingId != null && <UserDetailModal userId={viewingId} onClose={() => setViewingId(null)} />}
      </div>
    </RequireAdmin>
  );
}

function UserDetailModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => api.get<UserDetail>(`/users/${userId}/detail`),
  });

  return (
    <Modal open onClose={onClose} title={user ? user.fullName : 'User'} size="xl">
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this user." />}

      {user && (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Account</p>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</p>
                <p className="text-slate-900">{user.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
                <p className="text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p>
                <p className="text-slate-900">{user.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Role</p>
                <Badge status={user.role} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company</p>
                <p className="text-slate-900">{user.company?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Joined</p>
                <p className="text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Summary</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 px-4 py-3 text-center">
                <p className="text-lg font-semibold text-slate-900">{user.orderCount}</p>
                <p className="text-xs text-slate-500">Orders</p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-3 text-center">
                <p className="text-lg font-semibold text-slate-900">${user.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Total Spent</p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-3 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  {user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : '—'}
                </p>
                <p className="text-xs text-slate-500">Last Order</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Orders ({user.orders.length})
            </p>
            {user.orders.length === 0 ? (
              <p className="text-sm text-slate-400">No orders placed by this user yet.</p>
            ) : (
              <div className="space-y-3">
                {user.orders.map((o) => (
                  <OrderDetailCard key={o.id} order={o} />
                ))}
              </div>
            )}
          </div>

          {/* No card at all when there are zero quote requests. */}
          {user.quoteRequests.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Quote Requests ({user.quoteRequests.length})
              </p>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Items</th>
                      <th className="px-3 py-2 font-medium">Message</th>
                      <th className="px-3 py-2 font-medium">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.quoteRequests.map((qr) => (
                      <tr key={qr.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 text-slate-900">{qr.type.replace(/_/g, ' ')}</td>
                        <td className="px-3 py-2">
                          <Badge status={qr.status} />
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {qr.items.length > 0 ? qr.items.map((i) => i.productName).join(', ') : '—'}
                        </td>
                        <td className="px-3 py-2 max-w-xs truncate text-slate-600">{qr.message || '—'}</td>
                        <td className="px-3 py-2 text-slate-500">
                          {new Date(qr.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* This account's own trail — role changes, password resets,
              sign-ins and failed attempts. */}
          <div className="border-t border-slate-100 pt-5">
            <RecordHistory entityName="User" entityId={user.id} />
          </div>
        </div>
      )}
    </Modal>
  );
}
