'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { Category, Paginated, Product, ProductFunction } from '@/lib/types';
import { ProductCard } from './ProductCard';

type Sort = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

/** One applied filter, as shown in the chip bar above the results. */
type ActiveFilter = { key: string; label: string; value: string; clear: () => void };

function CheckMark() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="h-3.5 w-3.5 shrink-0">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * A selectable row in one of the sidebar facet lists (category / function).
 *
 * Selection is carried by three signals at once — a filled background, a
 * check mark, and `aria-pressed` — rather than by colour alone. The previous
 * version relied on a pale olive tint, which on a light sand background is
 * easy to miss entirely and invisible to anyone not seeing colour.
 */
function FacetOption({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm transition ${
        active
          ? 'bg-olive-600 font-medium text-white'
          : 'text-ink-soft hover:bg-sand-50 hover:text-ink'
      }`}
    >
      {active ? <CheckMark /> : <span aria-hidden className="h-3.5 w-3.5 shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {typeof count === 'number' && (
        <span className={`text-xs ${active ? 'text-white/70' : 'text-ink-soft/60'}`}>{count}</span>
      )}
    </button>
  );
}

/** Section label, carrying an "on" dot while that facet is filtering. */
function FacetHeading({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {children}
      {active && (
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-olive-600" />
      )}
    </p>
  );
}

// URL-search-param-driven catalog state — shareable/bookmarkable/back-button-safe,
// matching the real cocojojo.com wholesale catalog page's filter engine.
function ProductFilterGridInner({ fixedCategoryId }: { fixedCategoryId?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get('minPrice') || '');
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('maxPrice') || '');

  const page = Number(searchParams.get('page') || '1');
  const sort = (searchParams.get('sort') as Sort) || 'name_asc';
  const functionSlug = searchParams.get('functionSlug') || '';
  // `category` holds a slug rather than an id so the URL stays readable and
  // links elsewhere in the site can be written without knowing primary keys.
  // It is resolved to an id below, because the API filters on categoryId.
  const categorySlug = fixedCategoryId ? '' : searchParams.get('category') || '';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in updates)) next.delete('page');
    const qs = next.toString();
    router.push(qs ? `?${qs}` : '?', { scroll: false });
  }

  // Debounce free-text search/price inputs before pushing to the URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) updateParams({ search: searchInput || null });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (minPriceInput !== minPrice || maxPriceInput !== maxPrice) {
        updateParams({ minPrice: minPriceInput || null, maxPrice: maxPriceInput || null });
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPriceInput, maxPriceInput]);

  // Keep the text inputs in step when the URL changes from outside this
  // component — a chip removal, "Clear all", or the browser back button.
  useEffect(() => {
    setSearchInput(search);
  }, [search]);
  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  const { data: functionsRes } = useQuery({
    queryKey: ['storefront-functions'],
    queryFn: () => customerApi.get<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=200'),
  });
  const functions = functionsRes?.data;

  // Not fetched on a category landing page — there the category is fixed and
  // the facet is hidden, so the request would be pure waste.
  const { data: categoriesRes } = useQuery({
    queryKey: ['storefront-categories'],
    queryFn: () => customerApi.get<Paginated<Category>>('/wholesale/categories?page=1&limit=200'),
    enabled: !fixedCategoryId,
  });
  const categories = categoriesRes?.data;

  const selectedCategory = categorySlug
    ? categories?.find((c) => c.slug === categorySlug)
    : undefined;
  // A slug in the URL that hasn't resolved yet must not fall through as "no
  // category filter" — that would flash the whole catalog before narrowing.
  const categoryPending = !!categorySlug && !categories;
  const categoryId = fixedCategoryId || selectedCategory?.id;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '24');
    params.set('sort', sort);
    if (categoryId) params.set('categoryId', String(categoryId));
    if (functionSlug) params.set('functionSlug', functionSlug);
    if (search) params.set('search', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (inStockOnly) params.set('inStockOnly', 'true');
    return params.toString();
  }, [page, sort, categoryId, functionSlug, search, minPrice, maxPrice, inStockOnly]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['storefront-products', queryString],
    queryFn: () => customerApi.get<Paginated<Product>>(`/wholesale/products?${queryString}`),
    enabled: !categoryPending,
  });

  const selectedFunction = functionSlug
    ? functions?.find((f) => f.slug === functionSlug)
    : undefined;

  const activeFilters: ActiveFilter[] = [];
  if (categorySlug) {
    activeFilters.push({
      key: 'category',
      label: 'Category',
      value: selectedCategory?.name || categorySlug,
      clear: () => updateParams({ category: null }),
    });
  }
  if (functionSlug) {
    activeFilters.push({
      key: 'functionSlug',
      label: 'Function',
      value: selectedFunction?.name || functionSlug,
      clear: () => updateParams({ functionSlug: null }),
    });
  }
  if (search) {
    activeFilters.push({
      key: 'search',
      label: 'Search',
      value: `“${search}”`,
      clear: () => updateParams({ search: null }),
    });
  }
  if (minPrice || maxPrice) {
    activeFilters.push({
      key: 'price',
      label: 'Price',
      value: minPrice && maxPrice ? `$${minPrice} – $${maxPrice}` : minPrice ? `from $${minPrice}` : `up to $${maxPrice}`,
      clear: () => updateParams({ minPrice: null, maxPrice: null }),
    });
  }
  if (inStockOnly) {
    activeFilters.push({
      key: 'inStockOnly',
      label: 'Stock',
      value: 'In stock only',
      clear: () => updateParams({ inStockOnly: null }),
    });
  }

  function clearAll() {
    updateParams({
      category: null,
      functionSlug: null,
      search: null,
      minPrice: null,
      maxPrice: null,
      inStockOnly: null,
    });
  }

  const busy = isLoading || categoryPending;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-7">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Search</label>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, SKU, CAS…"
            className="w-full border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-olive-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="Min"
              className="w-full border border-sand-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-olive-600"
            />
            <span className="text-ink-soft">–</span>
            <input
              type="number"
              min={0}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              placeholder="Max"
              className="w-full border border-sand-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-olive-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => updateParams({ inStockOnly: e.target.checked ? 'true' : null })}
              className="h-4 w-4 rounded border-sand-300 text-olive-600 focus:ring-olive-500"
            />
            In stock only
          </label>
        </div>

        {/* Hidden on a category landing page: the category is already fixed
            there, so offering to change it would contradict the page itself. */}
        {!fixedCategoryId && categories && categories.length > 0 && (
          <div>
            <FacetHeading active={!!categorySlug}>Category</FacetHeading>
            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              <FacetOption
                active={!categorySlug}
                label="All categories"
                onClick={() => updateParams({ category: null })}
              />
              {categories.map((c) => (
                <FacetOption
                  key={c.id}
                  active={categorySlug === c.slug}
                  label={c.name}
                  count={c.productCount}
                  onClick={() => updateParams({ category: categorySlug === c.slug ? null : c.slug })}
                />
              ))}
            </div>
          </div>
        )}

        {functions && functions.length > 0 && (
          <div>
            <FacetHeading active={!!functionSlug}>Function</FacetHeading>
            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              <FacetOption
                active={!functionSlug}
                label="All functions"
                onClick={() => updateParams({ functionSlug: null })}
              />
              {functions.map((f) => (
                <FacetOption
                  key={f.id}
                  active={functionSlug === f.slug}
                  label={f.name}
                  count={f.productCount}
                  onClick={() => updateParams({ functionSlug: functionSlug === f.slug ? null : f.slug })}
                />
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        {/* Applied filters, restated where the results are. The sidebar
            highlight alone is easy to miss once it has scrolled out of view,
            which is how people end up believing the catalog is half empty. */}
        {activeFilters.length > 0 && (
          <div
            aria-live="polite"
            className="mb-5 flex flex-wrap items-center gap-2 border border-olive-300 bg-olive-50 px-3 py-2.5"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-olive-800">
              Filters
            </span>
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 border border-olive-300 bg-white py-1 pl-2.5 pr-1 text-sm text-ink"
              >
                <span className="text-xs uppercase tracking-wide text-ink-soft">{f.label}:</span>
                <span className="font-medium">{f.value}</span>
                <button
                  type="button"
                  onClick={f.clear}
                  aria-label={`Remove ${f.label} filter ${f.value}`}
                  className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-ink-soft transition hover:bg-olive-100 hover:text-olive-800"
                >
                  <span aria-hidden>×</span>
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto text-sm font-medium text-olive-700 underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-sand-200 pb-4">
          <p className="text-sm text-ink-soft">
            {data ? `${data.pagination.total} product${data.pagination.total === 1 ? '' : 's'}` : ''}
            {data && activeFilters.length > 0 ? ' match these filters' : ''}
          </p>
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="border border-sand-300 bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-olive-600"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {busy && (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
          </div>
        )}
        {isError && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn’t load products. Please try again.
          </p>
        )}
        {!busy && data && data.data.length === 0 && (
          <div className="border border-dashed border-sand-300 py-16 text-center">
            <p className="text-sm text-ink-soft">No products match these filters.</p>
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-3 border border-sand-300 px-3 py-1.5 text-sm text-ink transition hover:border-olive-600"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!busy && data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {data.data.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
                className="border border-sand-300 px-3 py-1.5 text-sm text-ink disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-ink-soft">
                Page {page} of {data.pagination.totalPages || 1}
              </span>
              <button
                disabled={!data.pagination.hasNext}
                onClick={() => updateParams({ page: String(page + 1) })}
                className="border border-sand-300 px-3 py-1.5 text-sm text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ProductFilterGrid(props: { fixedCategoryId?: number }) {
  return (
    <Suspense>
      <ProductFilterGridInner {...props} />
    </Suspense>
  );
}
