'use client';

import '@/styles/storefront-styles';

/**
 * Loads the storefront stylesheets from a client component. Used by the
 * site-wide 404 (src/app/not-found.tsx): Next 14 drops global CSS imported by
 * the root not-found's server modules, but keeps CSS from client components.
 */
export function StorefrontStyles() {
  return null;
}
