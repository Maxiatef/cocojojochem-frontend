'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { Paginated, SiteSettingsResponse, UserListItem } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  Table,
  TableHead,
  Td,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { PlusIcon } from '@/components/icons';
import { EMPTY_STAFF_FORM, StaffFormState, StaffModal } from '@/components/admin/StaffModal';

type Tab = 'general' | 'tax' | 'staff';

// Site-settings is a generic key/value store on the backend — these are the
// keys this admin UI has adopted for the fields the plan calls for.
const KEYS = {
  siteName: 'siteName',
  contactEmail: 'contactEmail',
  supportPhone: 'supportPhone',
  taxName: 'tax.name',
  taxValue: 'tax.value',
};

export default function SettingsAdminPage() {
  const [tab, setTab] = useState<Tab>('general');

  return (
    <RequireAdmin>
      <div>
        <PageHeader title="Settings" description="Site configuration, tax rate, and staff management." />

        <div className="mb-6 flex gap-1 border-b border-slate-200">
          {(
            [
              ['general', 'General'],
              ['tax', 'Tax Rate'],
              ['staff', 'Staff Management'],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'general' && <GeneralTab />}
        {tab === 'tax' && <TaxTab />}
        {tab === 'staff' && <StaffTab />}
      </div>
    </RequireAdmin>
  );
}

function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<SiteSettingsResponse>('/site-settings'),
  });
}

function GeneralTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSiteSettings();
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setSiteName(data.settings[KEYS.siteName] || '');
    setContactEmail(data.settings[KEYS.contactEmail] || '');
    setSupportPhone(data.settings[KEYS.supportPhone] || '');
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: Record<string, string>) => api.patch<SiteSettingsResponse>('/site-settings', body),
    onSuccess: (res) => {
      queryClient.setQueryData(['site-settings'], res);
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({
      [KEYS.siteName]: siteName,
      [KEYS.contactEmail]: contactEmail,
      [KEYS.supportPhone]: supportPhone,
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load site settings." />;

  return (
    <Card className="max-w-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Site Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
        <TextField
          label="Contact Email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <TextField
          label="Support Phone"
          value={supportPhone}
          onChange={(e) => setSupportPhone(e.target.value)}
        />
        {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
        {saved && <div className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">Saved.</div>}
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function TaxTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSiteSettings();
  const [taxName, setTaxName] = useState('');
  const [taxValue, setTaxValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setTaxName(data.settings[KEYS.taxName] || '');
    setTaxValue(data.settings[KEYS.taxValue] || '');
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: Record<string, string>) => api.patch<SiteSettingsResponse>('/site-settings', body),
    onSuccess: (res) => {
      queryClient.setQueryData(['site-settings'], res);
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({
      [KEYS.taxName]: taxName,
      [KEYS.taxValue]: taxValue,
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load tax settings." />;

  return (
    <Card className="max-w-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Tax Name"
          placeholder="e.g. Sales Tax"
          value={taxName}
          onChange={(e) => setTaxName(e.target.value)}
        />
        <TextField
          label="Tax Rate (%)"
          type="number"
          step="0.01"
          value={taxValue}
          onChange={(e) => setTaxValue(e.target.value)}
        />
        {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
        {saved && <div className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">Saved.</div>}
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function StaffTab() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', '', 'ADMIN,SALES'],
    queryFn: () => api.get<Paginated<UserListItem>>('/users?page=1&limit=200&role=ADMIN,SALES'),
  });

  const createStaffMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/users', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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

  const staff = data?.data || [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Staff Accounts</h2>
          <p className="text-xs text-slate-500">Admin and sales users with dashboard access.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={PlusIcon} size="sm">
          Add Staff Account
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load staff accounts." />}

      {!isLoading && staff.length > 0 && (
        <Card>
          <Table minWidth={560}>
            <TableHead>
              <Th>Name / Email</Th>
              <Th>Role</Th>
              <Th>Joined</Th>
            </TableHead>
            <tbody>
              {staff.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <div className="font-medium text-slate-900">{u.fullName}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </Td>
                  <Td>
                    <Badge status={u.role} />
                  </Td>
                  <Td className="text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</Td>
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
  );
}
