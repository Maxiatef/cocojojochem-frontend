'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import {
  BulkSaleDiscount,
  Category,
  Coupon,
  CouponAnalyticsAll,
  CouponType,
  Paginated,
  Product,
} from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
  SelectField,
  StatCard,
  Table,
  TableHead,
  Td,
  TextAreaField,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { EditIcon, PlusIcon, TrashIcon, ChartIcon, DollarIcon, TicketIcon } from '@/components/icons';

type Tab = 'coupons' | 'analytics' | 'bulk-sales' | 'advanced';

// --- helpers ------------------------------------------------------------

function idsToString(json: string | null | undefined): string {
  if (!json) return '';
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.join(', ') : '';
  } catch {
    return '';
  }
}

function idsToArray(json: string | null | undefined): number[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function hasIds(json: string | null | undefined): boolean {
  if (!json) return false;
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) && arr.length > 0;
  } catch {
    return false;
  }
}

function couponStatus(c: Coupon): { label: string; tone: string } {
  if (!c.isActive) return { label: 'INACTIVE', tone: 'SUSPENDED' };
  const now = Date.now();
  if (c.startDate && new Date(c.startDate).getTime() > now) return { label: 'SCHEDULED', tone: 'PENDING' };
  if (c.endDate && new Date(c.endDate).getTime() < now) return { label: 'EXPIRED', tone: 'CANCELLED' };
  if (c.usageLimit != null && c.usageCount >= c.usageLimit) return { label: 'EXHAUSTED', tone: 'CANCELLED' };
  return { label: 'ACTIVE', tone: 'APPROVED' };
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

// --- Coupon form state ----------------------------------------------------

interface CouponFormState {
  id: number | null;
  code: string;
  description: string;
  type: CouponType;
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  maxUsagePerUser: string;
  isActive: boolean;
  applicableToAllCategories: boolean;
  applicableToAllProducts: boolean;
  excludedCategoryIds: number[];
  excludedProductIds: number[];
  excludedVariantIds: number[];
  includedCategoryIds: number[];
  includedProductIds: number[];
  includedVariantIds: number[];
}

const EMPTY_COUPON_FORM: CouponFormState = {
  id: null,
  code: '',
  description: '',
  type: 'PERCENTAGE',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
  maxUsagePerUser: '',
  isActive: true,
  applicableToAllCategories: true,
  applicableToAllProducts: true,
  excludedCategoryIds: [],
  excludedProductIds: [],
  excludedVariantIds: [],
  includedCategoryIds: [],
  includedProductIds: [],
  includedVariantIds: [],
};

function couponToForm(c: Coupon): CouponFormState {
  return {
    id: c.id,
    code: c.code,
    description: c.description || '',
    type: c.type,
    value: c.value,
    minOrderAmount: c.minOrderAmount || '',
    maxDiscount: c.maxDiscount || '',
    startDate: c.startDate ? c.startDate.slice(0, 10) : '',
    endDate: c.endDate ? c.endDate.slice(0, 10) : '',
    usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
    maxUsagePerUser: c.maxUsagePerUser != null ? String(c.maxUsagePerUser) : '',
    isActive: c.isActive,
    applicableToAllCategories: c.applicableToAllCategories,
    applicableToAllProducts: c.applicableToAllProducts,
    excludedCategoryIds: idsToArray(c.excludedCategoryIds),
    excludedProductIds: idsToArray(c.excludedProductIds),
    excludedVariantIds: idsToArray(c.excludedVariantIds),
    includedCategoryIds: idsToArray(c.includedCategoryIds),
    includedProductIds: idsToArray(c.includedProductIds),
    includedVariantIds: idsToArray(c.includedVariantIds),
  };
}

function nonNegative(n: number): number {
  return Math.max(0, n);
}

function formToBody(f: CouponFormState): Record<string, unknown> {
  return {
    code: f.code.trim().toUpperCase(),
    description: f.description || undefined,
    type: f.type,
    value: nonNegative(Number(f.value) || 0),
    minOrderAmount: f.minOrderAmount ? nonNegative(Number(f.minOrderAmount)) : undefined,
    maxDiscount: f.maxDiscount ? nonNegative(Number(f.maxDiscount)) : undefined,
    startDate: f.startDate ? new Date(f.startDate).toISOString() : undefined,
    endDate: f.endDate ? new Date(f.endDate).toISOString() : undefined,
    usageLimit: f.usageLimit ? nonNegative(Number(f.usageLimit)) : undefined,
    maxUsagePerUser: f.maxUsagePerUser ? nonNegative(Number(f.maxUsagePerUser)) : undefined,
    isActive: f.isActive,
    applicableToAllCategories: f.applicableToAllCategories,
    applicableToAllProducts: f.applicableToAllProducts,
    excludedCategoryIds: f.excludedCategoryIds.length ? f.excludedCategoryIds : undefined,
    excludedProductIds: f.excludedProductIds.length ? f.excludedProductIds : undefined,
    excludedVariantIds: f.excludedVariantIds.length ? f.excludedVariantIds : undefined,
    includedCategoryIds: f.includedCategoryIds.length ? f.includedCategoryIds : undefined,
    includedProductIds: f.includedProductIds.length ? f.includedProductIds : undefined,
    includedVariantIds: f.includedVariantIds.length ? f.includedVariantIds : undefined,
  };
}

// --- Bulk sale form state -----------------------------------------------

interface BulkSaleFormState {
  id: number | null;
  name: string;
  discountPercent: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  categoryIds: number[];
  productIds: number[];
  variantIds: number[];
  applyToAllVariants: boolean;
}

const EMPTY_BULK_FORM: BulkSaleFormState = {
  id: null,
  name: '',
  discountPercent: '',
  startDate: '',
  endDate: '',
  isActive: true,
  categoryIds: [],
  productIds: [],
  variantIds: [],
  applyToAllVariants: false,
};

function bulkSaleToForm(b: BulkSaleDiscount): BulkSaleFormState {
  return {
    id: b.id,
    name: b.name,
    discountPercent: b.discountPercent,
    startDate: b.startDate ? b.startDate.slice(0, 16) : '',
    endDate: b.endDate ? b.endDate.slice(0, 16) : '',
    isActive: b.isActive,
    categoryIds: idsToArray(b.categoryIds),
    productIds: idsToArray(b.productIds),
    variantIds: idsToArray(b.variantIds),
    applyToAllVariants: b.applyToAllVariants,
  };
}

function bulkFormToBody(f: BulkSaleFormState): Record<string, unknown> {
  return {
    name: f.name,
    discountPercent: Number(f.discountPercent) || 0,
    startDate: f.startDate ? new Date(f.startDate).toISOString() : undefined,
    endDate: f.endDate ? new Date(f.endDate).toISOString() : undefined,
    isActive: f.isActive,
    categoryIds: f.categoryIds.length ? f.categoryIds : undefined,
    productIds: f.productIds.length ? f.productIds : undefined,
    variantIds: f.variantIds.length ? f.variantIds : undefined,
    applyToAllVariants: f.applyToAllVariants,
  };
}

// --- Category/product/variant option fetching for the restriction pickers --

function useCategoryOptions() {
  const { data } = useQuery({
    queryKey: ['admin-coupon-categories'],
    queryFn: () => api.get<Paginated<Category>>('/wholesale/categories?page=1&limit=200'),
  });
  return useMemo(() => (data?.data || []).map((c) => ({ id: c.id, label: c.name })), [data]);
}

function useProductAndVariantOptions() {
  const { data } = useQuery({
    queryKey: ['admin-coupon-products'],
    queryFn: () => api.get<Paginated<Product>>('/wholesale/products/admin?page=1&limit=1000'),
  });
  const products = useMemo(() => data?.data || [], [data]);
  const productOptions = useMemo(() => products.map((p) => ({ id: p.id, label: p.name })), [products]);
  const variantOptions = useMemo(
    () =>
      products.flatMap((p) =>
        (p.variants || []).map((v) => ({ id: v.id, label: `${p.name} — ${v.label}` })),
      ),
    [products],
  );
  return { productOptions, variantOptions };
}

function IdCheckboxPicker({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: number; label: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-1.5">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        {selected.length > 0 && <span className="text-[11px] text-brand-600">{selected.length} selected</span>}
      </div>
      <div className="p-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="mb-1.5 w-full rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-500"
        />
        <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
          {filtered.length === 0 && <p className="py-1 text-xs text-slate-400">No matches.</p>}
          {filtered.map((o) => (
            <label key={o.id} className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
              <span className="truncate">{o.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Page -----------------------------------------------------------------

export default function CouponsAdminPage() {
  const [tab, setTab] = useState<Tab>('coupons');

  return (
    <RequireAdmin>
      <div>
        <PageHeader title="Coupons & Promotions" description="Manage discount codes, bulk sales, and view redemption analytics." />

        <div className="mb-6 flex gap-1 border-b border-slate-200">
          {(
            [
              ['coupons', 'Coupons'],
              ['analytics', 'Analytics'],
              ['bulk-sales', 'Bulk Sales'],
              ['advanced', 'Advanced Coupons'],
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

        {tab === 'coupons' && <CouponsTab />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'bulk-sales' && <BulkSalesTab />}
        {tab === 'advanced' && <AdvancedCouponsTab />}
      </div>
    </RequireAdmin>
  );
}

// --- Coupons tab ------------------------------------------------------------

function useCouponsQuery() {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get<Paginated<Coupon>>('/coupons?page=1&limit=200'),
  });
}

function CouponsTab() {
  const { data, isLoading, isError } = useCouponsQuery();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const coupons = data?.data || [];
  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter && c.type !== typeFilter) return false;
      if (statusFilter && couponStatus(c).label !== statusFilter) return false;
      return true;
    });
  }, [coupons, search, typeFilter, statusFilter]);

  return (
    <CouponListSection
      title="Coupons"
      description="All discount codes."
      coupons={filtered}
      isLoading={isLoading}
      isError={isError}
      extraFilters={
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code…"
            className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All types</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EXPIRED">Expired</option>
            <option value="EXHAUSTED">Exhausted</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </>
      }
    />
  );
}

function AdvancedCouponsTab() {
  const { data, isLoading, isError } = useCouponsQuery();
  const coupons = (data?.data || []).filter(
    (c) => hasIds(c.includedCategoryIds) || hasIds(c.includedProductIds) || hasIds(c.includedVariantIds)
  );

  return (
    <CouponListSection
      title="Advanced Coupons"
      description="Coupons restricted to specific categories, products, or variants."
      coupons={coupons}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

function CouponListSection({
  title,
  description,
  coupons,
  isLoading,
  isError,
  extraFilters,
}: {
  title: string;
  description: string;
  coupons: Coupon[];
  isLoading: boolean;
  isError: boolean;
  extraFilters?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CouponFormState>(EMPTY_COUPON_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null);
  const categoryOptions = useCategoryOptions();
  const { productOptions, variantOptions } = useProductAndVariantOptions();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/coupons', body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.patch(`/coupons/${id}`, body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
    },
  });

  function openCreateModal() {
    setForm(EMPTY_COUPON_FORM);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(c: Coupon) {
    setForm(couponToForm(c));
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body = formToBody(form);
    if (form.id) {
      updateMutation.mutate({ id: form.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {extraFilters}
          <Button onClick={openCreateModal} icon={PlusIcon} size="sm">
            Add Coupon
          </Button>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load coupons." />}
      {!isLoading && !isError && coupons.length === 0 && <EmptyState message="No coupons found." />}

      {!isLoading && coupons.length > 0 && (
        <Card>
          <Table minWidth={860}>
            <TableHead>
              <Th>Code</Th>
              <Th>Type &amp; Value</Th>
              <Th>Usage</Th>
              <Th>Validity</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {coupons.map((c) => {
                const status = couponStatus(c);
                return (
                  <Tr key={c.id}>
                    <Td className="font-medium text-slate-900">
                      {c.code}
                      {c.description && <span className="block text-xs font-normal text-slate-500">{c.description}</span>}
                    </Td>
                    <Td className="text-slate-600">
                      {c.type === 'PERCENTAGE' ? `${c.value}%` : `$${c.value}`}
                    </Td>
                    <Td className="text-slate-600">
                      {c.usageCount}/{c.usageLimit ?? '∞'}
                    </Td>
                    <Td className="text-slate-500">
                      {fmtDate(c.startDate)} – {fmtDate(c.endDate)}
                    </Td>
                    <Td>
                      <Badge status={status.tone} />
                    </Td>
                    <Td align="right">
                      <div className="flex justify-end gap-1.5">
                        <IconButton icon={EditIcon} label="Edit" onClick={() => openEditModal(c)} />
                        <IconButton
                          icon={TrashIcon}
                          label="Delete"
                          variant="danger"
                          onClick={() => setPendingDelete(c)}
                        />
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={form.id ? 'Edit Coupon' : 'Add Coupon'} size="xl">
        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
          <TextField
            label="Code"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <TextAreaField
            label="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed amount</option>
            </SelectField>
            <TextField
              label={form.type === 'PERCENTAGE' ? 'Value (%)' : 'Value ($)'}
              type="number"
              step="0.01"
              min={0}
              max={form.type === 'PERCENTAGE' ? 100 : undefined}
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Min Order Amount"
              type="number"
              step="0.01"
              min={0}
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            />
            <TextField
              label="Max Discount"
              type="number"
              step="0.01"
              min={0}
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Usage Limit (total)"
              type="number"
              min={0}
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            />
            <TextField
              label="Max Usage Per User"
              type="number"
              min={0}
              value={form.maxUsagePerUser}
              onChange={(e) => setForm({ ...form, maxUsagePerUser: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.applicableToAllCategories}
                onChange={(e) => setForm({ ...form, applicableToAllCategories: e.target.checked })}
              />
              Applies to all categories
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.applicableToAllProducts}
                onChange={(e) => setForm({ ...form, applicableToAllProducts: e.target.checked })}
              />
              Applies to all products
            </label>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Restrictions — check the categories, products, or variants this coupon applies to
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-emerald-700">Included (allow-list — leave empty for &quot;all&quot;)</p>
                <div className="space-y-2">
                  <IdCheckboxPicker
                    label="Categories"
                    options={categoryOptions}
                    selected={form.includedCategoryIds}
                    onChange={(ids) => setForm({ ...form, includedCategoryIds: ids })}
                  />
                  <IdCheckboxPicker
                    label="Products"
                    options={productOptions}
                    selected={form.includedProductIds}
                    onChange={(ids) => setForm({ ...form, includedProductIds: ids })}
                  />
                  <IdCheckboxPicker
                    label="Variants"
                    options={variantOptions}
                    selected={form.includedVariantIds}
                    onChange={(ids) => setForm({ ...form, includedVariantIds: ids })}
                  />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-red-700">Excluded (deny-list — always wins)</p>
                <div className="space-y-2">
                  <IdCheckboxPicker
                    label="Categories"
                    options={categoryOptions}
                    selected={form.excludedCategoryIds}
                    onChange={(ids) => setForm({ ...form, excludedCategoryIds: ids })}
                  />
                  <IdCheckboxPicker
                    label="Products"
                    options={productOptions}
                    selected={form.excludedProductIds}
                    onChange={(ids) => setForm({ ...form, excludedProductIds: ids })}
                  />
                  <IdCheckboxPicker
                    label="Variants"
                    options={variantOptions}
                    selected={form.excludedVariantIds}
                    onChange={(ids) => setForm({ ...form, excludedVariantIds: ids })}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {form.id ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete coupon"
        message={`Delete coupon "${pendingDelete?.code}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

// --- Analytics tab ----------------------------------------------------------

function AnalyticsTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['coupons-analytics-all'],
    queryFn: () => api.get<CouponAnalyticsAll>('/coupons/analytics/all'),
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState message="Couldn't load coupon analytics." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Coupons" value={data.totalCoupons} icon={TicketIcon} />
        <StatCard label="Active Coupons" value={data.activeCoupons} accent="brand" icon={ChartIcon} />
        <StatCard
          label="Total Discount Given"
          value={`$${data.totalDiscountGiven.toFixed(2)}`}
          accent="amber"
          icon={DollarIcon}
        />
        <StatCard label="Total Redemptions" value={data.totalUsages} icon={ChartIcon} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Top Coupons</div>
          {data.topCoupons.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">No redemptions yet.</div>
          ) : (
            <Table minWidth={360}>
              <TableHead>
                <Th>Code</Th>
                <Th align="right">Uses</Th>
              </TableHead>
              <tbody>
                {data.topCoupons.map((c) => (
                  <Tr key={c.couponId}>
                    <Td className="font-medium text-slate-900">{c.code}</Td>
                    <Td align="right">{c.usageCount}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Top Users</div>
          {data.topUsers.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">No redemptions yet.</div>
          ) : (
            <Table minWidth={360}>
              <TableHead>
                <Th>Email</Th>
                <Th align="right">Uses</Th>
              </TableHead>
              <tbody>
                {data.topUsers.map((u) => (
                  <Tr key={u.email}>
                    <Td className="text-slate-700">{u.email}</Td>
                    <Td align="right">{u.usageCount}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Top Products Sold via Coupon</div>
          {data.topProducts.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">No data yet.</div>
          ) : (
            <Table minWidth={360}>
              <TableHead>
                <Th>Product</Th>
                <Th align="right">Quantity Sold</Th>
              </TableHead>
              <tbody>
                {data.topProducts.map((p) => (
                  <Tr key={p.productName}>
                    <Td className="text-slate-700">{p.productName}</Td>
                    <Td align="right">{p.quantitySold}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}

// --- Bulk sales tab ----------------------------------------------------------

function BulkSalesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-bulk-sales'],
    queryFn: () => api.get<BulkSaleDiscount[]>('/bulk-sales'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<BulkSaleFormState>(EMPTY_BULK_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BulkSaleDiscount | null>(null);
  const categoryOptions = useCategoryOptions();
  const { productOptions, variantOptions } = useProductAndVariantOptions();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-bulk-sales'] });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/bulk-sales', body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.patch(`/bulk-sales/${id}`, body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/bulk-sales/${id}`),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
    },
  });

  function openCreateModal() {
    setForm(EMPTY_BULK_FORM);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(b: BulkSaleDiscount) {
    setForm(bulkSaleToForm(b));
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body = bulkFormToBody(form);
    if (form.id) {
      updateMutation.mutate({ id: form.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const sales = data || [];
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Bulk Sales</h2>
          <p className="text-xs text-slate-500">Time-boxed percentage discounts across categories, products, or variants.</p>
        </div>
        <Button onClick={openCreateModal} icon={PlusIcon} size="sm">
          Add Bulk Sale
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load bulk sales." />}
      {!isLoading && !isError && sales.length === 0 && <EmptyState message="No bulk sales yet." />}

      {!isLoading && sales.length > 0 && (
        <Card>
          <Table minWidth={720}>
            <TableHead>
              <Th>Name</Th>
              <Th>Discount</Th>
              <Th>Window</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {sales.map((b) => {
                const now = Date.now();
                const active =
                  b.isActive && new Date(b.startDate).getTime() <= now && new Date(b.endDate).getTime() >= now;
                return (
                  <Tr key={b.id}>
                    <Td className="font-medium text-slate-900">{b.name}</Td>
                    <Td className="text-slate-600">{b.discountPercent}%</Td>
                    <Td className="text-slate-500">
                      {fmtDate(b.startDate)} – {fmtDate(b.endDate)}
                    </Td>
                    <Td>
                      <Badge status={active ? 'APPROVED' : 'SUSPENDED'} />
                    </Td>
                    <Td align="right">
                      <div className="flex justify-end gap-1.5">
                        <IconButton icon={EditIcon} label="Edit" onClick={() => openEditModal(b)} />
                        <IconButton
                          icon={TrashIcon}
                          label="Delete"
                          variant="danger"
                          onClick={() => setPendingDelete(b)}
                        />
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={form.id ? 'Edit Bulk Sale' : 'Add Bulk Sale'} size="xl">
        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Discount Percent"
            type="number"
            step="0.01"
            min={0}
            max={100}
            required
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Start"
              type="datetime-local"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <TextField
              label="End"
              type="datetime-local"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.applyToAllVariants}
                onChange={(e) => setForm({ ...form, applyToAllVariants: e.target.checked })}
              />
              Apply to all variants of targeted products
            </label>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Targeting — check the categories, products, or variants to discount
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <IdCheckboxPicker
                label="Categories"
                options={categoryOptions}
                selected={form.categoryIds}
                onChange={(ids) => setForm({ ...form, categoryIds: ids })}
              />
              <IdCheckboxPicker
                label="Products"
                options={productOptions}
                selected={form.productIds}
                onChange={(ids) => setForm({ ...form, productIds: ids })}
              />
              <IdCheckboxPicker
                label="Variants"
                options={variantOptions}
                selected={form.variantIds}
                onChange={(ids) => setForm({ ...form, variantIds: ids })}
              />
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {form.id ? 'Save Changes' : 'Create Bulk Sale'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete bulk sale"
        message={`Delete bulk sale "${pendingDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
