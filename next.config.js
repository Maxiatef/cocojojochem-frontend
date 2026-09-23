/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hosts next/image may resize. Category photos are multi-megabyte PNGs on
  // static.cocojojo.com; served raw, /categories downloaded ~5.9 MB of them.
  // Through the optimizer each card gets a right-sized AVIF/WebP instead,
  // cached for a year (the source files are content-addressed, never edited).
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'static.cocojojo.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // Lets a one-off build run somewhere other than .next, so it does not fight
  // a dev server that is already using it. Unset in normal use.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),

  // The standalone /terms-of-service and /privacy-policy pages are gone —
  // /legal/[slug] is now the only place those documents live. These are the
  // URLs that were in the sitemap and are linked from outside, so they
  // redirect rather than 404.
  async redirects() {
    return [
      { source: '/terms-of-service', destination: '/legal/terms-of-service', permanent: true },
      { source: '/privacy-policy', destination: '/legal/privacy-policy', permanent: true },
    ];
  },
};

module.exports = nextConfig;
