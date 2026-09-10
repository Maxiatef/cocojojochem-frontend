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
import { ChevronDownIcon, PlusIcon } from '@/components/icons';
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

// Zone 8 is quoted manually — OrdersService.getShippingEstimate short-circuits
// on `zone === 8` and never reads the rate tables for it, so a rate stored
// against Zone 8 has no effect on any checkout. The UI reflects that by
// rendering the Zone 8 column read-only rather than offering inputs that are
// silently ignored.
const UNPRICED_ZONE = 8;

// A tint per zone, reused by both the assignments card and the rate-table
// column headers so a zone is recognisable by colour rather than by reading
// the number. Written out in full (not built by interpolation) because
// Tailwind only emits classes it can see literally in the source.
const ZONE_ACCENT: Record<number, string> = {
  1: 'bg-sky-50 text-sky-700 ring-sky-200',
  2: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  3: 'bg-teal-50 text-teal-700 ring-teal-200',
  4: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  5: 'bg-lime-50 text-lime-700 ring-lime-200',
  6: 'bg-amber-50 text-amber-700 ring-amber-200',
  7: 'bg-orange-50 text-orange-700 ring-orange-200',
  8: 'bg-slate-100 text-slate-500 ring-slate-300',
};

function ZoneChip({ zone }: { zone: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        ZONE_ACCENT[zone] || ZONE_ACCENT[8]
      }`}
    >
      Zone {zone}
    </span>
  );
}

// Long-form explanation, folded away by default. The numeric fields used to
// carry 40+ word grey paragraphs each, which buried the controls they were
// meant to describe.
function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-200 px-4 py-3 text-xs leading-relaxed text-slate-600">
          {children}
        </div>
      )}
    </div>
  );
}

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
              title="Weight Rates"
              description="Priced by cart weight and destination zone for regular (non-drum) items. A cart weight between two rows uses the next row up."
              rowLabel={(lb) => `${lb} lb`}
            />
            <ShippingZoneRateTable
              kind="DRUM"
              title="Drum Rates"
              description={'Used instead of the weight table for any variant marked "Sold by drum" in the product editor — cart quantity is treated as a drum count.'}
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Tax Name"
          placeholder="e.g. Sales Tax"
          value={taxName}
          onChange={(e) => setTaxName(e.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-500">
          Shown as the line-item label at checkout (e.g. &quot;Sales Tax&quot;).
        </p>
        <TextField
          label="Tax Rate (%)"
          type="number"
          step="0.01"
          value={taxValue}
          onChange={(e) => setTaxValue(e.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-500">
          Applied as a single flat percentage of the order subtotal at checkout — the same rate for every
          state and country. Defaults to 0% (no tax charged) if left blank.
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
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Two columns: four short numeric fields stacked in one narrow
            column left a wide screen mostly empty, and turned the per-field
            help into a tall ribbon of grey text taller than the form. */}
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberSettingField
            label="Wholesale Minimum ($)"
            help="Minimum subtotal to check out."
            placeholder="250"
            fallback="$250"
            value={wholesaleMinimum}
            onChange={setWholesaleMinimum}
          />
          <NumberSettingField
            label="Free Shipping Threshold ($)"
            help="Subtotal that ships free."
            placeholder="85"
            fallback="$85"
            value={freeShippingThreshold}
            onChange={setFreeShippingThreshold}
          />
          <NumberSettingField
            label="Fallback Shipping Amount ($)"
            help="Last resort only — see below."
            placeholder="0"
            fallback="$0"
            value={defaultShippingAmount}
            onChange={setDefaultShippingAmount}
          />
          <NumberSettingField
            label="International Shipping Amount ($)"
            help="Flat rate on every non-US order."
            placeholder="0"
            fallback="$0"
            value={internationalShippingAmount}
            onChange={setInternationalShippingAmount}
          />
        </div>

        <Collapsible title="How shipping is calculated">
          <p>
            <strong className="font-semibold text-slate-700">Domestic (US).</strong> Priced automatically
            from the rate tables below, using the cart&apos;s total weight and the destination
            state&apos;s zone. Variants marked &quot;Sold by drum&quot; use the drum table instead.
          </p>
          <p>
            <strong className="font-semibold text-slate-700">Zone {UNPRICED_ZONE}.</strong> Alaska,
            Hawaii, DC, the US territories and the military codes are not priced automatically. Checkout
            shows no shipping cost and asks the customer to contact you for a quote.
          </p>
          <p>
            <strong className="font-semibold text-slate-700">Fallback Shipping Amount.</strong> Used only
            for a US code with no zone mapping and no table rate — in practice almost never, since every
            state and territory currently maps to a zone.
          </p>
          <p>
            <strong className="font-semibold text-slate-700">Free shipping</strong> overrides all of the
            above once the subtotal reaches the threshold, domestic or international.
          </p>
        </Collapsible>

        {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
        {saved && <div className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">Saved.</div>}
        <div className="flex justify-end">
          <Button type="submit" loading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Label + input + one line of help. Replaces the previous pattern of a
// TextField followed by a negative-margin <p> carrying a whole paragraph.
function NumberSettingField({
  label,
  help,
  placeholder,
  fallback,
  value,
  onChange,
}: {
  label: string;
  help: string;
  placeholder: string;
  fallback: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <TextField
        label={label}
        type="number"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-1.5 text-xs text-slate-500">
        {help} <span className="text-slate-400">Blank = {fallback}.</span>
      </p>
    </div>
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
          The &quot;from&quot; identity on all outgoing transactional emails. The domain must be verified in your
          Resend account, or delivery will fail.
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
  const [openZone, setOpenZone] = useState<number | null>(null);

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
          Fixed — edit the $ amounts below instead. Every destination in a zone shares that zone&apos;s
          rate. Covers the 50 states plus DC and the US territories. Military and diplomatic mail
          addresses (APO/FPO/DPO) aren&apos;t shippable and are excluded.
        </p>
      </div>
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load zone assignments." />}
      {data && (
        <Card className="divide-y divide-slate-100">
          {data.zones.map((group) => {
            const open = openZone === group.zone;
            const unpriced = group.zone === UNPRICED_ZONE;
            return (
              <div key={group.zone}>
                {/* Collapsed by default: Zone 7 alone is 23 state codes, and
                    as one comma-separated line that's unreadable. */}
                <button
                  type="button"
                  onClick={() => setOpenZone(open ? null : group.zone)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <ZoneChip zone={group.zone} />
                  {/* "destinations", not "states" — the 62 codes across all
                      zones are the 50 states plus DC, the territories and the
                      military mail codes, so calling them states made the
                      totals look wrong. */}
                  <span className="text-xs text-slate-500">
                    {group.states.length}{' '}
                    {group.states.length === 1 ? 'destination' : 'destinations'}
                  </span>
                  {unpriced && <span className="text-xs font-medium text-slate-400">· quoted manually</span>}
                  {!open && (
                    <span className="ml-auto hidden truncate text-xs text-slate-400 sm:block sm:max-w-[52%]">
                      {group.states.map((st) => st.name).join(', ')}
                    </span>
                  )}
                  <ChevronDownIcon
                    className={`${open ? 'rotate-180' : ''} ml-auto h-4 w-4 shrink-0 text-slate-400 transition sm:ml-3`}
                  />
                </button>
                {open && (
                  <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                    {group.states.map((st) => (
                      <span
                        key={st.code}
                        className="inline-flex items-center gap-1.5 rounded bg-white py-0.5 pl-1 pr-2 text-xs text-slate-700 ring-1 ring-inset ring-slate-200"
                      >
                        <span className="rounded bg-slate-100 px-1 font-mono text-[10px] font-medium text-slate-500">
                          {st.code}
                        </span>
                        {st.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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

  const zoneCount = data?.[0]?.rates.length ?? 0;

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
        <Card className="overflow-hidden">
          {/* Both axes stick. With ~28 rows x 8 zones all visible, losing the
              zone header or the weight label mid-scroll makes it easy to type
              a rate into the wrong column — which silently mis-prices real
              orders, so this is correctness as much as comfort.

              table-fixed so the zone columns divide the available width
              evenly instead of collapsing to their content: a fixed-width
              input was clipping four-digit drum rates like 1901.44. The
              min-width keeps them from squeezing on a narrow screen —
              the container scrolls horizontally instead. */}
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full min-w-[820px] table-fixed border-separate border-spacing-0 text-left text-sm">
              <colgroup>
                <col className="w-[120px]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-30 border-b border-r border-slate-200 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {kind === 'WEIGHT' ? 'Weight' : 'Drums'}
                  </th>
                  {Array.from({ length: zoneCount }, (_, i) => i + 1).map((zone) => (
                    <th
                      key={zone}
                      className="sticky top-0 z-20 border-b border-slate-200 bg-white px-2 py-2.5 text-center"
                    >
                      <ZoneChip zone={zone} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => {
                  // Zebra striping. The stripe has to be repeated on the
                  // sticky label cell too — that cell paints its own opaque
                  // background to cover the scrolling columns, so a stripe
                  // set only on the <tr> would vanish underneath it.
                  const rowBg = rowIndex % 2 === 1 ? 'bg-slate-50' : 'bg-white';
                  return (
                    <tr key={row.breakpoint} className="group">
                      <td
                        className={`sticky left-0 z-10 border-b border-r border-slate-100 px-4 py-2 text-xs font-medium text-slate-700 ${rowBg} group-hover:bg-brand-50`}
                      >
                        {rowLabel(row.breakpoint)}
                      </td>
                      {row.rates.map((rate, i) => {
                        const zone = i + 1;
                        const key = `${row.breakpoint}-${zone}`;
                        const draftValue = drafts[key] ?? (rate != null ? String(rate) : '');
                        const cellSaving = savingKey === key && saveMutation.isPending;

                        // The pricing code never reads Zone 8, so an editable
                        // input here would be a lie — an admin could set a
                        // rate and it would have no effect on any checkout.
                        if (zone === UNPRICED_ZONE) {
                          return (
                            <td
                              key={zone}
                              title="Not priced automatically — the customer is asked to contact you for a quote."
                              className="border-b border-slate-100 bg-slate-100 px-2 py-2 text-center text-slate-400 group-hover:bg-slate-200"
                            >
                              —
                            </td>
                          );
                        }

                        return (
                          <td
                            key={zone}
                            className={`border-b border-slate-100 px-2 py-1 ${rowBg} group-hover:bg-brand-50`}
                          >
                            {/* Fills the cell (w-full) rather than sitting as a
                                narrow box in a sea of padding, and stays
                                borderless until hovered or focused — 200+
                                bordered boxes at once read as grid noise
                                rather than as numbers. */}
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
                              className={`w-full rounded border bg-transparent px-2 py-1 text-center text-sm tabular-nums text-slate-700 outline-none transition hover:border-slate-300 hover:bg-white focus:border-brand-500 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-brand-100 disabled:opacity-40 ${
                                drafts[key] !== undefined ? 'border-amber-300 bg-amber-50' : 'border-transparent'
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-500">
            Click a cell to edit — it saves when you click away or press Enter. Unsaved edits show amber.
            Zone {UNPRICED_ZONE} is quoted manually and has no rate.
          </div>
        </Card>
      )}
    </div>
  );
}
