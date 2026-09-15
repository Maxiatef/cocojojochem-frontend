/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
