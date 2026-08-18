'use client';

import { ProductForm } from '@/components/admin/ProductForm';
import { PageHeader } from '@/components/ui';

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="Add Product" description="Create a new wholesale catalog product." />
      <ProductForm />
    </div>
  );
}
