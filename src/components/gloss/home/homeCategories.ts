import { Category } from '@/lib/types';
import { GLOSS_IMAGES, categoryImage } from '@/lib/gloss/images';

/**
 * The prototype's home page names its own ingredient collections (hero tabs,
 * category carousel). Ours are whatever the admin has created, so each
 * prototype collection is matched to one of our categories by keyword, and the
 * card shows OUR name and links to OUR category page. A prototype collection
 * with no counterpart in our catalog is skipped rather than invented.
 */
type Matcher = RegExp[];

function find(categories: Category[], patterns: Matcher, used?: Set<string>): Category | null {
  // Patterns are in priority order: the first pattern that matches any free
  // category wins, so "carrier" beats a looser fallback further down.
  for (const re of patterns) {
    const hit = categories.find((c) => !used?.has(c.id) && re.test(`${c.name} ${c.slug}`));
    if (hit) return hit;
  }
  return null;
}

/** The prototype's carousel order, each with the keywords that identify it. */
const CAROUSEL_TILES: Matcher[] = [
  [/hydrosol/i, /botanic/i, /extract/i], // Botanical extracts & waters
  [/carrier/i, /natural.?oils?/i, /(plant|vegetable).?oils?/i], // Carrier oils
  [/essential/i, /fragrance/i, /aromather/i], // Essential oils & fragrances
  [/butter/i, /\bwax/i], // Butters & waxes
  [/emollient/i], // Emollients & conditioners
  [/active/i, /vitamin/i], // Actives & vitamins
  [/peptide/i, /protein/i], // Proteins & peptides
  [/emulsif/i, /solubili/i], // Emulsifiers & solubilizers
  [/surfactant/i], // Surfactants & cleansers
  [/thicken/i, /rheolog/i], // Thickeners & texture
  [/humectant/i, /glycerin/i], // Humectants & moisturizers
  [/preserv/i], // Preservation support
  [/colou?rs?\b/i, /pigment/i, /\bmica\b/i, /\bclays?\b/i, /mineral.?powder/i], // Colors & mineral powders
  [/\bbases\b/i, /\bkits?\b/i], // Bases & kits
  [/exfoli/i, /\bacids?\b/i], // Exfoliants & acids
  [/formulation.?aid/i, /additive/i], // Formulation aids
];

export interface CarouselCategory {
  id: string;
  label: string;
  href: string;
  image: string;
}

export function carouselCategories(categories: Category[]): CarouselCategory[] {
  const used = new Set<string>();
  const out: CarouselCategory[] = [];
  for (const patterns of CAROUSEL_TILES) {
    const c = find(categories, patterns, used);
    if (!c) continue;
    used.add(c.id);
    out.push({ id: c.id, label: c.name, href: `/categories/${c.slug}`, image: categoryImage(c.slug || c.name) });
  }
  return out;
}

export interface HeroCollection {
  id: string;
  label: string;
  title: string;
  copy: string;
  image: string;
  href: string;
}

/** The hero's three photo slides, copy from the prototype, links to our categories. */
export function heroCollections(categories: Category[]): HeroCollection[] {
  const link = (patterns: Matcher) => {
    const c = find(categories, patterns);
    return c ? `/categories/${c.slug}` : '/products';
  };
  return [
    {
      id: 'carrier-oils',
      label: 'Carrier oils',
      title: 'A beautiful beginning.',
      copy: 'Explore the oil phase. Discover carrier oils, textures and possibilities.',
      image: GLOSS_IMAGES.oils,
      href: link(CAROUSEL_TILES[1]),
    },
    {
      id: 'actives-vitamins',
      label: 'Actives & vitamins',
      title: 'Every detail matters.',
      copy: 'Get to know the ingredients at the heart of your next formulation.',
      image: GLOSS_IMAGES.actives,
      href: link(CAROUSEL_TILES[5]),
    },
    {
      id: 'botanicals',
      label: 'Botanical extracts',
      title: 'Inspired by nature.',
      copy: 'Discover botanical extracts and waters, with technical details at hand.',
      image: GLOSS_IMAGES.botanicals,
      href: link(CAROUSEL_TILES[0]),
    },
  ];
}
