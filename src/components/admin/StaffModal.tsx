'use client';

import { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Role } from '@/lib/types';
import { Button, Modal, SelectField, TextField } from '@/components/ui';

export interface StaffFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  /** Role id as a string so it can back a <select>; '' means none chosen. */
  roleId: string;
}

export const EMPTY_STAFF_FORM: StaffFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  roleId: '',
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
    queryKey: ['admin-roles'],
    queryFn: () => api.get<Role[]>('/roles'),
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
