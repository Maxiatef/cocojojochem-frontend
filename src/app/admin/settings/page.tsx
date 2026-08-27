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

type Tab = 'general' | 'company' | 'shipping' | 'tax' | 'emails' | 'integrations' | 'staff';

// Site-settings is a generic key/value store on the backend — these are the
// keys this admin UI has adopted for the fields the plan calls for.
const KEYS = {
  siteName: 'siteName',
  contactEmail: 'contactEmail',
  supportPhone: 'supportPhone',
  taxName: 'tax.name',
  taxValue: 'tax.value',
  wholesaleMinimum: 'WHOLESALE_MINIMUM',
  freeShippingThreshold: 'FREE_SHIPPING_THRESHOLD',
  quoteNotificationEmail: 'quoteNotificationEmail',
  senderName: 'senderName',
  senderEmail: 'senderEmail',
  warehouseName: 'warehouseName',
  warehousePhone: 'warehousePhone',
  warehouseStreet: 'warehouseStreet',
  warehouseCity: 'warehouseCity',
  warehouseState: 'warehouseState',
  warehouseZip: 'warehouseZip',
  warehouseCountry: 'warehouseCountry',
};

const TABS: [Tab, string][] = [
  ['general', 'General'],
  ['company', 'Company & Warehouse'],
  ['shipping', 'Wholesale & Shipping'],
  ['tax', 'Tax'],
  ['emails', 'Emails'],
  ['integrations', 'Integrations'],
  ['staff', 'Staff'],
];

export default function SettingsAdminPage() {
  const [tab, setTab] = useState<Tab>('general');

  return (
    <RequireAdmin>
      <div>
        <PageHeader
          title="Settings"
          description="Site configuration, company details, shipping, tax, emails, integrations, and staff."
        />

        <div className="mb-6 flex flex-wrap gap-x-1 gap-y-2 border-b border-slate-200">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
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
        {tab === 'company' && <CompanyTab />}
        {tab === 'shipping' && <ShippingTab />}
        {tab === 'tax' && <TaxTab />}
        {tab === 'emails' && <EmailsTab />}
        {tab === 'integrations' && <IntegrationsTab />}
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

function CompanyTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSiteSettings();
  const [warehouseName, setWarehouseName] = useState('');
  const [warehousePhone, setWarehousePhone] = useState('');
  const [warehouseStreet, setWarehouseStreet] = useState('');
  const [warehouseCity, setWarehouseCity] = useState('');
  const [warehouseState, setWarehouseState] = useState('');
  const [warehouseZip, setWarehouseZip] = useState('');
  const [warehouseCountry, setWarehouseCountry] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setWarehouseName(data.settings[KEYS.warehouseName] || '');
    setWarehousePhone(data.settings[KEYS.warehousePhone] || '');
    setWarehouseStreet(data.settings[KEYS.warehouseStreet] || '');
    setWarehouseCity(data.settings[KEYS.warehouseCity] || '');
    setWarehouseState(data.settings[KEYS.warehouseState] || '');
    setWarehouseZip(data.settings[KEYS.warehouseZip] || '');
    setWarehouseCountry(data.settings[KEYS.warehouseCountry] || '');
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
      [KEYS.warehouseName]: warehouseName,
      [KEYS.warehousePhone]: warehousePhone,
      [KEYS.warehouseStreet]: warehouseStreet,
      [KEYS.warehouseCity]: warehouseCity,
      [KEYS.warehouseState]: warehouseState,
      [KEYS.warehouseZip]: warehouseZip,
      [KEYS.warehouseCountry]: warehouseCountry,
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load company settings." />;

  return (
    <Card className="max-w-lg p-6">
      <p className="mb-4 text-xs text-slate-500">
        The warehouse/ship-from address used on every ShipStation shipment. Leave a field blank to fall back
        to the server default.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Warehouse Name" placeholder="CocoJojo Warehouse" value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} />
        <TextField label="Phone" placeholder="555-123-4567" value={warehousePhone} onChange={(e) => setWarehousePhone(e.target.value)} />
        <TextField label="Street Address" placeholder="123 Warehouse St" value={warehouseStreet} onChange={(e) => setWarehouseStreet(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="City" placeholder="Los Angeles" value={warehouseCity} onChange={(e) => setWarehouseCity(e.target.value)} />
          <TextField label="State" placeholder="CA" value={warehouseState} onChange={(e) => setWarehouseState(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="ZIP Code" placeholder="90001" value={warehouseZip} onChange={(e) => setWarehouseZip(e.target.value)} />
          <TextField label="Country" placeholder="US" value={warehouseCountry} onChange={(e) => setWarehouseCountry(e.target.value)} />
        </div>
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
      <div className="mb-4 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
        Informational only for now — this rate isn&apos;t applied to order totals yet, so changing it won&apos;t
        affect checkout calculations.
      </div>
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

function ShippingTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSiteSettings();
  const [wholesaleMinimum, setWholesaleMinimum] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setWholesaleMinimum(data.settings[KEYS.wholesaleMinimum] || '');
    setFreeShippingThreshold(data.settings[KEYS.freeShippingThreshold] || '');
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
      [KEYS.wholesaleMinimum]: wholesaleMinimum,
      [KEYS.freeShippingThreshold]: freeShippingThreshold,
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load shipping settings." />;

  return (
    <Card className="max-w-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Wholesale Minimum ($)"
          type="number"
          step="0.01"
          placeholder="250"
          value={wholesaleMinimum}
          onChange={(e) => setWholesaleMinimum(e.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-500">
          Minimum order subtotal required to check out. Defaults to $250 if left blank.
        </p>
        <TextField
          label="Free Shipping Threshold ($)"
          type="number"
          step="0.01"
          placeholder="85"
          value={freeShippingThreshold}
          onChange={(e) => setFreeShippingThreshold(e.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-500">
          Domestic (US) order subtotal that qualifies for free shipping. Defaults to $85 if left blank.
        </p>
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

function EmailsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSiteSettings();
  const [quoteNotificationEmail, setQuoteNotificationEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setQuoteNotificationEmail(data.settings[KEYS.quoteNotificationEmail] || '');
    setSenderName(data.settings[KEYS.senderName] || '');
    setSenderEmail(data.settings[KEYS.senderEmail] || '');
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
      [KEYS.quoteNotificationEmail]: quoteNotificationEmail,
      [KEYS.senderName]: senderName,
      [KEYS.senderEmail]: senderEmail,
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load email settings." />;

  return (
    <Card className="max-w-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Quote Request Notification Email"
          type="email"
          placeholder="sales@cocojojochem.com"
          value={quoteNotificationEmail}
          onChange={(e) => setQuoteNotificationEmail(e.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-500">
          Where new quote, sample, white-label, and contact requests are sent. Defaults to
          sales@cocojojochem.com if left blank.
        </p>
        <TextField
          label="Sender Name"
          placeholder="CocoJojoChem"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
        <TextField
          label="Sender Email"
          type="email"
          placeholder="noreply@cocojojochem.com"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-500">
          The &quot;from&quot; identity on outgoing transactional emails. Must be a sender verified in your
          Brevo account, or delivery will fail.
        </p>
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

function IntegrationsTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['site-settings-integrations-status'],
    queryFn: () => api.get<{ stripe: boolean; shipstation: boolean; brevo: boolean; shippo: boolean }>(
      '/site-settings/integrations-status',
    ),
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState message="Couldn't load integration status." />;

  const rows: { key: keyof typeof data; label: string; description: string }[] = [
    { key: 'stripe', label: 'Stripe', description: 'Checkout payments and webhooks.' },
    { key: 'shipstation', label: 'ShipStation', description: 'Shipment creation and tracking.' },
    { key: 'brevo', label: 'Brevo', description: 'Transactional emails (orders, quotes, password reset).' },
    { key: 'shippo', label: 'Shippo', description: 'International shipping rate estimates.' },
  ];

  return (
    <Card className="max-w-lg p-6">
      <p className="mb-4 text-xs text-slate-500">
        API keys are managed via server environment variables, not this page, for security — this just shows
        whether each one is currently set.
      </p>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{row.label}</p>
              <p className="text-xs text-slate-500">{row.description}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                data[row.key] ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {data[row.key] ? 'Configured' : 'Not configured'}
            </span>
          </div>
        ))}
      </div>
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
