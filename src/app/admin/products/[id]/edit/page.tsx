'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Product } from '@/lib/types';
import { ProductForm } from '@/components/admin/ProductForm';
import { Button, Card, ConfirmDialog, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { RequireAdmin } from '@/components/AdminShell';
import { RecordHistory } from '@/components/admin/RecordHistory';
import { TrashIcon } from '@/components/icons';

function EditProductPageContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-product', params.id],
    queryFn: () => api.get<Product>(`/wholesale/products/by-id/${params.id}`),
  });

  // Deleting lives here rather than on the list, because this page is now the
  // product's only detail view — you delete a product while looking at it,
  // not from a row you might have mis-clicked.
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/wholesale/products/${params.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products-stats'] });
      setConfirmingDelete(false);
      router.push('/admin/products');
    },
    onError: (err) => {
      setConfirmingDelete(false);
      setDeleteError(getFriendlyErrorMessage(err));
    },
  });

  return (
    <div>
      <PageHeader
        title={data?.name || 'Product'}
        description="View and edit this product's details, variants, images and documents."
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this product." />}

      {deleteError && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{deleteError}</div>
      )}

      {data && (
        <ProductForm
          product={data}
          headerActions={
            <Button
              type="button"
              variant="danger"
              icon={TrashIcon}
              onClick={() => setConfirmingDelete(true)}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          }
        />
      )}

      {/* Who changed this product, and what — the reverse direction of the
          audit log's entityName/entityId link. */}
      {data && (
        <div className="mt-6">
          {/* Card ships with no padding of its own — every other call site
              supplies it. */}
          <Card className="p-6">
            <RecordHistory entityName="Product" entityId={data.id} />
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete product"
        message={`Delete "${data?.name}"? This also removes all its variants, images and documents. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

// This page is both the view and the editor — there is no separate read-only
// product page. Editing is ADMIN-only server-side, so the whole page is gated
// to match rather than showing controls the API would refuse.
export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <RequireAdmin>
      <EditProductPageContent params={params} />
    </RequireAdmin>
  );
}
