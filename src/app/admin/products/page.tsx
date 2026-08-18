'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Paginated, Product } from '@/lib/types';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  PageHeader,
  Pagination,
  Table,
  TableHead,
  Td,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () =>
      api.get<Paginated<Product>>(
        `/wholesale/products/admin?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      ),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-products'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/wholesale/products/${id}`),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.patch(`/wholesale/products/${id}`, { isActive }),
    onSuccess: () => invalidate(),
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

      <div className="mb-4 max-w-sm">
        <TextField
          label="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, INCI, or SKU…"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load products." />}
      {data && data.data.length === 0 && <EmptyState message="No products found." />}

      {data && data.data.length > 0 && (
        <Card>
          <Table minWidth={780}>
            <TableHead>
              <Th>Product</Th>
              <Th>SKU</Th>
              <Th>Category</Th>
              <Th>Variants</Th>
              <Th>Price range</Th>
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

