import Link from 'next/link';
import { legalPolicies } from '@/lib/legalPolicies';

/**
 * The index of every legal notice, shown beside a policy.
 *
 * These documents cross-reference each other constantly — the Privacy Policy
 * points at the CCPA notice, which points at Do Not Sell, which points back —
 * so the whole list stays on screen rather than making someone return to
 * `/legal` between each one.
 *
 * Sticky and independently scrollable on desktop: the list is 25 items and
 * the documents run to a hundred-plus paragraphs, so a nav that scrolled away
 * with the page would be gone for the entire read.
 */
export function LegalNav({ currentSlug }: { currentSlug: string }) {
  return (
    <nav aria-label="Legal notices" className="lg:sticky lg:top-8">
      <p className="font-sci-body text-sci-eyebrow font-semibold uppercase tracking-wide text-sci-navy">
        Legal notices
      </p>

      <ul className="scrollbar-slim-light mt-4 flex max-h-[70vh] flex-col gap-0.5 overflow-y-auto pr-2">
        {legalPolicies.map((policy) => {
          const active = policy.slug === currentSlug;
          return (
            <li key={policy.slug}>
              <Link
                href={`/legal/${policy.slug}`}
                // `aria-current` rather than colour alone: the active item is
                // the reader's position in a 25-item list, and that shouldn't
                // depend on seeing a weight change.
                aria-current={active ? 'page' : undefined}
                className={`block border-l-2 py-2 pl-3 font-sci-body text-sci-label transition ${
                  active
                    ? 'border-sci-accent font-semibold text-sci-navy'
                    : 'border-transparent text-sci-muted hover:border-sci-border hover:text-sci-navy'
                }`}
              >
                {policy.footerLabel || policy.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
