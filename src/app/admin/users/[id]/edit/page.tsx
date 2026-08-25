'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { Company, UserDetail, UserRole } from '@/lib/types';
import {
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  SelectField,
  StatCard,
  TextField,
  useToast,
} from '@/components/ui';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['admin-user-detail', params.id],
    queryFn: () => api.get<UserDetail>(`/users/${params.id}/detail`),
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<Company[]>('/companies'),
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [companyId, setCompanyId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role);
    setCompanyId(user.companyId != null ? String(user.companyId) : '');
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.patch(`/users/${params.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', params.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User details saved.');
      setFormError(null);
    },
    onError: (err) => setFormError(getFriendlyErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: (body: { newPassword: string }) => api.patch(`/users/${params.id}/password`, body),
    onSuccess: () => {
      toast.success('Password updated.');
      setPasswordError(null);
      setNewPassword('');
    },
    onError: (err) => setPasswordError(getFriendlyErrorMessage(err)),
  });

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    saveMutation.mutate({
      fullName,
      email,
      phone: phone || null,
      role,
      companyId: companyId ? Number(companyId) : null,
    });
  }

  function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    passwordMutation.mutate({ newPassword });
  }

  return (
    <RequireAdmin>
      <PageHeader title="Edit User" description="Update account details, role, and password." />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this user." />}

      {user && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Account Details</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <TextField label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <SelectField label="Role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="SALES">Sales</option>
                  <option value="ADMIN">Admin</option>
                </SelectField>
                <SelectField label="Company" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                  <option value="">No company</option>
                  {companies?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>

                {formError && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{formError}</div>}

                <div className="flex justify-end pt-2">
                  <Button type="submit" loading={saveMutation.isPending}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Set New Password</h2>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <TextField
                  label="New Password"
                  type="password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {passwordError && (
                  <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{passwordError}</div>
                )}
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="secondary" loading={passwordMutation.isPending}>
                    Set Password
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-4">
            <StatCard label="Orders" value={user.orderCount} />
            <StatCard label="Total Spent" value={`$${user.totalSpent.toFixed(2)}`} accent="amber" />
            <StatCard
              label="Last Order"
              value={user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : '—'}
              accent="slate"
            />
          </div>
        </div>
      )}
    </RequireAdmin>
  );
}
