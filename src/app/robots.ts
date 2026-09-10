import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Generates /robots.txt. There was none before, so crawlers had no sitemap
// pointer and nothing stopping them indexing the admin dashboard, the cart or
// account pages — all of which waste crawl budget and can surface in results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/account',
          '/cart',
          '/checkout',
          // Filter permutations are near-infinite and all render the same
          // catalog; the canonical on /products points at the clean URL.
          '/products?',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
