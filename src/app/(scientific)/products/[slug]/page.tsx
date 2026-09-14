import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Product } from '@/lib/types';
import { ProductBuyPanel } from '@/components/scientific/ProductBuyPanel';
import { ProductTile } from '@/components/scientific/ProductTile';
import { JsonLd, breadcrumbSchema, productSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { Container, Eyebrow, SciButton } from '@/components/scientific/primitives';

/**
 * A single product, in the Scientific edition.
 *
 * The metadata block below is unchanged from the storefront version — the
 * per-product SEO overrides, the description clamping and the derived
 * keywords are all load-bearing and have nothing to do with the visual
 * design. Only the page body moved.
 */

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

  // The admin's per-product SEO fields (ProductSeo) take priority over the
  // derived defaults, so anything typed in the product editor's SEO tab
  // actually reaches search engines.
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

  const related = await serverFetch<Product[]>(
    `/wholesale/products/${params.slug}/related?limit=4`,
    { cache: 'no-store' },
  );

  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    ...(product.category
      ? [{ name: product.category.name, path: `/categories/${product.category.slug}` }]
      : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <>
      {/* Product + BreadcrumbList: this is what upgrades the Google listing to
          a rich result showing price, availability and a readable path. */}
      <JsonLd data={[productSchema(product), breadcrumbSchema(breadcrumbTrail)]} />

      <section className="bg-white pt-8">
        <Container>
          {/* Client-side <Link> rather than a raw <a> so the breadcrumb doesn't
              force a full document reload, and the visible trail mirrors the
              structured data above (including the category level). */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 font-sci-body text-sci-label text-sci-muted"
          >
            <Link href="/products" className="text-sci-blue hover:underline">
              Products
            </Link>
            {product.category && (
              <>
                <span aria-hidden>/</span>
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="text-sci-blue hover:underline"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span aria-hidden>/</span>
            <span className="text-sci-navy">{product.name}</span>
          </nav>
        </Container>
      </section>

      <section className="bg-white py-10 md:py-14">
        <Container>
          <ProductBuyPanel product={product} />
        </Container>
      </section>

      {related && related.length > 0 && (
        <section className="border-t border-sci-border bg-sci-pale py-16">
          <Container className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <Eyebrow>Related materials</Eyebrow>
              <h2 className="font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy">
                You may also need
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Contact / Request a quote */}
      <section className="bg-white py-16">
        <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-6">
            <Eyebrow>Need a different grade or volume?</Eyebrow>
            <p className="font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy md:text-sci-heading">
              Tell us the specification
              <br />
              and we&rsquo;ll confirm what we can supply.
            </p>
          </div>
          <SciButton href="/quote-request" className="shrink-0">
            Request a quote →
          </SciButton>
        </Container>
      </section>
    </>
  );
}
