'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { Paginated, UserListItem, UserRole } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  PageHeader,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { EditIcon, PlusIcon } from '@/components/icons';
import { EMPTY_STAFF_FORM, StaffFormState, StaffModal } from '@/components/admin/StaffModal';

export default function UsersAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', limit: '200' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      return api.get<Paginated<UserListItem>>(`/users?${params.toString()}`);
    },
  });

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
                      <Link href={`/admin/users/${u.id}/edit`}>
                        <IconButton icon={EditIcon} label={`Edit ${u.fullName}`} />
                      </Link>
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
      </div>
    </RequireAdmin>
  );
}

