'use client';

import { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Role, TeamOption } from '@/lib/types';
import { Button, Modal, SelectField, TextField } from '@/components/ui';

export interface StaffFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  /** Role id as a string so it can back a <select>; '' means none chosen. */
  roleId: string;
  teamId: string;
}

export const EMPTY_STAFF_FORM: StaffFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  roleId: '',
  teamId: '',
};

export function StaffModal({
  open,
  form,
  setForm,
  error,
  saving,
  onSubmit,
  onClose,
}: {
  open: boolean;
  form: StaffFormState;
  setForm: (f: StaffFormState) => void;
  error: string | null;
  saving: boolean;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  const { data: roles } = useQuery({
    // The picker list, not the full roles resource: /roles needs canViewRoles,
    // which an account granted only canManageUserRoles does not have — it saw
    // an empty dropdown and could never assign anything.
    queryKey: ['admin-role-options'],
    queryFn: () => api.get<Role[]>('/roles/options'),
    enabled: open,
  });

  // Same reasoning as the role picker: /teams needs canViewTeams, which an
  // account that may only create staff does not have. /teams/options is the
  // thin list that canCreateUser also opens.
  const { data: teams } = useQuery({
    queryKey: ['admin-team-options'],
    queryFn: () => api.get<TeamOption[]>('/teams/options'),
    enabled: open,
  });

  return (
    <Modal open={open} onClose={onClose} title="Add Staff Account">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label="Full Name"
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          minLength={8}
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <SelectField
          label="Role"
          required
          value={form.roleId}
          onChange={(e) => setForm({ ...form, roleId: e.target.value })}
        >
          <option value="">Select a role…</option>
          {roles?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Team"
          value={form.teamId}
          onChange={(e) => setForm({ ...form, teamId: e.target.value })}
        >
          <option value="">No team</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </SelectField>

        {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Create Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
