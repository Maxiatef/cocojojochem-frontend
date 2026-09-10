import type { MetadataRoute } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated, ProductFunction } from '@/lib/types';
import { SITE_URL } from '@/lib/seo';

// Regenerate hourly. A catalog sitemap that's a few minutes stale is fine;
// rebuilding it on every crawler hit is not.
export const revalidate = 3600;

type AzIndex = Record<string, { id: number; name: string; slug: string }[]>;

/**
 * Generates /sitemap.xml. There was none in any form before, on a site whose
 * entire acquisition strategy is an SEO-driven ingredient catalog — so Google
 * had to discover every product page by crawling links, and had no signal
 * about which pages matter or how often they change.
 *
 * Product slugs come from /wholesale/products/az-index because it returns
 * EVERY publicly visible product in one unpaginated call, already filtered by
 * the backend's publish/visibility gate (isPublished + scheduledPublishAt +
 * visibility = PUBLIC). Sourcing them from the paginated list endpoint would
 * risk silently truncating at the default page size.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/functions`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/a-z`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/quote-request`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/terms-of-service`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // serverFetch never throws — it returns null on any failure — so a backend
  // hiccup degrades to a static-only sitemap rather than a 500 that would
  // make Search Console report the sitemap as broken.
  const [azIndex, categoriesRes, functionsRes] = await Promise.all([
    serverFetch<AzIndex>('/wholesale/products/az-index', { revalidate: 3600 }),
    serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=200', { revalidate: 3600 }),
    serverFetch<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=200', {
      revalidate: 3600,
    }),
  ]);

  const productRoutes: MetadataRoute.Sitemap = Object.values(azIndex || {})
    .flat()
    .map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Only categories that actually have published products — listing empty
  // ones invites soft-404 / thin-content flags.
  const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes?.data || [])
    .filter((c) => (c.productCount ?? 0) > 0)
    .map((c) => ({
      url: `${SITE_URL}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // There are no /functions/[slug] pages — a function links to a filtered
  // catalog view, so that filtered URL is what gets indexed.
  const functionRoutes: MetadataRoute.Sitemap = (functionsRes?.data || [])
    .filter((f) => (f.productCount ?? 0) > 0)
    .map((f) => ({
      url: `${SITE_URL}/products?functionSlug=${encodeURIComponent(f.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...functionRoutes];
}
