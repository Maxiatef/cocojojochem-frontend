'use client';

import { FormEvent } from 'react';
import { Button, Modal, SelectField, TextField } from '@/components/ui';

export interface StaffFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'ADMIN' | 'SALES';
}

export const EMPTY_STAFF_FORM: StaffFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'SALES',
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
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as 'ADMIN' | 'SALES' })}
        >
          <option value="SALES">Sales</option>
          <option value="ADMIN">Admin</option>
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
