'use client';

import { Fragment, FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { Paginated, ShippingRateTierRow, SiteSettingsResponse, UserListItem } from '@/lib/types';
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
  useToast,
} from '@/components/ui';
import { PlusIcon } from '@/components/icons';
import { EMPTY_STAFF_FORM, StaffFormState, StaffModal } from '@/components/admin/StaffModal';

type Tab = 'shipping' | 'tax' | 'notifications' | 'staff';

// Site-settings is a generic key/value store on the backend — these are the
// keys this admin UI has adopted for the fields the plan calls for.
const KEYS = {
  taxName: 'tax.name',
  taxValue: 'tax.value',
  wholesaleMinimum: 'WHOLESALE_MINIMUM',
  freeShippingThreshold: 'FREE_SHIPPING_THRESHOLD',
  defaultShippingAmount: 'DEFAULT_SHIPPING_AMOUNT',
  internationalShippingAmount: 'INTERNATIONAL_SHIPPING_AMOUNT',
  quoteNotificationEnabled: 'quoteNotificationEnabled',
  quoteNotificationEmail: 'quoteNotificationEmail',
  newOrderNotificationEnabled: 'newOrderNotificationEnabled',
  newOrderNotificationEmail: 'newOrderNotificationEmail',
  contactMessageNotificationEnabled: 'contactMessageNotificationEnabled',
  contactMessageNotificationEmail: 'contactMessageNotificationEmail',
  senderName: 'senderName',
  senderEmail: 'senderEmail',
};

const TABS: [Tab, string][] = [
  ['shipping', 'Wholesale & Shipping'],
  ['tax', 'Tax'],
  ['notifications', 'Notifications'],
  ['staff', 'Staff'],
];

export default function SettingsAdminPage() {
  const [tab, setTab] = useState<Tab>('shipping');

  return (
    <RequireAdmin>
      <div>
        <PageHeader
          title="Settings"
          description="Wholesale, shipping, tax, notifications, and staff."
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

        {tab === 'shipping' && (
          <div className="space-y-6">
            <ShippingTab />
            <ZoneAssignmentsCard />
            <ShippingZoneRateTable
              kind="WEIGHT"
              title="Shipping Rates — Weight Table"
              description="Editable. Domestic shipping for regular (non-drum) items is priced from this Zone 1-7 x weight table. Click a cell to edit — it saves automatically when you click away. A cart weight between two rows uses the next row up."
              rowLabel={(lb) => `${lb} lb`}
            />
            <ShippingZoneRateTable
              kind="DRUM"
              title="Shipping Rates — Drum Table"
              description={'Editable. Used instead of the weight table for any product variant marked "Sold by drum" in the product editor — cart quantity of that variant is treated as a drum count.'}
              rowLabel={(n) => `${n} drum${n === 1 ? '' : 's'}`}
            />
          </div>
        )}
        {tab === 'tax' && <TaxTab />}
        {tab === 'notifications' && <NotificationsTab />}
        {tab === 'staff' && <StaffTab />}
      </div>
    </RequireAdmin>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? 'bg-brand-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </label>
  );
}

function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<SiteSettingsResponse>('/site-settings'),
  });
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
  const [defaultShippingAmount, setDefaultShippingAmount] = useState('');
  const [internationalShippingAmount, setInternationalShippingAmount] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setWholesaleMinimum(data.settings[KEYS.wholesaleMinimum] || '');
    setFreeShippingThreshold(data.settings[KEYS.freeShippingThreshold] || '');
    setDefaultShippingAmount(data.settings[KEYS.defaultShippingAmount] || '');
    setInternationalShippingAmount(data.settings[KEYS.internationalShippingAmount] || '');
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
      [KEYS.defaultShippingAmount]: defaultShippingAmount,
      [KEYS.internationalShippingAmount]: internationalShippingAmount,
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
          Order subtotal that qualifies for free shipping — domestic or international. Defaults to $85 if
          left blank.
        </p>
        <TextField
          label="Default Shipping Amount ($)"
          type="number"
          step="0.01"
          placeholder="0"
          value={defaultShippingAmount}
          onChange={(e) => setDefaultShippingAmount(e.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-500">
          Domestic shipping is priced automatically from the Zone 1-7 rate table based on cart weight and
          destination state. This amount is only a last-resort fallback — used only for a US territory/code
          with no zone mapping and no explicit rate set below. Defaults to $0 if left blank.
        </p>
        <TextField
          label="International Shipping Amount ($)"
          type="number"
          step="0.01"
          placeholder="0"
          value={internationalShippingAmount}
          onChange={(e) => setInternationalShippingAmount(e.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-500">
          Flat rate charged on every non-US order, regardless of country or weight. Defaults to $0 if left
          blank.
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

// One row per internal notification email — every one of these follows the
// same shape on the backend: an `<x>Enabled` toggle (unset = enabled, only
// an explicit "false" turns it off) and an `<x>Email` recipient with no
// hardcoded fallback, so nothing sends until an admin sets an address here.
const NOTIFICATIONS: {
  key: string;
  enabledKey: string;
  emailKey: string;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    key: 'newOrder',
    enabledKey: KEYS.newOrderNotificationEnabled,
    emailKey: KEYS.newOrderNotificationEmail,
    label: 'New Order Notifications',
    description: 'Sent every time a new order is paid for.',
    placeholder: 'e.g. sales@yourcompany.com',
  },
  {
    key: 'quoteRequest',
    enabledKey: KEYS.quoteNotificationEnabled,
    emailKey: KEYS.quoteNotificationEmail,
    label: 'Quote & Sample Request Notifications',
    description: 'Sent when a customer submits a quote, sample, or white-label request.',
    placeholder: 'e.g. sales@yourcompany.com',
  },
  {
    key: 'contactMessage',
    enabledKey: KEYS.contactMessageNotificationEnabled,
    emailKey: KEYS.contactMessageNotificationEmail,
    label: 'Contact Us Message Notifications',
    description: 'Sent when a customer submits the Contact Us form.',
    placeholder: 'e.g. support@yourcompany.com',
  },
];

function NotificationsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSiteSettings();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    const nextEnabled: Record<string, boolean> = {};
    const nextEmails: Record<string, string> = {};
    for (const n of NOTIFICATIONS) {
      nextEnabled[n.key] = data.settings[n.enabledKey] !== 'false';
      nextEmails[n.key] = data.settings[n.emailKey] || '';
    }
    setEnabled(nextEnabled);
    setEmails(nextEmails);
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
    for (const n of NOTIFICATIONS) {
      if (enabled[n.key] && !emails[n.key]?.trim()) {
        setError(`Set a recipient email before enabling "${n.label}".`);
        return;
      }
    }
    const body: Record<string, string> = {
      [KEYS.senderName]: senderName,
      [KEYS.senderEmail]: senderEmail,
    };
    for (const n of NOTIFICATIONS) {
      body[n.enabledKey] = String(enabled[n.key]);
      body[n.emailKey] = emails[n.key] || '';
    }
    mutation.mutate(body);
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Couldn't load email settings." />;

  return (
    <Card className="max-w-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Internal Notifications</p>
        {NOTIFICATIONS.map((n) => (
          <div key={n.key} className="rounded-lg border border-slate-200 p-4">
            <ToggleSwitch
              checked={!!enabled[n.key]}
              onChange={(checked) => setEnabled((prev) => ({ ...prev, [n.key]: checked }))}
              label={n.label}
              description={`${n.description} Turn off to stop these emails at any time.`}
            />
            {enabled[n.key] && (
              <div className="mt-4">
                <TextField
                  label="Notification Email"
                  type="email"
                  placeholder={n.placeholder}
                  value={emails[n.key] || ''}
                  onChange={(e) => setEmails((prev) => ({ ...prev, [n.key]: e.target.value }))}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Required while this is enabled — no default is built in, so nothing is sent until you set an
                  address here.
                </p>
              </div>
            )}
          </div>
        ))}

        <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sender Identity</p>
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
          The &quot;from&quot; identity on all outgoing transactional emails. Must be a sender verified in your
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

// --- Shipping Zone Rate Tables --------------------------------------------------
//
// One editable table per rate kind (WEIGHT, DRUM) — Zone 1-7 columns x
// breakpoint rows, each cell a dollar input that auto-saves on blur. This
// IS the admin override: there's no separate per-state list anymore, since
// every state's zone assignment is fixed (see the zone assignments card
// below) and only the $ amounts are meant to change. Editing a cell changes
// the rate for every state in that zone at once.

function ZoneAssignmentsCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shipping-zone-assignments'],
    queryFn: () => api.get<{ zones: { zone: number; states: { code: string; name: string }[] }[] }>(
      '/orders/admin/shipping-reference',
    ),
  });

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">Zone Assignments</h2>
        <p className="text-xs text-slate-500">
          Fixed — which states fall in each zone isn&apos;t editable here. Edit the $ amounts in the tables
          below instead; every state in a zone shares that zone&apos;s rate.
        </p>
      </div>
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load zone assignments." />}
      {data && (
        <Card className="divide-y divide-slate-100">
          {data.zones.map((group) => (
            <div key={group.zone} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
              <div className="w-16 shrink-0 text-sm font-semibold text-slate-900">Zone {group.zone}</div>
              <div className="text-xs leading-relaxed text-slate-600">
                {group.states.map((s) => s.code).join(', ')}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function ShippingZoneRateTable({
  kind,
  title,
  description,
  rowLabel,
}: {
  kind: 'WEIGHT' | 'DRUM';
  title: string;
  description: string;
  rowLabel: (breakpoint: number) => string;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const queryKey = ['shipping-rate-tiers', kind];
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => api.get<ShippingRateTierRow[]>(`/admin/shipping-rate-tiers?kind=${kind}`),
  });

  const saveMutation = useMutation({
    mutationFn: ({ zone, breakpoint, amount }: { zone: number; breakpoint: number; amount: number }) =>
      api.put(`/admin/shipping-rate-tiers/${kind}/${zone}/${breakpoint}`, { amount }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey });
      setSavingKey(null);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[`${vars.breakpoint}-${vars.zone}`];
        return next;
      });
      toast.success(`${rowLabel(vars.breakpoint)} / Zone ${vars.zone} updated to $${vars.amount.toFixed(2)}.`);
    },
    onError: (err) => {
      setSavingKey(null);
      setError(getFriendlyErrorMessage(err));
      toast.error("Couldn't save that rate — try again.");
    },
  });

  function handleBlur(breakpoint: number, zone: number, currentValue: number | null) {
    const key = `${breakpoint}-${zone}`;
    const draft = drafts[key];
    if (draft === undefined) return; // untouched — nothing to save
    const amount = Number(draft);
    if (draft === '' || !Number.isFinite(amount) || amount < 0) {
      setError(`Enter a valid non-negative amount for ${rowLabel(breakpoint)} / Zone ${zone}.`);
      return;
    }
    if (currentValue != null && amount === currentValue) {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }
    setError(null);
    setSavingKey(key);
    saveMutation.mutate({ zone, breakpoint, amount });
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      {error && <div className="mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load the rate table." />}

      {data && (
        <Card>
          <div className="max-h-[520px] overflow-auto">
            <Table minWidth={680}>
              <TableHead>
                <Th>{kind === 'WEIGHT' ? 'Weight' : 'Drums'}</Th>
                <Th>Zone 1</Th>
                <Th>Zone 2</Th>
                <Th>Zone 3</Th>
                <Th>Zone 4</Th>
                <Th>Zone 5</Th>
                <Th>Zone 6</Th>
                <Th>Zone 7</Th>
              </TableHead>
              <tbody>
                {data.map((row) => (
                  <Tr key={row.breakpoint}>
                    <Td className="font-medium text-slate-900">{rowLabel(row.breakpoint)}</Td>
                    {row.rates.map((rate, i) => {
                      const zone = i + 1;
                      const key = `${row.breakpoint}-${zone}`;
                      const draftValue = drafts[key] ?? (rate != null ? String(rate) : '');
                      const cellSaving = savingKey === key && saveMutation.isPending;
                      return (
                        <Td key={zone}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={draftValue}
                            disabled={cellSaving}
                            onChange={(e) => setDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                            onBlur={() => handleBlur(row.breakpoint, zone, rate)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur();
                            }}
                            className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand-500 disabled:opacity-50"
                          />
                        </Td>
                      );
                    })}
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

