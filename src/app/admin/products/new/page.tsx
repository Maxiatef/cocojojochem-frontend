'use client';

import { ProductForm } from '@/components/admin/ProductForm';
import { PageHeader } from '@/components/ui';
import { RequireAdmin } from '@/components/AdminShell';

function NewProductPageContent() {
  return (
    <div>
      <PageHeader title="Add Product" description="Create a new wholesale catalog product." />
      <ProductForm />
    </div>
  );
}

// Creating/editing a product is ADMIN-only server-side, so the form is gated
// too — sales can reach product links from the dashboard's stock widgets.
export default function NewProductPage() {
  return (
    <RequireAdmin>
      <NewProductPageContent />
    </RequireAdmin>
  );
}
