/**
 * Hero photography, one entry per page that has no imagery of its own.
 *
 * These are Unsplash placeholders, hotlinked. Two things to know before
 * relying on them:
 *
 * 1. **They are stand-ins.** Nothing here shows COCOJOJO's own material,
 *    warehouse or people, and a photograph of someone else's laboratory is
 *    only ever a decoration on a page about what we actually stock. Replace
 *    them with real photography when it exists; the shape of this file is
 *    designed so that is a one-line change per page.
 * 2. **They are hotlinked to a third party.** Permitted by the Unsplash
 *    licence, but it means page rendering depends on images.unsplash.com
 *    being up, and the URLs are not under our control. Self-hosting them
 *    under /public is the safer end state.
 *
 * Every URL below was fetched and confirmed to return HTTP 200 image/jpeg at
 * the width requested. The query string is Unsplash's own resizing API — it
 * is what keeps these from shipping a 4MB original.
 */

const PARAMS = 'auto=format&fit=crop&q=70';

/** Unsplash resizing: width in CSS pixels the image is expected to occupy. */
function unsplash(id: string, width: number): string {
  return `https://images.unsplash.com/${id}?${PARAMS}&w=${width}`;
}

export interface HeroImage {
  src: string;
  /**
   * Describes the PHOTOGRAPH, not the page. These are announced by screen
   * readers, so "Ingredient categories" — which restates the <h1> — would be
   * heard twice; and a keyphrase stuffed in here is read aloud as noise.
   */
  alt: string;
}

export const HERO_IMAGES = {
  about: {
    src: unsplash('photo-1601961545517-59307b1fbac3', 1600),
    alt: 'Laboratory glassware arranged on a bench under even light',
  },
  contact: {
    src: unsplash('photo-1521791055366-0d553872125f', 1600),
    alt: 'Two people shaking hands across a desk at the end of a meeting',
  },
  functions: {
    src: unsplash('photo-1631730486572-226d1f595b68', 1600),
    alt: 'Cosmetic raw materials and powders laid out in open dishes',
  },
  categories: {
    src: unsplash('photo-1669281393011-c335050cf0e9', 1600),
    alt: 'Amber dropper bottles of botanical oils grouped on a pale surface',
  },
  legal: {
    src: unsplash('photo-1450101499163-c8848c66ca85', 1600),
    alt: 'A printed document and a pen resting on a desk',
  },
  product: {
    src: unsplash('photo-1595500381966-eee2034aae48', 1200),
    alt: 'Laboratory flasks holding clear liquid on a white bench',
  },
  quoteRequest: {
    src: unsplash('photo-1587293852726-70cdb56c2866', 1600),
    alt: 'Pallets and drums stacked in a distribution warehouse aisle',
  },
} satisfies Record<string, HeroImage>;
