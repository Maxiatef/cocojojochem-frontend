import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Product } from '@/lib/types';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';
import { ProductCard } from '@/components/storefront/ProductCard';
import { JsonLd, breadcrumbSchema, productSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';

/**
 * Keywords a formulator would actually type. Built from the product's own
 * data — its INCI name and CAS number are how this stuff is searched for in
 * this industry, and they're far less contested than the product name.
 *
 * `product.seo.tags` comes first: those are the terms an admin typed by hand
 * in the product editor, so they beat anything derived.
 */
function productKeywords(product: Product): string[] {
  const name = product.name;
  return [
    ...(product.seo?.tags || []),
    name,
    `${name} wholesale`,
    `${name} bulk`,
    `buy ${name} in bulk`,
    `${name} supplier`,
    product.inciName || '',
    product.inciName ? `${product.inciName} INCI` : '',
    product.casNumber ? `CAS ${product.casNumber}` : '',
    product.botanicalName || '',
    product.category?.name || '',
    product.category ? `bulk ${product.category.name.toLowerCase()}` : '',
    ...(product.functions || []).map((f) => f.name),
    ...(product.certifications || []).map((c) => `${c.name} ${name}`),
  ].filter(Boolean);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await serverFetch<Product>(`/wholesale/products/${params.slug}`, {
    cache: 'no-store',
  });

  if (!product) {
    return pageMetadata({
      title: 'Product Not Found',
      description: `This product is no longer listed. Browse the full ${SITE_NAME} wholesale ingredient catalog.`,
      path: `/products/${params.slug}`,
      noIndex: true,
    });
  }

  // The admin's per-product SEO fields (ProductSeo) were already being stored
  // and shipped to the browser, then discarded here. They now take priority
  // over the derived defaults, so anything typed in the product editor's SEO
  // tab actually reaches search engines.
  const title = product.seo?.seoTitle || `${product.name} — Wholesale & Bulk`;

  // A search snippet reads best (and this project's own SEO analyzer scores
  // highest) between 120 and 160 characters. Product short descriptions are
  // often much shorter than that, so a factual trade-terms sentence is
  // appended rather than leaving a thin 80-character snippet. Nothing here is
  // invented — it's the product's own INCI/name plus terms that apply to the
  // whole catalog.
  const authored = (product.seo?.metaDescription || product.shortDescription || '').trim();
  const suffix = `Buy wholesale in bulk and drum sizes${
    product.inciName ? ` — INCI ${product.inciName}` : ''
  }. Trade pricing and fast US shipping.`;
  const description = clampDescription(
    authored.length >= 120 ? authored : [authored, suffix].filter(Boolean).join(' '),
    `Buy ${product.name} wholesale in bulk and drum quantities.${
      product.inciName ? ` INCI: ${product.inciName}.` : ''
    } Trade pricing, spec data and fast US shipping from ${SITE_NAME}.`,
  );

  return pageMetadata({
    title,
    description,
    path: `/products/${product.slug}`,
    keywords: productKeywords(product),
    images: [
      product.seo?.socialImageUrl,
      product.imageUrl,
      ...(product.gallery || []).map((g) => g.url),
    ],
  });
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await serverFetch<Product>(`/wholesale/products/${params.slug}`, {
    cache: 'no-store',
  });
  if (!product) notFound();

  const related = await serverFetch<Product[]>(`/wholesale/products/${params.slug}/related?limit=4`, {
    cache: 'no-store',
  });

  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    ...(product.category
      ? [{ name: product.category.name, path: `/categories/${product.category.slug}` }]
      : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      {/* Product + BreadcrumbList: this is what upgrades the Google listing to
          a rich result showing price, availability and a readable path. */}
      <JsonLd data={[productSchema(product), breadcrumbSchema(breadcrumbTrail)]} />

      {/* Client-side <Link> rather than a raw <a> so the breadcrumb doesn't
          force a full document reload, and the visible trail now mirrors the
          structured data above (including the category level). */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-soft">
        <Link href="/products" className="hover:text-olive-700">
          Products
        </Link>
        {product.category && (
          <>
            {' / '}
            <Link href={`/categories/${product.category.slug}`} className="hover:text-olive-700">
              {product.category.name}
            </Link>
          </>
        )}
        {' / '}
        <span>{product.name}</span>
      </nav>

      <ProductDetailClient product={product} />

      {related && related.length > 0 && (
        <section className="mt-20 border-t border-sand-200 pt-12">
          <h2 className="mb-8 font-display text-2xl text-ink">You May Also Need</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
