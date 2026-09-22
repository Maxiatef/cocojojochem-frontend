import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Eyebrow, SciButton } from '@/components/scientific/primitives';

/**
 * The storefront's 404.
 *
 * There was none, so `notFound()` fell through to Next's built-in page: a bare
 * centred line of text with no heading, no navigation and none of the site
 * around it. An SEO crawl of a missing product reported "no H1" and "no
 * headings specified" — correctly, because there genuinely were none.
 *
 * Living inside the `(scientific)` route group means it renders with the
 * header and footer, so someone who lands here has somewhere to go rather
 * than a dead end.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  // A 404 should never be indexed, whatever led the crawler here.
  robots: { index: false, follow: false },
};

const ROUTES = [
  { href: '/products', label: 'Full ingredient catalog', hint: 'Every material we stock, filterable' },
  { href: '/categories', label: 'Browse by category', hint: 'Oils, butters, emulsifiers, actives' },
  { href: '/functions', label: 'Browse by function', hint: 'Find a material by the job it does' },
  { href: '/contact', label: 'Contact sales', hint: "Ask us what we can source" },
];

export default function NotFound() {
  return (
    <section className="bg-sci-pale py-20">
      <Container className="flex max-w-[900px] flex-col gap-6">
        <Eyebrow>Error 404</Eyebrow>

        <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[56px] md:leading-[64px]">
          We couldn&rsquo;t find that page.
        </h1>

        <p className="font-sci-body text-sci-body text-sci-muted">
          The address may be mistyped, or the material may no longer be listed. Our catalog changes
          as stock and sourcing change, so a product that was here before can be withdrawn. Nothing
          is lost &mdash; the routes below cover everything we carry, and if you were looking for a
          specific material our team can tell you whether we can still source it.
        </p>

        <h2 className="mt-2 font-sci-heading text-sci-subheading font-semibold text-sci-navy">
          Where to go instead
        </h2>

        <ul className="flex flex-col gap-3">
          {ROUTES.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
              >
                {r.label}
              </Link>
              <span className="ml-2 font-sci-body text-sci-body text-sci-muted">{r.hint}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2">
          <SciButton href="/quote-request">Request a quote &rarr;</SciButton>
        </div>
      </Container>
    </section>
  );
}
