import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * The storefront's 404, in the Gloss Studio layout.
 *
 * Inside the storefront route group, so a lost visitor still has the header,
 * search and footer — and the routes below cover everything we carry.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  // A 404 should never be indexed, whatever led the crawler here.
  robots: { index: false, follow: false },
};

const ROUTES: [string, string, string][] = [
  ['/products', 'Shop ingredients', 'Every material we stock, filterable'],
  ['/categories', 'Browse by category', 'Oils, butters, emulsifiers, actives'],
  ['/ingredients-a-z', 'Ingredients A–Z', 'Find a material by its name'],
  ['/contact', 'Contact us', 'Ask us what we can source'],
];

export default function NotFound() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Error 404</span>
        <h1>We couldn’t find that page.</h1>
        <p>
          The address may be mistyped, or the material may no longer be listed. Our catalog changes as stock and
          sourcing change. The links below cover everything we carry.
        </p>
      </div>
      <section className="r-wrap r-section">
        <h2>Where to go instead</h2>
        <div className="docs-grid">
          {ROUTES.map(([href, label, hint]) => (
            <Link key={href} href={href} className="info-card">
              <h3>{label}</h3>
              <p>{hint}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
