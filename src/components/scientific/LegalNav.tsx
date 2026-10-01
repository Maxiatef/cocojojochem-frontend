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
    <nav aria-label="Legal notices" className="r-legal-nav">
      <p className="r-legal-nav-title">Legal notices</p>
      <ul>
        {legalPolicies.map((policy) => (
          <li key={policy.slug}>
            <Link
              href={`/legal/${policy.slug}`}
              // `aria-current` rather than colour alone: the active item is
              // the reader's position in a 25-item list, and that shouldn't
              // depend on seeing a weight change.
              aria-current={policy.slug === currentSlug ? 'page' : undefined}
            >
              {policy.footerLabel || policy.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
