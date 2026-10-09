import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { BookOpen, Search } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getPriceRange } from '@/lib/pricing';
import { OceanProductCard } from '@/components/ocean/OceanProductCard';
import { OceanSearchBox } from '@/components/ocean/OceanSearchBox';
import { FilterPanel } from './FilterPanel';

/**
 * Our indexable category / function pages, drawn as the reference's filtered
 * catalog (retail-page.tsx `Catalog` at /products?category=<id>): the
 * `r-catalog-head`, the `r-source-bar`, the filter column with "Find the right
 * fit.", the results toolbar, filter chips, alphabet, `r-catalog-grid` and
 * pagination — markup unchanged, filled with our products.
 *
 * Everything is a plain GET form or link (as on the reference), so the page
 * is fully server-rendered. The group select submits `?<groupParam>=<slug>`;
 * the route redirects that to the chosen group's own page.
 */

export const CATALOG_PER_PAGE = 24;

export type CatalogSort = 'featured' | 'az' | 'za' | 'price-low';

export interface CatalogGroupOption {
  slug: string;
  label: string;
  count?: number;
}

export interface CatalogQuery {
  sort: CatalogSort;
  letter: string;
  page: number;
}

/** Reads sort / letter / page from Next's searchParams. */
export function readCatalogQuery(searchParams: Record<string, string | string[] | undefined> = {}): CatalogQuery {
  const one = (k: string) => {
    const v = searchParams[k];
    return (Array.isArray(v) ? v[0] : v) || '';
  };
  const sort = one('sort');
  return {
    sort: (['featured', 'az', 'za', 'price-low'] as const).includes(sort as CatalogSort)
      ? (sort as CatalogSort)
      : 'az',
    letter: one('letter'),
    page: Math.max(1, Number(one('page')) || 1),
  };
}

/**
 * The filter column's group select submits `?<param>=<slug>`; send that to the
 * chosen group's own page, keeping sort and letter. Call it from both
 * generateMetadata (a real 307, before streaming) and the page.
 */
export function redirectToPickedGroup(
  searchParams: Record<string, string | string[] | undefined> = {},
  param: string,
  current: string,
  base: string,
) {
  const picked = typeof searchParams[param] === 'string' ? (searchParams[param] as string) : '';
  if (!picked || picked === current) return;
  const rest = new URLSearchParams();
  for (const k of ['sort', 'letter']) {
    const v = searchParams[k];
    if (typeof v === 'string' && v) rest.set(k, v);
  }
  const query = rest.toString();
  redirect(`${base}/${encodeURIComponent(picked)}${query ? '?' + query : ''}`);
}

const letterOf = (name: string) => {
  const c = name.trim().charAt(0).toUpperCase();
  return c >= 'A' && c <= 'Z' ? c : '#';
};

const minPrice = (p: Product) => getPriceRange(p.variants || [])?.min ?? Infinity;

export function CategoryCatalog({
  path,
  title,
  intro,
  products,
  query,
  groupLabel,
  groupParam,
  groupOptions,
  currentGroup,
  groupChip,
  related = [],
  children,
}: {
  /** This page's own path, e.g. /categories/carrier-oils. */
  path: string;
  title: string;
  intro: string;
  /** Every product in the group (already fetched). */
  products: Product[];
  query: CatalogQuery;
  /** "Category" or "Function". */
  groupLabel: string;
  groupParam: string;
  groupOptions: CatalogGroupOption[];
  currentGroup: string;
  /** The chip naming the group; removing it opens the group index. */
  groupChip: { label: string; removeHref: string };
  /** Narrower groups (subcategories), listed as plain chips after the filters. */
  related?: { href: string; label: string }[];
  /** Extra sections after the catalog (long-form copy). */
  children?: ReactNode;
}) {
  const { sort, letter } = query;
  const list = products.filter((p) => !letter || letterOf(p.name) === letter);
  list.sort((a, b) =>
    sort === 'price-low'
      ? minPrice(a) - minPrice(b) || a.name.localeCompare(b.name)
      : sort === 'za'
        ? b.name.localeCompare(a.name)
        : sort === 'featured'
          ? Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
  );
  const pages = Math.max(1, Math.ceil(list.length / CATALOG_PER_PAGE));
  const page = Math.min(pages, query.page);
  const shown = list.slice((page - 1) * CATALOG_PER_PAGE, page * CATALOG_PER_PAGE);

  const current: Record<string, string> = {};
  if (sort !== 'az') current.sort = sort;
  if (letter) current.letter = letter;
  const url = (changes: Record<string, string>) => {
    const n = new URLSearchParams(current);
    Object.entries(changes).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    const s = n.toString();
    return path + (s ? '?' + s : '');
  };

  return (
    <>
      <div className="r-catalog-head r-wrap" data-category-catalog={currentGroup}>
        <div>
          <span className="r-eyebrow">Discover. Understand. Create.</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        <OceanSearchBox scope="/products" />
      </div>
      <div className="r-wrap r-source-bar">
        <a href="/products">All ingredients</a>
        <a href="/products?source=cocojojo">COCOJOJO collection</a>
        <a href="/products?source=references">Supplier reference library</a>
        <a href="/ingredients-a-z">A–Z view</a>
        <a href="/suppliers">Sources & coverage</a>
        <a href="/packaging">Packaging</a>
      </div>
      <div className="r-wrap r-catalog-layout">
        <aside className="r-filters">
          <FilterPanel>
            <form action={path}>
              <label className="r-field">
                {groupLabel}
                <select name={groupParam} defaultValue={currentGroup}>
                  {groupOptions.map((o) => (
                    <option key={o.slug} value={o.slug}>
                      {o.label}
                      {o.count != null ? ` (${o.count})` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="r-field">
                Sort
                <select name="sort" defaultValue={sort}>
                  <option value="featured">Featured</option>
                  <option value="az">Name A to Z</option>
                  <option value="za">Name Z to A</option>
                  <option value="price-low">Published price: low to high</option>
                </select>
              </label>
              {letter && <input type="hidden" name="letter" value={letter} />}
              <button className="r-btn r-primary">Apply filters</button>
              <a className="r-text-button" href={path}>
                Reset filters
              </a>
            </form>
          </FilterPanel>
          <div className="r-filter-help">
            <BookOpen size={24} />
            <h3>Find the right fit.</h3>
            <p>Compare up to seven ingredients and see their properties together.</p>
            <a href="/compare">Open comparison</a>
          </div>
        </aside>
        <section aria-label="Ingredient results">
          <div className="r-results-toolbar">
            <p>
              <strong>{list.length.toLocaleString('en-US')}</strong> ingredients
            </p>
            <form action={path}>
              {letter && <input type="hidden" name="letter" value={letter} />}
              <label>
                Sort
                <select name="sort" defaultValue={sort}>
                  <option value="featured">Featured</option>
                  <option value="az">Name A to Z</option>
                  <option value="za">Name Z to A</option>
                  <option value="price-low">Published price: low to high</option>
                </select>
              </label>
              <button type="submit">Apply</button>
            </form>
          </div>
          <div className="r-filter-chips">
            <a href={groupChip.removeHref} aria-label={`Remove ${groupLabel.toLowerCase()} filter: ${groupChip.label}`}>
              {groupChip.label} <span aria-hidden="true">×</span>
            </a>
            {letter && (
              <a href={url({ letter: '' })} aria-label={'Remove letter filter: ' + letter}>
                {letter} <span aria-hidden="true">×</span>
              </a>
            )}
            {related.map((r) => (
              <a key={r.href} href={r.href}>
                {r.label}
              </a>
            ))}
          </div>
          <nav className="r-alphabet" aria-label="Ingredient alphabet">
            <a href={url({ letter: '' })} aria-current={!letter ? 'page' : undefined}>
              All
            </a>
            {['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((l) => (
              <a key={l} href={url({ letter: l })} aria-current={letter === l ? 'page' : undefined}>
                {l}
              </a>
            ))}
          </nav>
          {shown.length ? (
            <div className="r-product-grid r-catalog-grid">
              {shown.map((p) => (
                <OceanProductCard key={p.id} item={{ kind: 'ours', product: p }} />
              ))}
            </div>
          ) : (
            <div className="r-empty">
              <Search size={32} />
              <h2>No matching ingredients yet.</h2>
              <p>Try fewer filters, a common ingredient name or its INCI.</p>
              <a href={letter ? path : '/products'} className="r-btn r-primary">
                Clear filters
              </a>
              <a href="/contact" className="r-text-link">
                Ask us to help you find it
              </a>
            </div>
          )}
          {pages > 1 && (
            <nav className="r-pagination" aria-label="Catalog pages">
              {page > 1 && <a href={url({ page: page - 1 > 1 ? String(page - 1) : '' })}>Previous</a>}
              <span>
                Page {page} of {pages}
              </span>
              {page < pages && <a href={url({ page: String(page + 1) })}>Next</a>}
            </nav>
          )}
          <p className="r-fine r-catalog-note">
            Prices and pack sizes are published per listing; documentation is available on request. Supplier
            references in the full catalog do not establish COCOJOJO stock or grade equivalence.
          </p>
        </section>
      </div>
      {children}
    </>
  );
}
