'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product, ProductDocType, ProductDocumentRow } from '@/lib/types';
import { ChevronLeftIcon, ChevronRightIcon, FileIcon, ImagePlaceholderIcon } from '@/components/icons';
import { HERO_IMAGES } from '@/lib/heroImages';

// Human labels for the document types. Kept here rather than reusing the
// admin form's list because the customer-facing wording is spelled out —
// "Certificate of Analysis" means something to a formulator, "COA" assumes
// they already know.
const DOC_TYPE_LABEL: Record<ProductDocType, string> = {
  COA: 'Certificate of Analysis',
  SDS: 'Safety Data Sheet',
  TDS: 'Technical Data Sheet',
  SPEC_SHEET: 'Spec Sheet',
  CERTIFICATE: 'Certificate',
  OTHER: 'Document',
};

// Short badge for the thumbnail tile, where there is no room for the above.
const DOC_TYPE_BADGE: Record<ProductDocType, string> = {
  COA: 'COA',
  SDS: 'SDS',
  TDS: 'TDS',
  SPEC_SHEET: 'SPEC',
  CERTIFICATE: 'CERT',
  OTHER: 'DOC',
};

// A certificate's most useful name is the certification it proves —
// "USDA Organic" tells a formulator more than "Certificate" ever will.
function documentTitle(doc: ProductDocumentRow): string {
  if (doc.type === 'CERTIFICATE' && doc.certification?.name) return doc.certification.name;
  return doc.label || DOC_TYPE_LABEL[doc.type];
}

function documentKind(doc: ProductDocumentRow): string {
  if (doc.type === 'CERTIFICATE') return 'Certificate';
  return DOC_TYPE_LABEL[doc.type];
}

function fileExtension(url: string): string {
  const clean = url.split('?')[0];
  return (clean.slice(clean.lastIndexOf('.') + 1) || '').toUpperCase();
}

/**
 * Product media: the main image, a thumbnail strip of every image, and the
 * product's documents as tiles in that same strip.
 *
 * The gallery strip is new — the page previously rendered only the cover
 * image, so extra images uploaded in admin were never visible to anyone.
 *
 * Documents sit in the strip (not a separate section further down the page)
 * because that is where someone looking through a product's imagery expects
 * to find its paperwork. They open in a new tab rather than switching the
 * main pane: a PDF can't render in an <img>, and the browser's own viewer is
 * better than anything embedded here.
 */
export function ProductMediaGallery({
  product,
  variantImageUrl,
}: {
  product: Product;
  variantImageUrl?: string | null;
}) {
  // Cover first, then the rest of the gallery, de-duplicated: `imageUrl` is
  // derived from gallery[0] server-side, so the two overlap by design and a
  // naive concat would show the cover twice.
  const images = useMemo(() => {
    const ordered = [
      product.imageUrl,
      ...(product.gallery || []).slice().sort((a, b) => a.sortOrder - b.sortOrder).map((g) => g.url),
    ].filter((url): url is string => !!url);
    return Array.from(new Set(ordered));
  }, [product.imageUrl, product.gallery]);

  const documents: ProductDocumentRow[] = product.documents || [];

  const [activeIndex, setActiveIndex] = useState(0);

  // A variant with its own photo takes over the main pane, matching the
  // previous behaviour. Reset on variant change so the shown image always
  // belongs to the current selection.
  useEffect(() => {
    setActiveIndex(0);
  }, [variantImageUrl]);

  const mainImage = variantImageUrl || images[activeIndex] || images[0] || null;
  // A single image with no paperwork is just a photo — no strip needed.
  const showStrip = images.length > 1 || documents.length > 0;

  // Arrows are hidden while a variant photo is taking over the main pane:
  // stepping through the gallery wouldn't change what's displayed, and a
  // control that visibly does nothing is worse than no control.
  const showArrows = images.length > 1 && !variantImageUrl;

  // Wraps in both directions, so the gallery never dead-ends on an arrow.
  function step(delta: number) {
    setActiveIndex((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div>
      <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-sci-border bg-sci-pale">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          // Most of the catalogue has no photograph yet, and an empty grey
          // square told a visitor nothing and left the page with no image at
          // all. This is a stand-in, and it says so: the caption keeps it from
          // reading as a photograph OF this material, which would be a small
          // lie on a page whose whole job is accurate specification.
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGES.product.src}
              alt={`Laboratory glassware — no product photograph of ${product.name} is available yet`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover opacity-70 grayscale-[0.25]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-sci-navy/70 px-3 py-2 text-center font-sci-body text-xs text-white">
              Photograph coming soon
            </span>
            <ImagePlaceholderIcon aria-hidden className="absolute h-14 w-14 text-white drop-shadow" />
          </>
        )}

        {showArrows && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              title="Previous image"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-sci-navy shadow-sm transition hover:bg-white focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              title="Next image"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-sci-navy shadow-sm transition hover:bg-white focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            <span className="absolute bottom-2 right-2 rounded-full bg-white/85 px-2.5 py-0.5 font-sci-body text-xs text-sci-muted">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {showStrip && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((url, i) => {
            const isActive = !variantImageUrl && i === activeIndex;
            return (
              <button
                key={url}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1} of ${images.length}`}
                title={`View image ${i + 1} of ${images.length}`}
                aria-current={isActive}
                className={`aspect-square overflow-hidden border transition ${
                  isActive ? 'border-sci-blue' : 'border-sci-border hover:border-sci-blue/60'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}

          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${documentTitle(doc)} — ${documentKind(doc)} (opens in a new tab)`}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-sci-border bg-white px-1 text-center transition hover:border-sci-blue hover:bg-sci-pale"
            >
              <FileIcon className="h-5 w-5 text-sci-blue" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-sci-navy">
                {DOC_TYPE_BADGE[doc.type]}
              </span>
              <span className="font-sci-body text-[9px] uppercase text-sci-muted">{fileExtension(doc.url)}</span>
            </a>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="mt-4 border-t border-sci-border pt-4">
          <p className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
            Documents &amp; Certificates
          </p>
          <ul className="mt-2 space-y-1.5">
            {documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 font-sci-body text-sci-label text-sci-navy transition hover:text-sci-blue"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-sci-blue" />
                  <span className="underline decoration-sci-border underline-offset-2 group-hover:decoration-sci-blue">
                    {documentTitle(doc)}
                  </span>
                  <span className="font-sci-body text-xs text-sci-muted">
                    {documentKind(doc)} &middot; {fileExtension(doc.url)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
