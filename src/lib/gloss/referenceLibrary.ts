import rawLibrary from '@/data/reference-library.json';

/**
 * The supplier reference library (source "makingcosmetics") carried over from
 * the Gloss Studio prototype: name, category, INCI and the supplier's own
 * listing URL for ~1,100 materials COCOJOJO can source on request.
 *
 * These are NOT our products. They have no variants, no price and no detail
 * page here; the storefront shows them only as a labelled reference list.
 *
 * Server-only: import this from server components / route handlers. The JSON
 * is ~250 KB, so a client import would ship the whole list to the browser.
 */
export interface ReferenceEntry {
  name: string;
  /** The prototype's slug (the supplier's item code, lower-cased). */
  slug: string;
  /** Category label, e.g. "Carrier oils". */
  category: string;
  inci: string | null;
  /** The supplier's original listing, when known. */
  sourceUrl: string | null;
}

export interface ReferenceCategory {
  id: string;
  name: string;
  count: number;
}

const LIBRARY = rawLibrary as ReferenceEntry[];

/** URL-safe key for a category label ("Butters & waxes" → "butters-waxes"). */
export function referenceCategoryId(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Every reference entry, sorted by name. */
export function getReferenceLibrary(): ReferenceEntry[] {
  return LIBRARY;
}

/** Categories present in the library, with entry counts, in label order. */
export function getReferenceCategories(): ReferenceCategory[] {
  const counts = new Map<string, number>();
  for (const entry of LIBRARY) counts.set(entry.category, (counts.get(entry.category) || 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ id: referenceCategoryId(name), name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
