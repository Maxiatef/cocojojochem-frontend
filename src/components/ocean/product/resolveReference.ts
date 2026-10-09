import { categoryDescription, normalizeCategory, type CatalogProduct } from '@/lib/ocean/catalog-data';
import { findReference } from '@/lib/ocean/references';
import { getReferenceEntry } from '@/lib/gloss/referenceLibrary';

/**
 * A supplier reference by slug. The ocean catalog (3,458 references) comes
 * first; the older Gloss reference library is a fallback so its ~390 entries
 * that are missing from the new catalog keep working at the same URLs
 * (shown with the same page, just with fewer published properties).
 * Server-only.
 */
export function resolveReference(slug: string): CatalogProduct | undefined {
  const found = findReference(slug) || findReference(slug.toLowerCase());
  if (found) return found;
  const legacy = getReferenceEntry(slug);
  if (!legacy || !legacy.sourceUrl) return undefined;
  const categoryId = normalizeCategory(legacy.category);
  return {
    slug: legacy.slug,
    id: legacy.slug.toUpperCase(),
    name: legacy.name,
    inci: legacy.inci || '',
    category: legacy.category,
    categoryId,
    functions: [],
    browsingFunctions: [],
    description: categoryDescription(categoryId),
    packSizes: ['Discuss quantity'],
    sourceUrl: legacy.sourceUrl,
    source: 'makingcosmetics',
    letter: legacy.name.charAt(0).toUpperCase(),
    facts: { inci: legacy.inci },
    extra: {},
  };
}
