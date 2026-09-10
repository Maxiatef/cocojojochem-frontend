'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatUsd } from '@/lib/pricing';
import { Product } from '@/lib/types';
import { RequireStaff, useIsAdmin } from '@/components/AdminShell';
import {
  Badge,
  Button,
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
import { EditIcon } from '@/components/icons';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value || <span className="text-slate-400">—</span>}</dd>
    </div>
  );
}

// Read-only product view. Mirrors the category detail page: a single GET and
// no writes, so sales can open it from the products list's View button and
// look up pricing, stock, SKUs and chemical identifiers when quoting a
// customer — without reaching the ADMIN-only editor.
function ViewProductContent({ params }: { params: { id: string } }) {
  const isAdmin = useIsAdmin();
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['admin-product-view', params.id],
    queryFn: () => api.get<Product>(`/wholesale/products/by-id/${params.id}`),
  });

  const variants = product?.variants || [];
  const inStockCount = variants.filter((v) => v.stockStatus === 'IN_STOCK').length;
  const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0);
  const prices = variants.map((v) => Number(v.effectivePrice ?? v.price)).filter((n) => Number.isFinite(n));
  const priceRange =
    prices.length === 0
      ? '—'
      : Math.min(...prices) === Math.max(...prices)
        ? formatUsd(Math.min(...prices))
        : `${formatUsd(Math.min(...prices))} – ${formatUsd(Math.max(...prices))}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title={product ? product.name : 'View Product'}
          description="Product details, variants, pricing and stock."
        />
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-sm font-medium text-brand-700 hover:underline">
            &larr; Back to Products
          </Link>
          {/* Editing is admin-only, so the shortcut only appears for admins. */}
          {isAdmin && product && (
            <Link href={`/admin/products/${product.id}/edit`}>
              <Button variant="secondary" size="sm" icon={EditIcon}>
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this product." />}

      {product && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Product Details</h2>
              <div className="flex flex-wrap gap-4">
                {product.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-24 w-24 flex-shrink-0 rounded-lg border border-slate-200 object-cover"
                  />
                )}
                <dl className="grid min-w-[260px] flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Row label="Name" value={product.name} />
                  <Row label="SKU" value={product.sku} />
                  <Row label="Slug" value={product.slug} />
                  <Row label="Brand" value={product.brand} />
                  <Row label="Category" value={product.category?.name} />
                  <Row
                    label="Status"
                    value={
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                    }
                  />
                </dl>
              </div>
              {product.shortDescription && (
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  {product.shortDescription}
                </p>
              )}
            </Card>

            {/* The identifiers a formulator actually asks for on a quote call. */}
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Chemical Identity</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                <Row label="INCI Name" value={product.inciName} />
                <Row label="Botanical Name" value={product.botanicalName} />
                <Row label="CAS Number" value={product.casNumber} />
              </dl>
              {product.specs && product.specs.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Specifications
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                    {product.specs.map((spec) => (
                      <Row key={spec.id} label={spec.key} value={spec.value} />
                    ))}
                  </dl>
                </div>
              )}
            </Card>

            <Card>
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Variants &amp; Pricing</h2>
                <p className="text-xs text-slate-500">
                  {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
                </p>
              </div>
              {variants.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-slate-400">No variants on this product.</p>
              ) : (
                <Table minWidth={720}>
                  <TableHead>
                    <Th>Variant</Th>
                    <Th>SKU</Th>
                    <Th align="right">Price</Th>
                    <Th align="right">Stock</Th>
                    <Th>Availability</Th>
                    <Th align="right">Weight</Th>
                  </TableHead>
                  <tbody>
                    {variants.map((v) => (
                      <Tr key={v.id}>
                        <Td className="font-medium text-slate-900">
                          {v.label}
                          {v.isSoldByDrum && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                              drum
                            </span>
                          )}
                        </Td>
                        <Td className="text-slate-500">{v.sku}</Td>
                        <Td align="right">
                          {v.salePrice ? (
                            <span>
                              <span className="text-slate-400 line-through">{formatUsd(Number(v.price))}</span>{' '}
                              <span className="font-medium text-slate-900">{formatUsd(Number(v.salePrice))}</span>
                            </span>
                          ) : (
                            <span className="font-medium text-slate-900">{formatUsd(Number(v.price))}</span>
                          )}
                        </Td>
                        <Td align="right" className="text-slate-600">
                          {v.stockQuantity ?? '—'}
                        </Td>
                        <Td>
                          <Badge status={v.stockStatus} />
                        </Td>
                        <Td align="right" className="text-slate-600">
                          {v.weightLb ? `${Number(v.weightLb)} lb` : '—'}
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <StatCard label="Variants" value={variants.length} />
            <StatCard label="Price Range" value={priceRange} accent="amber" />
            <StatCard label="In Stock Variants" value={`${inStockCount} / ${variants.length}`} />
            <StatCard label="Total Units" value={totalStock} accent="slate" />

            {product.functions && product.functions.length > 0 && (
              <Card className="p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Functions</h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.functions.map((f) => (
                    <span
                      key={f.id}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {f.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {product.certifications && product.certifications.length > 0 && (
              <Card className="p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.certifications.map((c) => (
                    <span key={c.id} className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                      {c.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewProductPage({ params }: { params: { id: string } }) {
  return (
    <RequireStaff>
      <ViewProductContent params={params} />
    </RequireStaff>
  );
}
