'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Category, Paginated, Product, ProductFunction } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  PageHeader,
  Pagination,
  SelectField,
  Table,
  TableHead,
  Td,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';

type ProductAdminSort = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest';

interface ProductAdminStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  onBackorder: number;
  lowStock: number;
}

// A product's overall stock badge — worst-case across its variants, since one
// out-of-stock variant is the thing an admin most needs to notice at a glance.
function productStockBadge(p: Product): string {
  const statuses = p.variants.map((v) => v.stockStatus);
  if (statuses.includes('OUT_OF_STOCK')) return 'OUT_OF_STOCK';
  if (statuses.includes('ON_BACKORDER')) return 'ON_BACKORDER';
  return 'IN_STOCK';
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [functionSlug, setFunctionSlug] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [sort, setSort] = useState<ProductAdminSort>('name_asc');
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['admin-products-stats'],
    queryFn: () => api.get<ProductAdminStats>('/wholesale/products/admin/stats'),
    refetchInterval: 30_000,
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['admin-products-categories'],
    queryFn: () => api.get<Paginated<Category>>('/wholesale/categories?page=1&limit=200'),
  });
  const categories = categoriesRes?.data || [];

  const { data: functionsRes } = useQuery({
    queryKey: ['admin-products-functions'],
    queryFn: () => api.get<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=200'),
  });
  const functions = functionsRes?.data || [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-products', search, page, categoryId, functionSlug, statusFilter, stockStatus, lowStock, sort],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      params.set('sort', sort);
      if (search) params.set('search', search);
      if (categoryId) params.set('categoryId', categoryId);
      if (functionSlug) params.set('functionSlug', functionSlug);
      if (statusFilter) params.set('isActive', statusFilter);
      if (stockStatus) params.set('stockStatus', stockStatus);
      if (lowStock) params.set('lowStock', 'true');
      return api.get<Paginated<Product>>(`/wholesale/products/admin?${params.toString()}`);
    },
  });

  const invalidateStats = () => queryClient.invalidateQueries({ queryKey: ['admin-products-stats'] });

  // Clicking a status card both filters the list AND clears the other status
  // filters (a product can't usefully be filtered to both "Active" and "Out
  // of stock" via these cards — clicking one is a fresh lens, not an AND).
  // Clicking the already-active card toggles it off.
  function selectCard(kind: 'active' | 'inactive' | 'outOfStock' | 'onBackorder' | 'lowStock' | null) {
    setPage(1);
    setStatusFilter(kind === 'active' ? 'true' : kind === 'inactive' ? 'false' : '');
    setStockStatus(kind === 'outOfStock' ? 'OUT_OF_STOCK' : kind === 'onBackorder' ? 'ON_BACKORDER' : '');
    setLowStock(kind === 'lowStock');
  }

  function toggleCard(kind: 'active' | 'inactive' | 'outOfStock' | 'onBackorder' | 'lowStock') {
    const isActive =
      (kind === 'active' && statusFilter === 'true') ||
      (kind === 'inactive' && statusFilter === 'false') ||
      (kind === 'outOfStock' && stockStatus === 'OUT_OF_STOCK') ||
      (kind === 'onBackorder' && stockStatus === 'ON_BACKORDER') ||
      (kind === 'lowStock' && lowStock);
    selectCard(isActive ? null : kind);
  }

  function resetPageAnd<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-products'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/wholesale/products/${id}`),
    onSuccess: () => {
      invalidate();
      invalidateStats();
      setPendingDelete(null);
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.patch(`/wholesale/products/${id}`, { isActive }),
    onSuccess: () => {
      invalidate();
      invalidateStats();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title="Products" description="The full wholesale ingredient catalog." />
        <Link href="/admin/products/new">
          <Button icon={PlusIcon}>Add Product</Button>
        </Link>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatusCard
            label="Total"
            value={stats.total}
            active={!statusFilter && !stockStatus && !lowStock}
            onClick={() => selectCard(null)}
          />
          <StatusCard
            label="Active"
            value={stats.active}
            tone="green"
            active={statusFilter === 'true'}
            onClick={() => toggleCard('active')}
          />
          <StatusCard
            label="Inactive"
            value={stats.inactive}
            tone="slate"
            active={statusFilter === 'false'}
            onClick={() => toggleCard('inactive')}
          />
          <StatusCard
            label="Out of Stock"
            value={stats.outOfStock}
            tone="red"
            active={stockStatus === 'OUT_OF_STOCK'}
            onClick={() => toggleCard('outOfStock')}
          />
          <StatusCard
            label="Backorder"
            value={stats.onBackorder}
            tone="amber"
            active={stockStatus === 'ON_BACKORDER'}
            onClick={() => toggleCard('onBackorder')}
          />
          <StatusCard
            label="Running Low"
            value={stats.lowStock}
            tone="amber"
            active={lowStock}
            onClick={() => toggleCard('lowStock')}
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <TextField
            label="Search"
            value={search}
            onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
            placeholder="Search by name, INCI, or SKU…"
          />
        </div>
        <div className="w-48">
          <SelectField
            label="Category"
            value={categoryId}
            onChange={(e) => resetPageAnd(setCategoryId)(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-48">
          <SelectField
            label="Function"
            value={functionSlug}
            onChange={(e) => resetPageAnd(setFunctionSlug)(e.target.value)}
          >
            <option value="">All functions</option>
            {functions.map((f) => (
              <option key={f.id} value={f.slug}>
                {f.name}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-40">
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(e) => resetPageAnd(setStatusFilter)(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </SelectField>
        </div>
        <div className="w-48">
          <SelectField
            label="Sort"
            value={sort}
            onChange={(e) => resetPageAnd(setSort)(e.target.value as ProductAdminSort)}
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </SelectField>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load products." />}
      {data && data.data.length === 0 && <EmptyState message="No products found." />}

      {data && data.data.length > 0 && (
        <Card>
          <Table minWidth={900}>
            <TableHead>
              <Th>Product</Th>
              <Th>SKU</Th>
              <Th>Category</Th>
              <Th>Variants</Th>
              <Th>Price range</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {data.data.map((p) => {
                const prices = p.variants.map((v) => Number(v.price)).filter((n) => !isNaN(n));
                const min = prices.length ? Math.min(...prices) : null;
                const max = prices.length ? Math.max(...prices) : null;
                const toggling =
                  toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === p.id;
                return (
                  <Tr key={p.id}>
                    <Td>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      {p.inciName && (
                        <p className="max-w-xs truncate text-xs text-slate-500">{p.inciName}</p>
                      )}
                    </Td>
                    <Td className="text-slate-600">{p.sku}</Td>
                    <Td className="text-slate-600">{p.category?.name || '—'}</Td>
                    <Td className="text-slate-600">{p.variants.length}</Td>
                    <Td className="text-slate-600">
                      {min != null ? (min === max ? `$${min}` : `$${min} – $${max}`) : '—'}
                    </Td>
                    <Td>
                      <Badge status={productStockBadge(p)} />
                    </Td>
                    <Td>
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: p.id, isActive: !p.isActive })
                        }
                        disabled={toggling}
                        title="Click to toggle"
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
                          p.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </Td>
                    <Td align="right">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <IconButton icon={EditIcon} label="Edit" />
                        </Link>
                        <IconButton
                          icon={TrashIcon}
                          label="Delete"
                          variant="danger"
                          onClick={() => setPendingDelete(p)}
                        />
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>

          <Pagination
            page={page}
            totalPages={data.pagination.totalPages || 1}
            onPageChange={setPage}
            totalItems={data.pagination.total}
            itemLabel="product"
          />
        </Card>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete product"
        message={`Delete "${pendingDelete?.name}"? This also removes all its variants. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

const STATUS_CARD_TONES: Record<string, { ring: string; value: string }> = {
  brand: { ring: 'border-brand-500 ring-brand-100', value: 'text-brand-700' },
  green: { ring: 'border-green-500 ring-green-100', value: 'text-green-700' },
  red: { ring: 'border-red-500 ring-red-100', value: 'text-red-700' },
  amber: { ring: 'border-amber-500 ring-amber-100', value: 'text-amber-700' },
  slate: { ring: 'border-slate-400 ring-slate-100', value: 'text-slate-700' },
};

// A stat tile that doubles as a filter toggle — clicking it filters the table
// below to that status, clicking it again clears the filter. The hover
// lift/border and cursor-pointer are the only signal it's clickable, so make
// them obvious rather than subtle.
function StatusCard({
  label,
  value,
  onClick,
  active = false,
  tone = 'brand',
}: {
  label: string;
  value: number;
  onClick: () => void;
  active?: boolean;
  tone?: keyof typeof STATUS_CARD_TONES;
}) {
  const t = STATUS_CARD_TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? `${t.ring} ring-2` : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${active ? t.value : 'text-slate-900'}`}>{value}</p>
    </button>
  );
}

