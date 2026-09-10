import type { Metadata } from 'next';

/**
 * Single source of truth for the canonical site URL.
 *
 * Everything SEO-related has to agree on this: `metadataBase` (which resolves
 * relative Open Graph and canonical URLs), sitemap.xml, robots.txt and every
 * JSON-LD `@id`. A mismatch here is worse than having no canonical at all —
 * it tells Google the real page lives somewhere that doesn't exist.
 *
 * Env-driven so the domain can change without a code edit. Set
 * NEXT_PUBLIC_SITE_URL at build time (it's inlined, not read at runtime).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cocojojochem.com').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'CocoJojoChem';
export const SITE_TAGLINE = 'Wholesale Cosmetic Ingredients';

/** Absolute URL for a site-relative path. JSON-LD requires absolute URLs. */
export function absoluteUrl(path = '/'): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Baseline keywords every page inherits, describing what this business
 * actually sells. Per-page keywords are appended to these.
 *
 * Note: `<meta name="keywords">` has been ignored by Google since 2009 and
 * carries only marginal weight in Bing — it is emitted because it costs
 * nothing, NOT because it ranks. The terms below matter because they're also
 * used to build titles, descriptions and JSON-LD, which search engines do read.
 */
export const BASE_KEYWORDS = [
  'wholesale cosmetic ingredients',
  'bulk cosmetic ingredients',
  'cosmetic ingredient supplier',
  'private label cosmetic ingredients',
  'bulk skincare ingredients',
  'INCI ingredients supplier',
  'cosmetic raw materials',
  'bulk carrier oils',
  'bulk butters and waxes',
  'emulsifiers surfactants wholesale',
  'B2B cosmetic ingredients',
  'drum quantity ingredients',
];

/** De-duplicated, trimmed keyword list. Empty entries are dropped. */
export function buildKeywords(...groups: (string | null | undefined)[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const raw of group) {
      const value = (raw || '').trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

/**
 * Clamps a description toward the 120-160 character window that reads well as
 * a search snippet (and is what this project's own SEO analyzer scores —
 * see SeoAnalyzerService.computeScore). Longer text is cut at a word boundary
 * rather than mid-word.
 */
export function clampDescription(text: string | null | undefined, fallback: string): string {
  const value = (text || '').replace(/\s+/g, ' ').trim() || fallback;
  if (value.length <= 160) return value;
  const cut = value.slice(0, 157);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/**
 * Builds a page's Metadata with the pieces that are easy to forget and
 * costly to omit: a self-referencing canonical (prevents duplicate-content
 * splits from query strings like ?page=2 or ?functionSlug=), and Open
 * Graph/Twitter tags so shared links render a card instead of a bare URL.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  images,
  type = 'website',
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  images?: (string | null | undefined)[];
  type?: 'website' | 'article';
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImages = (images || []).filter(Boolean).map((src) => absoluteUrl(src as string));

  return {
    title,
    description,
    keywords: buildKeywords(keywords, BASE_KEYWORDS),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      ...(ogImages.length ? { images: ogImages } : {}),
    },
    twitter: {
      card: ogImages.length ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImages.length ? { images: ogImages } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
