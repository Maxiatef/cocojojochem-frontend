'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { ProductForm } from '@/components/admin/ProductForm';
import { ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { RequireAdmin } from '@/components/AdminShell';

function EditProductPageContent({ params }: { params: { id: string } }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-product', params.id],
    queryFn: () => api.get<Product>(`/wholesale/products/by-id/${params.id}`),
  });

  return (
    <div>
      <PageHeader title="Edit Product" description="Update this product's details, tags, and variants." />
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this product." />}
      {data && <ProductForm product={data} />}
    </div>
  );
}

// Creating/editing a product is ADMIN-only server-side, so the form is gated
// too — sales can reach product links from the dashboard's stock widgets.
export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <RequireAdmin>
      <EditProductPageContent params={params} />
    </RequireAdmin>
  );
}
