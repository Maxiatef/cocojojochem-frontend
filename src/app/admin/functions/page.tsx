'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Paginated, Product, ProductFunction } from '@/lib/types';
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
  Pagination,
  SelectField,
  Table,
  TableHead,
  Td,
  TextAreaField,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { EditIcon, EyeIcon, ImagePlaceholderIcon, PlusIcon, TrashIcon } from '@/components/icons';

type FunctionSort = 'name_asc' | 'name_desc' | 'products_desc' | 'products_asc';

interface FunctionFormState {
  id: number | null;
  name: string;
  slug: string;
  description: string;
}

const EMPTY_FORM: FunctionFormState = { id: null, name: '', slug: '', description: '' };

export default function FunctionsAdminPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FunctionFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductFunction | null>(null);
  const [viewingFunction, setViewingFunction] = useState<ProductFunction | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FunctionSort>('name_asc');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-functions', search, sort, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      params.set('sort', sort);
      if (search) params.set('search', search);
      return api.get<Paginated<ProductFunction>>(`/wholesale/functions?${params.toString()}`);
    },
  });

  function resetPageAnd<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-functions'] });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/wholesale/functions', body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.patch(`/wholesale/functions/${id}`, body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/wholesale/functions/${id}`),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
    },
  });

  function openCreateModal() {
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(f: ProductFunction) {
    setForm({ id: f.id, name: f.name, slug: f.slug, description: f.description || '' });
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
    };
    if (form.id) {
      updateMutation.mutate({ id: form.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const functions = data?.data || [];
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title="Functions" description="Manage the 'shop by chemical function' tags." />
        <Button onClick={openCreateModal} icon={PlusIcon}>
          Add Function
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <TextField
            label="Search"
            value={search}
            onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
            placeholder="Search by name…"
          />
        </div>
        <div className="w-56">
          <SelectField
            label="Sort"
            value={sort}
            onChange={(e) => resetPageAnd(setSort)(e.target.value as FunctionSort)}
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="products_desc">Most products</option>
            <option value="products_asc">Fewest products</option>
          </SelectField>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load functions." />}
      {data && functions.length === 0 && <EmptyState message="No functions yet." />}

      {data && functions.length > 0 && (
        <Card>
          <Table minWidth={560}>
            <TableHead>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Products</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {functions.map((f) => (
                <Tr key={f.id}>
                  <Td className="font-medium text-slate-900">{f.name}</Td>
                  <Td className="text-slate-500">{f.slug}</Td>
                  <Td className="text-slate-600">{f.productCount ?? 0}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1.5">
                      <IconButton icon={EyeIcon} label="View Products" onClick={() => setViewingFunction(f)} />
                      <IconButton icon={EditIcon} label="Edit" onClick={() => openEditModal(f)} />
                      <IconButton
                        icon={TrashIcon}
                        label="Delete"
                        variant="danger"
                        onClick={() => setPendingDelete(f)}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>

          <Pagination
            page={page}
            totalPages={data?.pagination.totalPages || 1}
            onPageChange={setPage}
            totalItems={data?.pagination.total}
            itemLabel="function"
          />
        </Card>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={form.id ? 'Edit Function' : 'Add Function'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Slug"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <TextAreaField
            label="Description (optional)"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {form.id ? 'Save Changes' : 'Create Function'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete function"
        message={`Delete function "${pendingDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />

      {viewingFunction && (
        <FunctionProductsModal fn={viewingFunction} onClose={() => setViewingFunction(null)} />
      )}
    </div>
  );
}

function FunctionProductsModal({ fn, onClose }: { fn: ProductFunction; onClose: () => void }) {
  // Uses the admin product listing (not the public /functions/:slug/products
  // endpoint) so unpublished/draft products tagged with this function still
  // show up here — an admin view of "all products" shouldn't silently hide
  // drafts the way the public storefront panel does.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['function-products-admin', fn.slug],
    queryFn: () =>
      api.get<{ data: Product[]; pagination: { total: number } }>(
        `/wholesale/products/admin?functionSlug=${encodeURIComponent(fn.slug)}&page=1&limit=200`,
      ),
  });

  const products = data?.data || [];

  return (
    <Modal open onClose={onClose} title={`Products — ${fn.name}`} size="lg">
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load products for this function." />}
      {data && products.length === 0 && <EmptyState message="No products are tagged with this function yet." />}

      {products.length > 0 && (
        <div className="space-y-2">
          {products.map((p) => {
            const prices = p.variants.map((v) => Number(v.effectivePrice ?? v.price)).filter((n) => !isNaN(n));
            const minPrice = prices.length ? Math.min(...prices) : null;
            const maxPrice = prices.length ? Math.max(...prices) : null;
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlaceholderIcon className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    SKU: {p.sku}
                    {p.category && <> · {p.category.name}</>}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {minPrice != null
                      ? minPrice === maxPrice
                        ? `$${minPrice.toFixed(2)}`
                        : `$${minPrice.toFixed(2)} – $${(maxPrice as number).toFixed(2)}`
                      : '—'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.variants.length} variant{p.variants.length === 1 ? '' : 's'}
                  </p>
                </div>
                {!p.isPublished && <Badge status="UNPUBLISHED" />}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
