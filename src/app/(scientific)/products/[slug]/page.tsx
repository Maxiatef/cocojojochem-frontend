import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Product } from '@/lib/types';
import { JsonLd, breadcrumbSchema, productSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, absoluteUrl, clampDescription, pageMetadata } from '@/lib/seo';
import { OurProductDetail, ReferenceProductDetail } from '@/components/ocean/product/ProductDetail';
import { resolveReference } from '@/components/ocean/product/resolveReference';

/**
 * A single product, in the ocean markup (reference retail-page.tsx
 * `Ingredient`): one of our backend products, or a supplier reference from
 * the copied reference catalog (noindex,follow).
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

  // notFound() here, not a "Product Not Found" Metadata object.
  //
  // The page body already calls notFound(), but by the time it runs the
  // response has begun streaming and the status is fixed — so a missing
  // product answered HTTP 200 with a titled, heading-less page. That is a
  // soft 404: Google treats it as a quality problem and will happily index
  // the empty shell. generateMetadata runs before the stream opens, which is
  // the last point a real 404 can still be sent.
  if (!product) {
    // Not ours: maybe a supplier reference library entry (prototype URLs use
    // the supplier's item code here). Kept out of the index — it's another
    // supplier's catalog — but its links are followed.
    const ref = resolveReference(params.slug);
    if (!ref) notFound();
    return {
      ...pageMetadata({
        title: `${ref.name} — Supplier Reference`,
        description: clampDescription(
          `${ref.name}${ref.inci ? ` (INCI ${ref.inci})` : ''} from our supplier reference library. COCOJOJO can source it on request; price, grade and availability are confirmed before anything is charged.`,
          `${ref.name} — supplier reference, sourced on request by ${SITE_NAME}.`,
        ),
        path: `/products/${ref.slug}`,
      }),
      robots: { index: false, follow: true },
    };
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
  if (!product) {
    const ref = resolveReference(params.slug);
    if (!ref) notFound();
    return (
      <>
        {/* The reference's own structured data for a supplier reference: a
            DefinedTerm, never a Product (it is not ours to sell). */}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'DefinedTerm',
            name: ref.name,
            description: ref.description,
            url: absoluteUrl(`/products/${ref.slug}`),
          }}
        />
        <ReferenceProductDetail p={ref} />
      </>
    );
  }

  const related = await serverFetch<Product[]>(
    `/wholesale/products/${params.slug}/related?limit=4`,
    { cache: 'no-store' },
  );

  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    ...(product.category?.parent
      ? [
          {
            name: product.category.parent.name,
            path: `/categories/${product.category.parent.slug}`,
          },
        ]
      : []),
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
      <OurProductDetail product={product} related={related || []} />
    </>
  );
}
