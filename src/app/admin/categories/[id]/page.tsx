'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RequireAdmin } from '@/components/AdminShell';
import { Category, Product } from '@/lib/types';
import {
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  StatCard,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui';

interface CategoryDetail extends Category {
  parent: Category | null;
  children: Category[];
  products: Product[];
}

export default function ViewCategoryPage({ params }: { params: { id: string } }) {
  const { data: category, isLoading, isError } = useQuery({
    queryKey: ['admin-category-detail', params.id],
    queryFn: () => api.get<CategoryDetail>(`/wholesale/categories/id/${params.id}`),
  });

  const products = category?.products || [];
  const inStock = products.filter((p) => p.variants.some((v) => v.stockStatus === 'IN_STOCK')).length;

  return (
    <RequireAdmin>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title={category ? category.name : 'View Category'} description="Category details and its products." />
        <Link href="/admin/categories" className="text-sm font-medium text-brand-700 hover:underline">
          &larr; Back to Categories
        </Link>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this category." />}

      {category && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Category Details</h2>
              <div className="flex gap-4">
                {category.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-24 w-24 flex-shrink-0 rounded-lg border border-slate-200 object-cover"
                  />
                )}
                <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium text-slate-900">{category.name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Slug</dt>
                    <dd className="font-medium text-slate-900">{category.slug}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Parent Category</dt>
                    <dd className="font-medium text-slate-900">{category.parent ? category.parent.name : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Sort Order</dt>
                    <dd className="font-medium text-slate-900">{category.sortOrder}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-500">Description</dt>
                    <dd className="font-medium text-slate-900">{category.description || '—'}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            {category.children.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Subcategories</h2>
                <div className="flex flex-wrap gap-2">
                  {category.children.map((c) => (
                    <Link
                      key={c.id}
                      href={`/admin/categories/${c.id}`}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <div className="border-b border-slate-100 p-4">
                <h2 className="text-sm font-semibold text-slate-900">Products in this Category</h2>
              </div>
              {products.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">No products in this category yet.</div>
              ) : (
                <Table minWidth={640}>
                  <TableHead>
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th>Variants</Th>
                    <Th>Status</Th>
                  </TableHead>
                  <tbody>
                    {products.map((p) => (
                      <Tr key={p.id}>
                        <Td className="font-medium text-slate-900">
                          <Link href={`/admin/products/${p.id}/edit`} className="hover:text-brand-700 hover:underline">
                            {p.name}
                          </Link>
                        </Td>
                        <Td className="text-slate-500">{p.sku}</Td>
                        <Td className="text-slate-600">{p.variants.length}</Td>
                        <Td className="text-slate-600">{p.isPublished ? 'Published' : 'Draft'}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <StatCard label="Total Products" value={products.length} />
            <StatCard label="Products In Stock" value={inStock} accent="amber" />
            <StatCard label="Subcategories" value={category.children.length} accent="slate" />
          </div>
        </div>
      )}
    </RequireAdmin>
  );
}
