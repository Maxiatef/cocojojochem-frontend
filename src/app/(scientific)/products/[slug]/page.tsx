import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Product } from '@/lib/types';
import { BookOpen, Download, FileText } from 'lucide-react';
import { ProductCard } from '@/components/gloss/ProductCard';
import { ProductDetailHero } from '@/components/gloss/catalog/ProductDetailHero';
import {
  documentKind,
  documentTitle,
  fileExtension,
  stockLabel,
  unitPrice,
} from '@/components/gloss/catalog/productInfo';
import { JsonLd, breadcrumbSchema, productSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';
import { formatUsd } from '@/lib/pricing';

/**
 * A single product, in the Gloss Studio markup (prototype
 * /products/jojoba-golden-retail).
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
  if (!product) notFound();

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

/** "Same category · Emulsifier" — names the shared function where there is one. */
function relatedReason(
  by: NonNullable<Product['relatedBy']>,
  current: Product,
  other: Product,
): string {
  const parts: string[] = [];
  if (by.includes('category') && other.category) parts.push(`Same category: ${other.category.name}`);
  if (by.includes('brand') && other.brand) parts.push(`Same brand: ${other.brand}`);
  if (by.includes('function')) {
    const mine = new Set((current.functions || []).map((f) => f.id));
    const shared = (other.functions || []).filter((f) => mine.has(f.id)).map((f) => f.name);
    parts.push(shared.length ? `Also ${shared.slice(0, 2).join(', ')}` : 'Similar function');
  }
  return parts.join(' · ');
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


  const documents = product.documents || [];
  const specRows = specificationRows(product);
  const faq = faqItems(product);
  const descriptionParas = (product.description || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const docRequestHref = `/contact?subject=${encodeURIComponent(
    `Documentation request: ${product.name}`,
  )}`;

  return (
    <>
      {/* Product + BreadcrumbList: this is what upgrades the Google listing to
          a rich result showing price, availability and a readable path. */}
      <JsonLd data={[productSchema(product), breadcrumbSchema(breadcrumbTrail)]} />

      <nav className="r-breadcrumb r-wrap" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/products">Shop</Link>
        {product.category?.parent && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/categories/${product.category.parent.slug}`}>
              {product.category.parent.name}
            </Link>
          </>
        )}
        {product.category && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link>
          </>
        )}
      </nav>

      <ProductDetailHero product={product} />

      <nav className="r-wrap r-product-tabs" aria-label="Product information">
        <a href="#overview">Overview</a>
        <a href="#specifications">Specifications</a>
        <a href="#formulation">Formulation</a>
        <a href="#documents">Documents</a>
        <a href="#questions">Questions</a>
      </nav>

      <div className="r-wrap r-detail-content">
        <div>
          <section id="overview">
            <span className="r-eyebrow">Get to know the ingredient</span>
            <h2>
              Small details.
              <br />
              Better decisions.
            </h2>
            {descriptionParas.length > 0 ? (
              descriptionParas.map((para, i) => (
                <p key={i} className="g-cat-pre">
                  {para}
                </p>
              ))
            ) : (
              <p>
                {product.shortDescription ||
                  `Specifications, pack sizes and documents for ${product.name} are listed below.`}
              </p>
            )}
          </section>

          <section id="specifications">
            <span className="r-eyebrow">Know the material</span>
            <h2>Technical specifications.</h2>
            <dl className="r-specifications">
              {specRows.map((r, i) => (
                <div key={i}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="formulation">
            <span className="r-eyebrow">From ingredient to formula</span>
            <h2>Formulation notes.</h2>
            <p>
              Check the technical data sheet for processing sequence, concentration and
              compatibility. Material pH is not automatically the target pH of a finished formula.
            </p>
            <p className="r-fine">
              Confirm the grade and validate stability and preservation for your intended
              application.
            </p>
            <Link className="r-btn r-outline" href="/formulation-tools">
              Calculate ingredient weights
            </Link>
          </section>

          <section id="documents">
            <span className="r-eyebrow">Technical library</span>
            <h2>The source behind the specification.</h2>
            <div className="r-doc-grid">
              {documents.map((doc) => {
                const ext = fileExtension(doc.url);
                return (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Download size={24} aria-hidden />
                    <h3>{documentTitle(doc)}</h3>
                    <p>
                      {documentKind(doc)}
                      {ext ? ` · ${ext}` : ''}
                    </p>
                    <span>Open document</span>
                  </a>
                );
              })}
              <Link href={docRequestHref}>
                <FileText size={24} aria-hidden />
                <h3>Request grade &amp; batch documents</h3>
                <p>Ask for the SDS, specification and batch-specific COA.</p>
                <span>Request documents</span>
              </Link>
            </div>
            <p className="r-fine">
              Certificates of Analysis and Safety Data Sheets are available on request. Request
              both before scaling a formula from bench to production.
            </p>
          </section>

          <section id="questions">
            <h2>A few useful answers.</h2>
            <div className="r-faq">
              {faq.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="r-reading-aside">
          <BookOpen size={28} aria-hidden />
          <h3>Good formulas start with good information.</h3>
          <p>Review the current grade and batch documentation before choosing your material.</p>
          <Link href="/compare">Compare ingredients</Link>
          <Link href="/contact">Ask a technical question</Link>
        </aside>
      </div>

      {related && related.length > 0 && (
        <section className="r-wrap r-section">
          <div className="r-section-heading">
            <h2>Keep exploring.</h2>
            {product.category && (
              <Link href={`/categories/${product.category.slug}`}>Explore this category</Link>
            )}
          </div>
          <div className="r-product-grid g-cat-related">
            {related.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
                {/* Why it's here — ranked by the API on category, brand and
                    shared functions, most-alike first. */}
                {p.relatedBy && p.relatedBy.length > 0 && (
                  <p className="r-fine g-cat-reason">{relatedReason(p.relatedBy, product, p)}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/**
 * The specification list: identifiers first (INCI and CAS always shown, as
 * the prototype does), then every admin-entered spec row.
 */
function specificationRows(product: Product): { label: string; value: string }[] {
  const ask = 'Request the current technical data sheet.';
  const rows: { label: string; value: string }[] = [
    { label: 'INCI', value: product.inciName || ask },
    { label: 'CAS', value: product.casNumber || ask },
  ];
  if (product.botanicalName) rows.push({ label: 'Botanical name', value: product.botanicalName });
  if (product.brand) rows.push({ label: 'Brand', value: product.brand });
  if (product.category?.name) rows.push({ label: 'Category', value: product.category.name });
  if (product.functions?.length) {
    rows.push({ label: 'Functions', value: product.functions.map((f) => f.name).join(', ') });
  }
  if (product.certifications?.length) {
    rows.push({
      label: 'Certifications',
      value: product.certifications.map((c) => c.name).join(', '),
    });
  }
  const variants = product.variants || [];
  if (variants.length) {
    rows.push({ label: 'Pack sizes', value: variants.map((v) => v.label || v.sku).join(', ') });
    const prices = variants.map(unitPrice).filter((n) => !isNaN(n) && n > 0);
    if (prices.length) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      rows.push({
        label: 'Price range',
        value: min === max ? formatUsd(min) : `${formatUsd(min)} – ${formatUsd(max)}`,
      });
    }
    const statuses = variants.map((v) => v.stockStatus);
    rows.push({
      label: 'Stock',
      value: statuses.includes('OUT_OF_STOCK')
        ? 'Out of stock'
        : statuses.includes('ON_BACKORDER')
          ? 'On backorder'
          : 'In stock',
    });
  }
  for (const spec of product.specs || []) rows.push({ label: spec.key, value: spec.value });
  if (product.chemicalDescriptions) {
    rows.push({ label: 'Chemical description', value: product.chemicalDescriptions });
  }
  return rows;
}

/** FAQ answers built only from this product's own data. */
function faqItems(product: Product): { q: string; a: React.ReactNode }[] {
  const variants = product.variants || [];
  const buyable = variants.filter((v) => v.stockStatus !== 'OUT_OF_STOCK' && unitPrice(v) > 0);
  const items: { q: string; a: React.ReactNode }[] = [];

  items.push({
    q: 'Is this ingredient available to buy?',
    a: buyable.length
      ? `Yes. Choose a published pack size (${buyable
          .map((v) => `${v.label || v.sku}, ${stockLabel(v).toLowerCase()}`)
          .join('; ')}) and add it to your cart. Prices are in USD before shipping and tax.`
      : variants.length
        ? 'No published pack size can be added to the cart right now. Add it to your quote list and we will confirm price and availability.'
        : 'This product has no purchasable sizes yet. Add it to your quote list and we will confirm what we can supply.',
  });

  const moqs = variants.filter((v) => v.moq && v.moq > 1);
  if (moqs.length) {
    items.push({
      q: 'Is there a minimum order?',
      a: `Yes, for ${moqs.length === variants.length ? 'every' : 'some'} pack size${
        moqs.length === variants.length ? '' : 's'
      }: ${moqs.map((v) => `${v.label || v.sku}, minimum ${v.moq}`).join('; ')}.`,
    });
  }

  const limits = variants.filter((v) => v.limitPerOrder && v.maxOrderQuantity);
  if (limits.length) {
    items.push({
      q: 'Is there a limit per order?',
      a: `Yes: ${limits
        .map((v) => `${v.label || v.sku}, up to ${v.maxOrderQuantity} per order`)
        .join('; ')}. For larger volumes, add it to your quote list.`,
    });
  }

  const documents = product.documents || [];
  items.push({
    q: 'Which documents are available?',
    a: documents.length
      ? `${documents
          .map((d) => documentTitle(d))
          .join(', ')}, under Documents above. Ask us for a batch-specific COA or anything else you need.`
      : 'No documents are attached to this listing yet. Use “Request grade & batch documents” to ask for the SDS, specification or a batch COA.',
  });

  items.push({
    q: 'Can I get a different pack size?',
    a: 'Choose “Request a size” in the pack size menu, tell us the amount you need and add it to your quote list. A requested size is confirmed individually.',
  });

  items.push({
    q: 'How is shipping calculated?',
    a: (
      <>
        In-stock items ship from our US warehouse, and checkout rates shipping by weight and
        destination zone, so you see the cost before you commit. Larger drum orders and shipments
        to Alaska, Hawaii and US territories are quoted manually. See{' '}
        <Link href="/shipping-returns">shipping &amp; returns</Link>.
      </>
    ),
  });

  return items;
}
