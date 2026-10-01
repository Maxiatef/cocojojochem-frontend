import { Product, ProductDocType, ProductDocumentRow, ProductVariant } from '@/lib/types';

/** Customer-facing names for the document types (spelled out on purpose). */
export const DOC_TYPE_LABEL: Record<ProductDocType, string> = {
  COA: 'Certificate of Analysis',
  SDS: 'Safety Data Sheet',
  TDS: 'Technical Data Sheet',
  SPEC_SHEET: 'Spec Sheet',
  CERTIFICATE: 'Certificate',
  OTHER: 'Document',
};

/** A certificate's best name is the certification it proves. */
export function documentTitle(doc: ProductDocumentRow): string {
  if (doc.type === 'CERTIFICATE' && doc.certification?.name) return doc.certification.name;
  return doc.label || DOC_TYPE_LABEL[doc.type];
}

export function documentKind(doc: ProductDocumentRow): string {
  return DOC_TYPE_LABEL[doc.type];
}

export function fileExtension(url: string): string {
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  const ext = dot >= 0 ? clean.slice(dot + 1) : '';
  return ext.length > 0 && ext.length <= 5 ? ext.toUpperCase() : '';
}

/** Unit price actually charged for a variant (sale price when on sale). */
export function unitPrice(v: ProductVariant): number {
  return Number(v.effectivePrice ?? v.price);
}

export function stockLabel(v: ProductVariant): string {
  return v.stockStatus === 'IN_STOCK'
    ? 'In stock'
    : v.stockStatus === 'ON_BACKORDER'
      ? 'On backorder'
      : 'Out of stock';
}

/** Gallery images, cover first, de-duplicated (imageUrl is gallery[0]). */
export function productImages(product: Product): { url: string; alt: string | null }[] {
  const seen = new Set<string>();
  const out: { url: string; alt: string | null }[] = [];
  const push = (url: string | null | undefined, alt: string | null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ url, alt });
  };
  const gallery = (product.gallery || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  push(product.imageUrl, gallery.find((g) => g.url === product.imageUrl)?.altText ?? null);
  for (const g of gallery) push(g.url, g.altText);
  return out;
}
