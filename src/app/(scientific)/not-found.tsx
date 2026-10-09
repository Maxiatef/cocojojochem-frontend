import type { Metadata } from 'next';
import BrandLogo from '@/components/ocean/motion/brand-logo';

/**
 * The storefront's 404, in the reference's not-found markup. It renders inside
 * the storefront shell's <main>, so the reference's <main> becomes a div.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  // A 404 should never be indexed, whatever led the crawler here.
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="r-not-found">
      <div className="r-not-found-logo">
        <BrandLogo />
      </div>
      <h1>Let’s find your next ingredient.</h1>
      <p>This page could not be found. Browse the shop or search the full ingredient library.</p>
      <a href="/shop">Shop ingredients</a> · <a href="/ingredients-a-z">Browse A–Z</a>
    </div>
  );
}
