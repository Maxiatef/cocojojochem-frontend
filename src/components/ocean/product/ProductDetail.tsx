import type { ReactNode } from 'react';
import { BookOpen, FileText, FlaskConical, Package } from 'lucide-react';
import type { Product, ProductDocumentRow } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { productImage } from '@/lib/gloss/images';
import { categoryImage, categoryLabel, type CatalogProduct } from '@/lib/ocean/catalog-data';
import { referenceCatalog, toReferenceCard } from '@/lib/ocean/references';
import { sourceName } from '@/lib/ocean/supplier-names';
import { OceanProductCard } from '@/components/ocean/OceanProductCard';
import IngredientProperties from './IngredientProperties';
import { OurPurchase, ReferencePurchase } from './ProductPurchase';

/**
 * The ocean design's ingredient page (reference retail-page.tsx `Ingredient`),
 * markup, class names, copy and section order unchanged. Two kinds:
 *  - `OurProductDetail`: a product from our backend (the reference's
 *    "COCOJOJO collection" branch) with our variants, specs and documents.
 *  - `ReferenceProductDetail`: a supplier reference from the copied catalog.
 * Server components; only the purchase panels are client code.
 */

/* ------------------------------------------------------------ shared pieces */

function DetailImage({ src, alt, representative }: { src: string; alt: string; representative: boolean }) {
  return (
    <div className="r-detail-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={740} height={740} />
      {representative && <span>Representative category image</span>}
      <div>
        <FlaskConical size={22} />
        <strong>Start with the right ingredient.</strong>
      </div>
    </div>
  );
}

function Assurance() {
  return (
    <div className="r-detail-assurance">
      <span>
        <FileText size={17} />
        <a href="#documents">Technical documents</a>
      </span>
      <span>
        <Package size={17} />
        <a href="/shipping-returns">Shipping &amp; returns</a>
      </span>
    </div>
  );
}

function Tabs() {
  return (
    <nav className="r-wrap r-product-tabs" aria-label="Product information">
      <a href="#overview">Overview</a>
      <a href="#specifications">Specifications</a>
      <a href="#formulation">Formulation</a>
      <a href="#documents">Documents</a>
      <a href="#questions">Questions</a>
    </nav>
  );
}

function OverviewHeading() {
  return (
    <>
      <span className="r-eyebrow">Get to know the ingredient</span>
      <h2>
        Small details.
        <br />
        Better decisions.
      </h2>
    </>
  );
}

function FormulationNotes({ rows }: { rows: [string, string][] }) {
  return (
    <section id="formulation">
      <span className="r-eyebrow">From ingredient to formula</span>
      <h2>Formulation notes.</h2>
      {rows.length > 0 && (
        <dl className="r-specifications">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <p>
        Check the supplier’s complete instructions for processing sequence, concentration and compatibility. Material
        pH is not automatically the target pH of a finished formula.
      </p>
      <p className="r-fine">Confirm the grade and validate stability and preservation for your intended application.</p>
      <a className="r-btn r-outline" href="/formulation-tools">
        Open formulation tools
      </a>
    </section>
  );
}

function RequestDocumentsCard({ name }: { name: string }) {
  return (
    <a href={'/contact?subject=' + encodeURIComponent('Documentation request: ' + name)}>
      <FileText size={24} />
      <h3>Request grade &amp; batch documents</h3>
      <p>Ask for the SDS, specification and batch-specific COA.</p>
      <span>Request documents</span>
    </a>
  );
}

function Questions({ available, extra = [] }: { available: ReactNode; extra?: { q: string; a: ReactNode }[] }) {
  return (
    <section id="questions">
      <h2>A few useful answers.</h2>
      <div className="r-faq">
        <details>
          <summary>Is this ingredient available to buy?</summary>
          <p>{available}</p>
        </details>
        {extra.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
        <details>
          <summary>Can I use this directly on skin?</summary>
          <p>
            Raw ingredients may require dilution or formulation. Follow the instructions and specifications for the
            supplied grade and intended application.
          </p>
        </details>
        <details>
          <summary>Can I get a smaller pack?</summary>
          <p>Choose “Request a size” and tell us the amount you need. A requested size is confirmed individually.</p>
        </details>
      </div>
    </section>
  );
}

function ReadingAside({ copy }: { copy: string }) {
  return (
    <aside className="r-reading-aside">
      <BookOpen size={27} />
      <h3>Good formulas start with good information.</h3>
      <p>{copy}</p>
      <a href="/compare">Compare ingredients</a>
      <a href="/contact">Ask a technical question</a>
    </aside>
  );
}

/* ------------------------------------------------------- supplier reference */

export function ReferenceProductDetail({ p }: { p: CatalogProduct }) {
  const label = categoryLabel(p.categoryId);
  const image = categoryImage(p.categoryId);
  const related = referenceCatalog.filter((x) => x.slug !== p.slug && x.categoryId === p.categoryId).slice(0, 4);
  const extra: [string, string][] = (
    [
      ['Formulation phase', p.extra.phase],
      ['Material / test-solution pH', p.extra.materialPH],
      ['Formulation pH', p.extra.formulationPH],
      ['Temperature reference', p.extra.temperature],
      ['Melting point', p.extra.meltingPoint],
      ['Storage', p.extra.storage],
      ['Shelf life', p.extra.shelfLife],
    ] as [string, string | null | undefined][]
  ).filter((row): row is [string, string] => !!row[1]);
  return (
    <>
      <nav className="r-breadcrumb r-wrap" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/products">Ingredient library</a>
        <span>/</span>
        <a href={'/products?category=' + p.categoryId}>{label}</a>
      </nav>
      <section className="r-wrap r-product-detail">
        <DetailImage src={image} alt={p.category + ' representative ingredient texture'} representative />
        <div className="r-detail-copy">
          <span className="r-product-source">
            {sourceName(p.source) + (p.recordType === 'product-family' ? ' · product family' : ' supplier reference')}
          </span>
          <h1>{p.name}</h1>
          <p className="r-inci">{p.inci || 'See technical reference'}</p>
          <p className="r-description">{p.description}</p>
          <div className="r-product-traits">
            {p.functions.slice(0, 3).map((x) => (
              <a key={x} href={'/products?function=' + encodeURIComponent(x)}>
                {x}
              </a>
            ))}
          </div>
          <ReferencePurchase data={toReferenceCard(p)} />
          <Assurance />
        </div>
      </section>
      <Tabs />
      <div className="r-wrap r-detail-content">
        <div>
          <section id="overview">
            <OverviewHeading />
            <p>
              {`${p.name} is a supplier reference from ${sourceName(p.source)}. Use the published properties below to guide your research, then confirm the exact material and grade you intend to purchase.`}
            </p>
            {!!p.extra.applications?.length && (
              <>
                <h3>Published applications</h3>
                <div className="r-product-traits">
                  {p.extra.applications.map((a) => (
                    <a href={'/products?application=' + encodeURIComponent(a)} key={a}>
                      {a}
                    </a>
                  ))}
                </div>
              </>
            )}
          </section>
          <section id="specifications">
            <span className="r-eyebrow">Know the material</span>
            <h2>Technical specifications.</h2>
            <IngredientProperties product={p} />
          </section>
          <FormulationNotes rows={extra} />
          <section id="documents">
            <span className="r-eyebrow">Technical library</span>
            <h2>The source behind the specification.</h2>
            <div className="r-doc-grid">
              {(p.extra.documents || []).map((d) => (
                <a href={d.url} target="_blank" rel="noopener noreferrer" key={d.url}>
                  <FileText size={24} />
                  <h3>{d.title}</h3>
                  <p>Supplier PDF · revision shown in document</p>
                  <span>Open document</span>
                </a>
              ))}
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
                <BookOpen size={24} />
                <h3>{p.sourceUrlType === 'listing' ? 'Supplier catalog listing' : 'Original supplier listing'}</h3>
                <p>{sourceName(p.source)} · latest published details</p>
                <span>Open source</span>
              </a>
              <RequestDocumentsCard name={p.name} />
            </div>
            <p className="r-fine">
              Reference snapshots include published data available through October 8, 2026. Source documents may
              change. A supplier reference COA is not a COCOJOJO batch certificate.
            </p>
          </section>
          <Questions available="This entry is a reference material. Add it to your sourcing list and ask COCOJOJO to confirm availability and a suitable grade." />
        </div>
        <ReadingAside copy="Supplier material details and independent chemical references are labeled separately. They do not confirm COCOJOJO inventory, certifications or equivalent grades." />
      </div>
      <section className="r-wrap r-section">
        <div className="r-section-heading">
          <h2>Keep exploring.</h2>
          <a href={'/products?category=' + p.categoryId}>Explore this category</a>
        </div>
        <div className="r-product-grid">
          {related.map((x) => (
            <OceanProductCard key={x.slug} item={{ kind: 'reference', ref: toReferenceCard(x) }} />
          ))}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------- our product */

const DOC_LABEL: Record<ProductDocumentRow['type'], string> = {
  COA: 'Certificate of Analysis',
  SDS: 'Safety Data Sheet',
  TDS: 'Technical Data Sheet',
  SPEC_SHEET: 'Spec Sheet',
  CERTIFICATE: 'Certificate',
  OTHER: 'Document',
};

function documentTitle(doc: ProductDocumentRow): string {
  if (doc.type === 'CERTIFICATE' && doc.certification?.name) return doc.certification.name;
  return doc.label || DOC_LABEL[doc.type];
}

function fileExtension(url: string): string {
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  const ext = dot >= 0 ? clean.slice(dot + 1) : '';
  return ext.length > 0 && ext.length <= 5 ? ext.toUpperCase() : '';
}

const price = (v: NonNullable<Product['variants']>[number]) => Number(v.effectivePrice ?? v.price);

/** Identity first (INCI and CAS always shown), then every admin-entered spec. */
function identityRows(product: Product): [string, string | null][] {
  const rows: [string, string | null][] = [
    ['Supplier / source', product.brand || 'COCOJOJO'],
    ['INCI', product.inciName || null],
    ['CAS', product.casNumber || null],
  ];
  if (product.botanicalName) rows.push(['Botanical name', product.botanicalName]);
  if (product.certifications?.length) rows.push(['Certifications', product.certifications.map((c) => c.name).join(', ')]);
  const variants = product.variants || [];
  if (variants.length) {
    rows.push(['Pack sizes', variants.map((v) => v.label || v.sku).join(', ')]);
    const prices = variants.map(price).filter((n) => !isNaN(n) && n > 0);
    if (prices.length) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      rows.push(['Price range', min === max ? formatUsd(min) : `${formatUsd(min)} – ${formatUsd(max)}`]);
    }
    const statuses = variants.map((v) => v.stockStatus);
    rows.push([
      'Stock',
      statuses.includes('OUT_OF_STOCK') ? 'Out of stock' : statuses.includes('ON_BACKORDER') ? 'On backorder' : 'In stock',
    ]);
  }
  for (const spec of product.specs || []) rows.push([spec.key, spec.value]);
  if (product.chemicalDescriptions) rows.push(['Chemical description', product.chemicalDescriptions]);
  return rows;
}

/** Answers built only from this product's own data. */
function availabilityAnswer(product: Product): string {
  const variants = product.variants || [];
  const buyable = variants.filter((v) => v.stockStatus !== 'OUT_OF_STOCK' && price(v) > 0);
  return buyable.length
    ? 'Select a published pack or enter the size you need. Pricing, availability and delivery are confirmed before your order is accepted.'
    : variants.length
      ? 'No published pack size can be added to the cart right now. Choose “Request a size” and we will confirm price and availability.'
      : 'This ingredient has no published pack sizes yet. Choose “Request a size” and we will confirm what we can supply.';
}

function orderQuestions(product: Product): { q: string; a: ReactNode }[] {
  const variants = product.variants || [];
  const items: { q: string; a: ReactNode }[] = [];
  const moqs = variants.filter((v) => v.moq && v.moq > 1);
  if (moqs.length)
    items.push({
      q: 'Is there a minimum order?',
      a: `Yes: ${moqs.map((v) => `${v.label || v.sku}, minimum ${v.moq}`).join('; ')}.`,
    });
  const limits = variants.filter((v) => v.limitPerOrder && v.maxOrderQuantity);
  if (limits.length)
    items.push({
      q: 'Is there a limit per order?',
      a: `Yes: ${limits
        .map((v) => `${v.label || v.sku}, up to ${v.maxOrderQuantity} per order`)
        .join('; ')}. For larger volumes, choose “Request a size”.`,
    });
  items.push({
    q: 'How is shipping calculated?',
    a: (
      <>
        In-stock items ship from our US warehouse, and checkout rates shipping by weight and destination zone, so you
        see the cost before you commit. Larger drum orders and shipments to Alaska, Hawaii and US territories are quoted
        manually. See <a href="/shipping-returns">shipping &amp; returns</a>.
      </>
    ),
  });
  return items;
}

export function OurProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const category = product.category;
  const ownImage = !!(product.imageUrl || product.gallery?.[0]?.url);
  const documents = product.documents || [];
  const paragraphs = (product.description || '')
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const rows = identityRows(product);
  const request = '/contact?subject=' + encodeURIComponent('Technical specification request: ' + product.name);
  return (
    <>
      <nav className="r-breadcrumb r-wrap" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/shop">Shop</a>
        {category?.parent && (
          <>
            <span>/</span>
            <a href={'/categories/' + category.parent.slug}>{category.parent.name}</a>
          </>
        )}
        {category && (
          <>
            <span>/</span>
            <a href={'/categories/' + category.slug}>{category.name}</a>
          </>
        )}
      </nav>
      <section className="r-wrap r-product-detail">
        <DetailImage
          src={productImage(product)}
          alt={ownImage ? product.name : (category?.name || 'Ingredient') + ' representative ingredient texture'}
          representative={!ownImage}
        />
        <div className="r-detail-copy">
          <span className="r-product-source">{product.brand || 'COCOJOJO collection'}</span>
          <h1>{product.name}</h1>
          <p className="r-inci">{product.inciName || 'See technical reference'}</p>
          {(product.shortDescription || paragraphs[0]) && (
            <p className="r-description">{product.shortDescription || paragraphs[0]}</p>
          )}
          <div className="r-product-traits">
            {(product.functions || []).slice(0, 3).map((f) => (
              <a key={f.id} href={'/functions/' + f.slug}>
                {f.name}
              </a>
            ))}
          </div>
          <OurPurchase product={product} />
          <Assurance />
        </div>
      </section>
      <Tabs />
      <div className="r-wrap r-detail-content">
        <div>
          <section id="overview">
            <OverviewHeading />
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => <p key={i}>{para}</p>)
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
            <div className="ip-library">
              <div className="ip-family">
                <FlaskConical size={25} />
                <div>
                  <span className="r-eyebrow">Functions &amp; applications</span>
                  <h3>{category?.name || 'COCOJOJO ingredient'}</h3>
                  {category?.description && <p>{category.description}</p>}
                  {!!product.functions?.length && (
                    <>
                      <h4>Cosmetic functions</h4>
                      <div className="r-product-traits">
                        {product.functions.map((f) => (
                          <a key={f.id} href={'/functions/' + f.slug}>
                            {f.name}
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                  <small>Confirm performance, concentration and compatibility for the selected grade.</small>
                </div>
              </div>
              <details className="ip-group" open>
                <summary>
                  <span>
                    Material identity &amp; specifications
                    <small>COCOJOJO grade information</small>
                  </span>
                  <span className="ip-expand">+</span>
                </summary>
                <div className="ip-group-body">
                  <dl className="ip-rows">
                    {rows.map(([label, value], i) => (
                      <div key={label + i}>
                        <dt>{label}</dt>
                        <dd className={value ? '' : 'ip-unreported'}>
                          {value || 'Request the current technical data sheet.'}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <a className="ip-request" href={request}>
                    <FileText size={17} />
                    Request current SDS, TDS &amp; COA
                  </a>
                </div>
              </details>
            </div>
          </section>
          <FormulationNotes rows={[]} />
          <section id="documents">
            <span className="r-eyebrow">Technical library</span>
            <h2>The source behind the specification.</h2>
            <div className="r-doc-grid">
              {documents.map((doc) => {
                const ext = fileExtension(doc.url);
                return (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" key={doc.id}>
                    <FileText size={24} />
                    <h3>{documentTitle(doc)}</h3>
                    <p>
                      {DOC_LABEL[doc.type]}
                      {ext ? ' · ' + ext : ''}
                    </p>
                    <span>Open document</span>
                  </a>
                );
              })}
              <RequestDocumentsCard name={product.name} />
            </div>
            <p className="r-fine">
              Certificates of Analysis and Safety Data Sheets are available on request. Request both before scaling a
              formula from bench to production.
            </p>
          </section>
          <Questions available={availabilityAnswer(product)} extra={orderQuestions(product)} />
        </div>
        <ReadingAside copy="Review the current COCOJOJO grade and batch documentation before choosing your material." />
      </div>
      {related.length > 0 && (
        <section className="r-wrap r-section">
          <div className="r-section-heading">
            <h2>Keep exploring.</h2>
            {category && <a href={'/categories/' + category.slug}>Explore this category</a>}
          </div>
          <div className="r-product-grid">
            {related.map((x) => (
              <OceanProductCard key={x.id} item={{ kind: 'ours', product: x }} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
