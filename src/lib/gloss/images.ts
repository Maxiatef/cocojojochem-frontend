/**
 * Gloss Studio photography.
 *
 * The prototype the storefront is ported from uses six ingredient photographs
 * for everything: a product without its own photo shows the one that matches
 * its category. Most of our catalog has no photo yet, so the same rule keeps
 * every card, line item and hero illustrated instead of showing a grey box.
 */
export const GLOSS_IMAGES = {
  oils: '/gloss/ingredients/oils.webp',
  actives: '/gloss/ingredients/actives.webp',
  botanicals: '/gloss/ingredients/botanicals.webp',
  butters: '/gloss/ingredients/butters.webp',
  cleansing: '/gloss/ingredients/cleansing.webp',
  texture: '/gloss/ingredients/texture.webp',
} as const;

export const GLOSS_LOGO = '/gloss/cocojojo-logo.png';

type Key = keyof typeof GLOSS_IMAGES;

// Checked in order; the first keyword found in the category name/slug wins.
const RULES: [RegExp, Key][] = [
  [/oil|carrier|essential|fragrance|aroma/i, 'oils'],
  [/butter|wax|tallow|emollient|condition/i, 'butters'],
  [/surfact|clean|shampoo|soap|foam|wash/i, 'cleansing'],
  [/hydrosol|botanic|extract|water|plant|herb/i, 'botanicals'],
  [/thicken|texture|emulsif|gel|base|kit|polymer|silicone|powder|mineral|color/i, 'texture'],
  [/active|vitamin|peptide|acid|exfol|preserv|humect|glycerin/i, 'actives'],
];

/** The representative photo for a category name or slug. */
export function categoryImage(category?: string | null): string {
  if (category) {
    for (const [re, key] of RULES) if (re.test(category)) return GLOSS_IMAGES[key];
  }
  return GLOSS_IMAGES.actives;
}

/**
 * A product's own photo when it has one, otherwise its category's.
 * Accepts the loose shapes used across the app (full Product, cart rows).
 */
export function productImage(p: {
  imageUrl?: string | null;
  gallery?: { url: string }[] | null;
  category?: { name?: string | null; slug?: string | null } | null;
  categoryName?: string | null;
}): string {
  return (
    p.imageUrl ||
    p.gallery?.[0]?.url ||
    categoryImage(p.category?.slug || p.category?.name || p.categoryName)
  );
}
