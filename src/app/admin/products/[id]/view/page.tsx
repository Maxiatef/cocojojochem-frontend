'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product, ProductVariant } from '@/lib/types';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { RequirePermission, useCan } from '@/components/AdminShell';
import { formatDateTime, useSiteTimezone } from '@/lib/siteTimezone';
import { ImagePlaceholderIcon } from '@/components/icons';

/**
 * Read-only product detail.
 *
 * The editor at ../edit is gated on canEditProduct, so an account granted
 * canViewProducts alone previously had nowhere to go — the product list showed
 * rows it could not open. This page is that destination: the same information,
 * with no inputs, no save and no delete.
 *
 * It is a separate page rather than a disabled ProductForm because a form full
 * of greyed-out inputs reads as broken rather than as deliberate, and because
 * a disabled input is a client-side courtesy, not a boundary. Nothing here can
 * submit anything.
 *
 * Someone who *can* edit is sent to the editor instead — two detail views for
 * the same product would just be a place for the two to drift apart.
 */
function ProductViewContent({ params }: { params: { id: string } }) {
  const canEdit = useCan('canEditProduct');
  const tz = useSiteTimezone();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-product', params.id],
    queryFn: () => api.get<Product>(`/wholesale/products/by-id/${params.id}`),
  });

  return (
    <div>
      <PageHeader
        title={data?.name || 'Product'}
        description="Read-only view of this product's details, variants, images and documents."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-sci-blue underline-offset-2 hover:underline"
        >
          ← Back to products
        </Link>
        {canEdit && data && (
          <Link
            href={`/admin/products/${data.id}/edit`}
            className="text-sm font-medium text-sci-blue underline-offset-2 hover:underline"
          >
            Open the editor
          </Link>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this product." />}

      {data && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                {data.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={data.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlaceholderIcon className="h-7 w-7 text-slate-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge status={data.isPublished ? 'PUBLISHED' : 'DRAFT'} />
                  {data.isFeatured && <Badge status="Featured" />}
                  <Badge status={data.visibility} />
                </div>

                <Facts
                  rows={[
                    ['SKU', data.sku],
                    ['Slug', data.slug],
                    ['Category', categoryPath(data)],
                    ['INCI name', data.inciName],
                    ['Botanical name', data.botanicalName],
                    ['CAS number', data.casNumber],
                    ['Brand', data.brand],
                    ['Scheduled publish', formatDateTime(data.scheduledPublishAt, tz)],
                    ['Created', formatDateTime(data.createdAt, tz)],
                  ]}
                />
              </div>
            </div>
          </Card>

          {(data.shortDescription || data.description || data.chemicalDescriptions) && (
            <Section title="Descriptions">
              <div className="space-y-5">
                <Prose label="Short description" value={data.shortDescription} />
                <Prose label="Description" value={data.description} />
                <Prose label="Chemical description" value={data.chemicalDescriptions} />
              </div>
            </Section>
          )}

          <Section title={`Variants (${data.variants.length})`} padded={false}>
            {data.variants.length === 0 ? (
              <div className="p-6">
                <EmptyState message="No variants." />
              </div>
            ) : (
              <Table minWidth={860}>
                <TableHead>
                  <Th>Label</Th>
                  <Th>SKU</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Weight</Th>
                  <Th>Limit</Th>
                  <Th>Added</Th>
                </TableHead>
                <tbody>
                  {data.variants.map((v) => (
                    <Tr key={v.id}>
                      <Td>
                        <span className="font-medium text-slate-900">{v.label}</span>
                        {v.isSoldByDrum && (
                          <span className="ml-2 text-xs text-slate-500">sold by drum</span>
                        )}
                      </Td>
                      <Td className="text-slate-600">{v.sku}</Td>
                      <Td className="text-slate-600">{priceOf(v)}</Td>
                      <Td>
                        <Badge status={v.stockStatus} />
                        {v.stockQuantity != null && (
                          <span className="ml-2 text-xs tabular-nums text-slate-500">
                            {v.stockQuantity}
                          </span>
                        )}
                      </Td>
                      <Td className="text-slate-600">{v.weightLb ? `${v.weightLb} lb` : '—'}</Td>
                      <Td className="text-slate-600">
                        {v.limitPerOrder && v.maxOrderQuantity ? `${v.maxOrderQuantity} / order` : '—'}
                      </Td>
                      <Td className="whitespace-nowrap text-slate-600">
                        {formatDateTime(v.createdAt, tz)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Section>

          {!!data.specs?.length && (
            <Section title="Specifications">
              <Facts rows={data.specs.map((s) => [s.key, s.value] as const)} />
            </Section>
          )}

          {(!!data.functions?.length || !!data.certifications?.length) && (
            <Section title="Functions & certifications">
              <div className="space-y-4">
                <Chips label="Functions" items={(data.functions ?? []).map((f) => f.name)} />
                <Chips
                  label="Certifications"
                  items={(data.certifications ?? []).map((c) => c.name)}
                />
              </div>
            </Section>
          )}

          {!!data.gallery?.length && (
            <Section title={`Gallery (${data.gallery.length})`}>
              <div className="flex flex-wrap gap-3">
                {data.gallery.map((g) => (
                  <div
                    key={g.id}
                    className="h-24 w-24 overflow-hidden rounded-lg bg-slate-100"
                    title={g.altText || undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.url} alt={g.altText || ''} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {!!data.documents?.length && (
            <Section title={`Documents (${data.documents.length})`}>
              <ul className="space-y-2">
                {data.documents.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge status={d.type} />
                    {/* Opening a document is still a read. New tab so the admin
                        doesn't lose their place in this page. */}
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sci-blue underline-offset-2 hover:underline"
                    >
                      {d.label || d.url.split('/').pop()}
                    </a>
                    {d.certification && (
                      <span className="text-xs text-slate-500">for {d.certification.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {data.seo && (
            <Section title="SEO">
              <Facts
                rows={[
                  ['Focus keyphrase', data.seo.focusKeyphrase],
                  ['SEO title', data.seo.seoTitle],
                  ['Meta description', data.seo.metaDescription],
                  ['Social title', data.seo.socialTitle],
                  ['Social description', data.seo.socialDescription],
                  ['Tags', data.seo.tags?.join(', ') || null],
                ]}
              />
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  padded = true,
}: {
  title: string;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <Card className={padded ? 'p-6' : 'overflow-hidden'}>
      <h2 className={`text-sm font-semibold text-slate-900 ${padded ? 'mb-4' : 'px-6 pb-4 pt-6'}`}>
        {title}
      </h2>
      {children}
    </Card>
  );
}

/** Label/value pairs. Rows with no value are dropped rather than shown empty. */
function Facts({ rows }: { rows: readonly (readonly [string, string | null | undefined])[] }) {
  const present = rows.filter(([, value]) => value != null && value !== '');
  if (present.length === 0) return <p className="text-sm text-slate-400">No details recorded.</p>;
  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {present.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
          <dd className="break-words text-sm text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Prose({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      {/* Descriptions are authored as HTML in the editor, so they are rendered
          as HTML here — displaying the raw tags would make the field useless.
          Same trust boundary as the storefront, which already renders them. */}
      <div
        className="prose prose-sm max-w-none text-slate-700"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

function Chips({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((name) => (
          <span
            key={name}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function categoryPath(p: Product): string | null {
  if (!p.category) return null;
  return p.category.parent ? `${p.category.parent.name} › ${p.category.name}` : p.category.name;
}

function priceOf(v: ProductVariant): string {
  const price = `$${v.price}`;
  if (!v.salePrice) return price;
  // Struck-through markup would need JSX; the arrow reads clearly enough and
  // keeps this a plain string alongside the other cells.
  return `${price} → $${v.salePrice}`;
}

export default function ProductViewPage({ params }: { params: { id: string } }) {
  return (
    <RequirePermission permission="canViewProducts">
      <ProductViewContent params={params} />
    </RequirePermission>
  );
}
