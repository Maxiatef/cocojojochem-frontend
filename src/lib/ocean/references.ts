import { catalog, categoryImage, categoryLabel, type CatalogProduct } from './catalog-data';
import { sourceName } from './supplier-names';
import type { ReferenceCardData } from '@/components/ocean/OceanProductCard';

/**
 * The supplier-reference half of the catalog (3,458 records): the reference
 * site's catalog minus its own 9 "cocojojo" products — ours come from our
 * backend instead. Server-only: the underlying data is several MB.
 */
export const referenceCatalog: CatalogProduct[] = catalog.filter((p) => p.source !== 'cocojojo');

const bySlug = new Map(referenceCatalog.map((p) => [p.slug, p]));

export function findReference(slug: string): CatalogProduct | undefined {
  return bySlug.get(slug);
}

/** Card label exactly as the reference words it. */
export function referenceSourceLabel(p: CatalogProduct): string {
  return sourceName(p.source) + (p.recordType === 'product-family' ? ' · product family' : ' reference');
}

/** Plain props for <OceanProductCard item={{ kind: 'reference', ref }} />. */
export function toReferenceCard(p: CatalogProduct): ReferenceCardData {
  return {
    slug: p.slug,
    name: p.name,
    category: categoryLabel(p.categoryId),
    categoryId: p.categoryId,
    sourceLabel: referenceSourceLabel(p),
    inci: p.inci || null,
    note:
      p.source === 'univar' && p.supplierProductId
        ? 'Supplier product ' + p.supplierProductId
        : 'View available technical information',
    image: categoryImage(p.categoryId),
    sourceUrl: p.sourceUrl,
  };
}
