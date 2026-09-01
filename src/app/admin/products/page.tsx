'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Category, Paginated, Product, ProductFunction, SalesProductsAnalytics } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
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
  StatCard,
  Table,
  TableHead,
  Td,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { EditIcon, ImagePlaceholderIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { StatusCard } from '@/components/admin/StatusCard';

type ProductAdminSort =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'sku_asc'
  | 'sku_desc'
  | 'category_asc'
  | 'category_desc'
  | 'variants_asc'
  | 'variants_desc'
  | 'stock_asc'
  | 'stock_desc'
  | 'status_asc'
  | 'status_desc';

// Maps a table column to its asc/desc sort keys, so a header click can look
// up "what am I currently sorted by" and "what's the opposite direction".
const SORTABLE_COLUMNS: Record<string, { asc: ProductAdminSort; desc: ProductAdminSort }> = {
  name: { asc: 'name_asc', desc: 'name_desc' },
  sku: { asc: 'sku_asc', desc: 'sku_desc' },
  category: { asc: 'category_asc', desc: 'category_desc' },
  variants: { asc: 'variants_asc', desc: 'variants_desc' },
  price: { asc: 'price_asc', desc: 'price_desc' },
  stock: { asc: 'stock_asc', desc: 'stock_desc' },
  status: { asc: 'status_asc', desc: 'status_desc' },
};

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

type PageTab = 'catalog' | 'analytics';

export default function ProductsPage() {
  const [pageTab, setPageTab] = useState<PageTab>('catalog');
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
      if (statusFilter) params.set('isPublished', statusFilter);
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
  function selectCard(kind: 'published' | 'draft' | 'outOfStock' | 'onBackorder' | 'lowStock' | null) {
    setPage(1);
    setStatusFilter(kind === 'published' ? 'true' : kind === 'draft' ? 'false' : '');
    setStockStatus(kind === 'outOfStock' ? 'OUT_OF_STOCK' : kind === 'onBackorder' ? 'ON_BACKORDER' : '');
    setLowStock(kind === 'lowStock');
  }

  function toggleCard(kind: 'published' | 'draft' | 'outOfStock' | 'onBackorder' | 'lowStock') {
    const isSelected =
      (kind === 'published' && statusFilter === 'true') ||
      (kind === 'draft' && statusFilter === 'false') ||
      (kind === 'outOfStock' && stockStatus === 'OUT_OF_STOCK') ||
      (kind === 'onBackorder' && stockStatus === 'ON_BACKORDER') ||
      (kind === 'lowStock' && lowStock);
    selectCard(isSelected ? null : kind);
  }

  function resetPageAnd<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  // Header click: first click sorts ascending, clicking the same column
  // again flips to descending, matching the arrow shown in the header.
  function sortHeaderProps(column: keyof typeof SORTABLE_COLUMNS) {
    const { asc, desc } = SORTABLE_COLUMNS[column];
    const direction: 'asc' | 'desc' | null = sort === asc ? 'asc' : sort === desc ? 'desc' : null;
    return {
      sortDirection: direction,
      onSort: () => resetPageAnd(setSort)(direction === 'asc' ? desc : asc),
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

  const togglePublishedMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      api.patch(`/wholesale/products/${id}`, { isPublished }),
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

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {(
          [
            ['catalog', 'All Products'],
            ['analytics', 'Analytics'],
          ] as [PageTab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPageTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              pageTab === key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {pageTab === 'analytics' && <ProductsAnalyticsTab />}

      {pageTab === 'catalog' && (
        <>
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatusCard
            label="Total"
            value={stats.total}
            active={!statusFilter && !stockStatus && !lowStock}
            onClick={() => selectCard(null)}
          />
          <StatusCard
            label="Published"
            value={stats.active}
            tone="green"
            active={statusFilter === 'true'}
            onClick={() => toggleCard('published')}
          />
          <StatusCard
            label="Draft"
            value={stats.inactive}
            tone="slate"
            active={statusFilter === 'false'}
            onClick={() => toggleCard('draft')}
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
            <option value="true">Published</option>
            <option value="false">Draft</option>
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
          <Table minWidth={960}>
            <TableHead>
              <Th>Image</Th>
              <Th {...sortHeaderProps('name')}>Product</Th>
              <Th {...sortHeaderProps('sku')}>SKU</Th>
              <Th {...sortHeaderProps('category')}>Category</Th>
              <Th {...sortHeaderProps('variants')}>Variants</Th>
              <Th {...sortHeaderProps('price')}>Price range</Th>
              <Th {...sortHeaderProps('stock')}>Stock</Th>
              <Th {...sortHeaderProps('status')}>Status</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {data.data.map((p) => {
                const prices = p.variants.map((v) => Number(v.price)).filter((n) => !isNaN(n));
                const min = prices.length ? Math.min(...prices) : null;
                const max = prices.length ? Math.max(...prices) : null;
                const toggling =
                  togglePublishedMutation.isPending && togglePublishedMutation.variables?.id === p.id;
                const thumbUrl = p.imageUrl || p.variants.find((v) => v.imageUrl)?.imageUrl || null;
                return (
                  <Tr key={p.id}>
                    <Td>
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {thumbUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumbUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlaceholderIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </Td>
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
                          togglePublishedMutation.mutate({ id: p.id, isPublished: !p.isPublished })
                        }
                        disabled={toggling}
                        title="Click to toggle"
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
                          p.isPublished
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.isPublished ? 'Published' : 'Draft'}
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
        </>
      )}
    </div>
  );
}

// --- Analytics tab ------------------------------------------------------------

const PRODUCT_ANALYTICS_DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last 365 days' },
];

function ProductsAnalyticsTab() {
  const [days, setDays] = useState(30);

  const { data: sales, isLoading: salesLoading, isError: salesError } = useQuery({
    queryKey: ['products-analytics-sales', days],
    queryFn: () => api.get<SalesProductsAnalytics>(`/admin/analytics/sales-products?days=${days}`),
  });

  const { data: lowStockRes, isLoading: lowStockLoading } = useQuery({
    queryKey: ['products-analytics-low-stock'],
    queryFn: () => api.get<Paginated<Product>>('/wholesale/products/admin?lowStock=true&limit=100'),
  });

  const { data: outOfStockRes, isLoading: outOfStockLoading } = useQuery({
    queryKey: ['products-analytics-out-of-stock'],
    queryFn: () => api.get<Paginated<Product>>('/wholesale/products/admin?stockStatus=OUT_OF_STOCK&limit=100'),
  });

  const { data: backorderRes, isLoading: backorderLoading } = useQuery({
    queryKey: ['products-analytics-backorder'],
    queryFn: () => api.get<Paginated<Product>>('/wholesale/products/admin?stockStatus=ON_BACKORDER&limit=100'),
  });

  const bestSellers = [...(sales?.products || [])].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10);
  const lowStockProducts = lowStockRes?.data || [];
  const outOfStockProducts = outOfStockRes?.data || [];
  const backorderProducts = backorderRes?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Product Demand &amp; Stock Health</h2>
          <p className="text-xs text-slate-500">
            What&apos;s selling, what&apos;s not, and what needs restocking.
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          {PRODUCT_ANALYTICS_DAY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Out of Stock" value={outOfStockProducts.length} accent="red" />
        <StatCard label="Running Low" value={lowStockProducts.length} accent="amber" />
        <StatCard label="On Backorder" value={backorderProducts.length} accent="amber" />
        <StatCard
          label="Units Sold"
          value={sales ? sales.products.reduce((sum, p) => sum + p.unitsSold, 0) : 0}
          accent="brand"
        />
      </div>

      <Card>
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Most In-Demand</h3>
          <p className="text-xs text-slate-500">
            Best sellers by units sold — {PRODUCT_ANALYTICS_DAY_OPTIONS.find((o) => o.value === days)?.label.toLowerCase()}.
          </p>
        </div>
        {salesLoading && <LoadingState />}
        {salesError && <ErrorState message="Couldn't load demand data." />}
        {sales && bestSellers.length === 0 && <div className="p-5 text-sm text-slate-500">No sales in this range.</div>}
        {bestSellers.length > 0 && (
          <Table minWidth={620}>
            <TableHead>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th align="right">Units Sold</Th>
              <Th align="right">Revenue</Th>
              <Th align="right">Orders</Th>
              <Th>Stock</Th>
            </TableHead>
            <tbody>
              {bestSellers.map((p, i) => (
                <Tr key={p.productId}>
                  <Td className="font-medium text-slate-900">
                    <span className="mr-2 text-xs text-slate-400">#{i + 1}</span>
                    <Link href={`/admin/products/${p.productId}/edit`} className="hover:underline">
                      {p.name}
                    </Link>
                  </Td>
                  <Td className="text-slate-600">{p.categoryName || '—'}</Td>
                  <Td align="right" className="font-medium text-slate-900">{p.unitsSold}</Td>
                  <Td align="right" className="text-slate-600">{formatUsd(p.revenue)}</Td>
                  <Td align="right" className="text-slate-600">{p.orderCount}</Td>
                  <Td>
                    <Badge status={p.stockStatus} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Out of Stock</h3>
          <p className="text-xs text-slate-500">At least one variant is completely unavailable to buy.</p>
        </div>
        {outOfStockLoading && <LoadingState />}
        {outOfStockProducts.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">Nothing is out of stock right now.</div>
        ) : (
          <Table minWidth={560}>
            <TableHead>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Variants Affected</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {outOfStockProducts.map((p) => (
                <Tr key={p.id}>
                  <Td className="font-medium text-slate-900">{p.name}</Td>
                  <Td className="text-slate-600">{p.category?.name || '—'}</Td>
                  <Td className="text-slate-600">
                    {p.variants
                      .filter((v) => v.stockStatus === 'OUT_OF_STOCK')
                      .map((v) => v.label)
                      .join(', ')}
                  </Td>
                  <Td align="right">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-medium text-brand-600 hover:underline">
                      Restock
                    </Link>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Running Low</h3>
          <p className="text-xs text-slate-500">In stock, but at or below its low-stock threshold.</p>
        </div>
        {lowStockLoading && <LoadingState />}
        {lowStockProducts.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">Nothing is running low right now.</div>
        ) : (
          <Table minWidth={620}>
            <TableHead>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Variant</Th>
              <Th align="right">Quantity Left</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {lowStockProducts.flatMap((p) =>
                p.variants
                  .filter(
                    (v) =>
                      v.stockStatus === 'IN_STOCK' &&
                      v.stockQuantity != null &&
                      v.stockQuantity > 0 &&
                      v.stockQuantity <= (v.lowStockThreshold ?? 10),
                  )
                  .map((v) => (
                    <Tr key={v.id}>
                      <Td className="font-medium text-slate-900">{p.name}</Td>
                      <Td className="text-slate-600">{p.category?.name || '—'}</Td>
                      <Td className="text-slate-600">{v.label}</Td>
                      <Td align="right" className="font-medium text-amber-700">{v.stockQuantity}</Td>
                      <Td align="right">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-medium text-brand-600 hover:underline">
                          Restock
                        </Link>
                      </Td>
                    </Tr>
                  )),
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Least In-Demand</h3>
          <p className="text-xs text-slate-500">
            Published products with zero sales in this range — candidates for a promotion or discontinuing.
          </p>
        </div>
        {sales && sales.slowMovers.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">Everything published has sold in this range.</div>
        ) : (
          <Table minWidth={480}>
            <TableHead>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Added On</Th>
            </TableHead>
            <tbody>
              {(sales?.slowMovers || []).map((p) => (
                <Tr key={p.productId}>
                  <Td className="font-medium text-slate-900">
                    <Link href={`/admin/products/${p.productId}/edit`} className="hover:underline">
                      {p.name}
                    </Link>
                  </Td>
                  <Td className="text-slate-600">{p.categoryName || '—'}</Td>
                  <Td className="text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

