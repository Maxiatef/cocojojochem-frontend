import Link from 'next/link';
import { BookOpen, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/gloss/ProductCard';
import { EmptyState } from '@/components/gloss/EmptyState';

/**
 * The shop's body (`r-catalog-layout`): a filter column with the
 * "Find the right fit." card, and the product grid. The filtering itself
 * lives on the catalog, so the column hands over to it with this listing's
 * filter already applied instead of duplicating the filter engine here.
 */
export function ListingLayout({
  label,
  products,
  total,
  sortedNote = 'Sorted A–Z',
  chips,
  filterHref,
  filterText,
  backLink,
  empty,
}: {
  label: string;
  products: Product[];
  total: number;
  sortedNote?: string;
  chips?: { href: string; label: string; count?: number }[];
  filterHref: string;
  filterText: string;
  backLink: { href: string; label: string };
  empty: { title: string; text: string };
}) {
  const truncated = total > products.length;
  return (
    <div className="r-wrap r-catalog-layout">
      <aside className="r-filters">
        <details open>
          <summary>
            <SlidersHorizontal size={18} aria-hidden="true" />
            Filter ingredients
          </summary>
          <div className="g-cat-filter-body">
            <p>{filterText}</p>
            <Link className="r-btn r-primary" href={filterHref}>
              Filter &amp; sort
            </Link>
            <Link className="r-text-button" href={backLink.href}>
              {backLink.label}
            </Link>
          </div>
        </details>
        <div className="r-filter-help">
          <BookOpen size={24} aria-hidden="true" />
          <h3>Find the right fit.</h3>
          <p>Compare up to four ingredients and see their properties together.</p>
          <Link href="/compare">Open comparison</Link>
        </div>
      </aside>

      <section aria-label={label}>
        {chips && chips.length > 0 && (
          <nav className="r-filter-chips" aria-label="Subcategories">
            {chips.map((c) => (
              <Link key={c.href} href={c.href}>
                {c.label}
                {typeof c.count === 'number' && <small>{c.count}</small>}
              </Link>
            ))}
          </nav>
        )}

        <div className="r-results-toolbar">
          <p>
            <strong>{total}</strong> {total === 1 ? 'ingredient' : 'ingredients'}
            {products.length > 0 && <> · {sortedNote}</>}
          </p>
          {products.length > 0 && (
            <Link className="r-text-link" href={filterHref}>
              View in the full catalog
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <EmptyState title={empty.title} text={empty.text} href="/quote-request" label="Request a quote" />
        ) : (
          <div className="r-product-grid r-catalog-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {truncated && (
          <p className="g-cat-truncated">
            Showing the first {products.length} of {total}.{' '}
            <Link className="r-text-link" href={filterHref}>
              See every ingredient in the catalog
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}

