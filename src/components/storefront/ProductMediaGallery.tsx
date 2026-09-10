'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product, ProductDocType, ProductDocumentRow } from '@/lib/types';
import { FileIcon, ImagePlaceholderIcon } from '@/components/icons';

// Human labels for the document types. Kept here rather than reusing the
// admin form's list because the customer-facing wording is spelled out —
// "Certificate of Analysis" means something to a formulator, "COA" assumes
// they already know.
const DOC_TYPE_LABEL: Record<ProductDocType, string> = {
  COA: 'Certificate of Analysis',
  SDS: 'Safety Data Sheet',
  TDS: 'Technical Data Sheet',
  SPEC_SHEET: 'Spec Sheet',
  OTHER: 'Document',
};

// Short badge for the thumbnail tile, where there is no room for the above.
const DOC_TYPE_BADGE: Record<ProductDocType, string> = {
  COA: 'COA',
  SDS: 'SDS',
  TDS: 'TDS',
  SPEC_SHEET: 'SPEC',
  OTHER: 'DOC',
};

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

  return (
    <div>
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-sand-100">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholderIcon className="h-14 w-14 text-sand-400" />
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
                aria-current={isActive}
                className={`aspect-square overflow-hidden border transition ${
                  isActive ? 'border-olive-600' : 'border-sand-300 hover:border-olive-400'
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
              title={`${DOC_TYPE_LABEL[doc.type]}${doc.label ? ` — ${doc.label}` : ''} (opens in a new tab)`}
              className="flex aspect-square flex-col items-center justify-center gap-1 border border-sand-300 bg-white px-1 text-center transition hover:border-olive-400 hover:bg-sand-50"
            >
              <FileIcon className="h-5 w-5 text-olive-600" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink">
                {DOC_TYPE_BADGE[doc.type]}
              </span>
              <span className="text-[9px] uppercase text-ink-soft/60">{fileExtension(doc.url)}</span>
            </a>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="mt-4 border-t border-sand-300 pt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-soft">
            Documents &amp; Certificates
          </p>
          <ul className="mt-2 space-y-1.5">
            {documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm text-ink hover:text-olive-700"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-olive-600" />
                  <span className="underline decoration-sand-400 group-hover:decoration-olive-600">
                    {doc.label || DOC_TYPE_LABEL[doc.type]}
                  </span>
                  <span className="text-xs text-ink-soft/70">
                    {DOC_TYPE_LABEL[doc.type]} &middot; {fileExtension(doc.url)}
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
