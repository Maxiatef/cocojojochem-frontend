'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { Paginated, UserDetail, UserListItem, UserRole } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
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
} from '@/components/ui';
import { EditIcon, EyeIcon, PlusIcon } from '@/components/icons';
import { EMPTY_STAFF_FORM, StaffFormState, StaffModal } from '@/components/admin/StaffModal';
import { OrderDetailCard } from '@/components/admin/OrderDetailCard';
import { StatusCard } from '@/components/admin/StatusCard';

interface UserAdminStats {
  total: number;
  customers: number;
  sales: number;
  admins: number;
}

export default function UsersAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [error, setError] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', limit: '200' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      return api.get<Paginated<UserListItem>>(`/users?${params.toString()}`);
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: () => api.get<UserAdminStats>('/users/admin/stats'),
  });

  function toggleRoleFilter(role: UserRole) {
    setRoleFilter((prev) => (prev === role ? '' : role));
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: invalidate,
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
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatusCard label="Total" value={stats.total} active={!roleFilter} onClick={() => setRoleFilter('')} />
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
                <Th>Joined</Th>
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
                    </Td>
                    <Td className="text-slate-600">{u.company?.name ?? '—'}</Td>
                    <Td className="text-slate-600">
                      {u.orderCount} order{u.orderCount === 1 ? '' : 's'}
                      <span className="block text-xs text-slate-400">${u.totalSpent.toFixed(2)} spent</span>
                    </Td>
                    <Td className="text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</Td>
                    <Td align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton icon={EyeIcon} label={`View ${u.fullName}`} onClick={() => setViewingId(u.id)} />
                        <Link href={`/admin/users/${u.id}/edit`}>
                          <IconButton icon={EditIcon} label={`Edit ${u.fullName}`} />
                        </Link>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

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
        </div>
      )}
    </Modal>
  );
}
