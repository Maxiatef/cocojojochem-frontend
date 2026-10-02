'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, LoaderCircle, X } from 'lucide-react';
import { customerApi } from '@/lib/customerApi';
import { Category, Paginated, Product, ProductFunction } from '@/lib/types';
import { ProductCard } from '@/components/gloss/ProductCard';
import { EmptyState } from '@/components/gloss/EmptyState';
import { HeaderSearch } from '@/components/gloss/HeaderSearch';
import { FilterDetails } from './FilterDetails';

/**
 * The catalog in the Gloss Studio markup (`r-catalog-layout`: filter sidebar,
 * results toolbar, `r-catalog-grid`, `r-pagination`).
 *
 * The filter engine and URL contract are carried over unchanged from
 * scientific/ProductCatalog —
 * `?category=&functionSlug=&search=&minPrice=&maxPrice=&inStockOnly=&sort=&page=`
 * — because those URLs are indexed and linked from elsewhere in the site.
 * The prototype's filter panel is a GET form; here the selects and checkbox
 * apply as soon as they change (as the old catalog did), price inputs are
 * debounced, and "Apply filters" still works as a plain form submit.
 */

type Sort = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'name_asc', label: 'Name A to Z' },
  { value: 'name_desc', label: 'Name Z to A' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
];

type ActiveFilter = { key: string; label: string; value: string; clear: () => void };

const FILTER_KEYS = ['category', 'functionSlug', 'search', 'minPrice', 'maxPrice', 'inStockOnly'];

function CatalogBrowserInner({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const sort = (searchParams.get('sort') as Sort) || 'name_asc';
  const functionSlug = searchParams.get('functionSlug') || '';
  // `category` holds a slug so URLs stay readable; resolved to an id below,
  // because the API filters on categoryId.
  const categorySlug = searchParams.get('category') || '';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  function nextParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in updates)) next.delete('page');
    return next.toString();
  }

  function updateParams(updates: Record<string, string | null>) {
    const qs = nextParams(updates);
    router.push(qs ? `?${qs}` : '?', { scroll: false });
  }

  function hrefFor(updates: Record<string, string | null>) {
    const qs = nextParams(updates);
    return qs ? `${basePath}?${qs}` : basePath;
  }

  // Debounce the price inputs before pushing them to the URL.
  useEffect(() => {
    const t = setTimeout(() => {
      if (minPriceInput !== minPrice || maxPriceInput !== maxPrice) {
        updateParams({ minPrice: minPriceInput || null, maxPrice: maxPriceInput || null });
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPriceInput, maxPriceInput]);

  // Keep the inputs in step when the URL changes from outside (chip removal,
  // "Reset filters", the back button).
  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  const { data: functionsRes } = useQuery({
    queryKey: ['storefront-functions'],
    queryFn: () =>
      customerApi.get<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=200'),
  });
  const functions = functionsRes?.data;

  const { data: categoriesRes } = useQuery({
    queryKey: ['storefront-categories'],
    queryFn: () =>
      customerApi.get<Paginated<Category>>('/wholesale/categories?page=1&limit=200&rootsOnly=true'),
  });
  const categories = categoriesRes?.data;

  const selectedCategory = categorySlug ? categories?.find((c) => c.slug === categorySlug) : undefined;
  // A slug that hasn't resolved yet must not fall through as "no category
  // filter" — that would flash the whole catalog before narrowing.
  const categoryPending = !!categorySlug && !categories;
  const categoryId = selectedCategory?.id;

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

  const selectedFunction = functionSlug ? functions?.find((f) => f.slug === functionSlug) : undefined;

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
      value:
        minPrice && maxPrice
          ? `$${minPrice} – $${maxPrice}`
          : minPrice
            ? `from $${minPrice}`
            : `up to $${maxPrice}`,
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
    updateParams(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])));
  }

  const busy = isLoading || categoryPending;
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages || Math.max(1, Math.ceil(total / 24));
  const hasNext = data?.pagination.hasNext ?? page < totalPages;

  return (
    <div className="r-wrap r-catalog-layout">
      <aside className="r-filters">
        <FilterDetails>
          <form
            action={basePath}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const val = (k: string) => String(f.get(k) || '') || null;
              updateParams({
                category: val('category'),
                functionSlug: val('functionSlug'),
                minPrice: val('minPrice'),
                maxPrice: val('maxPrice'),
                inStockOnly: f.get('inStockOnly') ? 'true' : null,
              });
            }}
          >
            {search && <input type="hidden" name="search" value={search} />}
            {sort !== 'name_asc' && <input type="hidden" name="sort" value={sort} />}

            <label className="r-field" htmlFor="catalog-category">
              Category
              <select
                id="catalog-category"
                name="category"
                value={categorySlug}
                onChange={(e) => updateParams({ category: e.target.value || null })}
              >
                <option value="">All categories</option>
                {categorySlug && categories && !selectedCategory && (
                  <option value={categorySlug}>{categorySlug}</option>
                )}
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                    {typeof c.productCount === 'number' ? ` (${c.productCount})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="r-field" htmlFor="catalog-function">
              Function
              <select
                id="catalog-function"
                name="functionSlug"
                value={functionSlug}
                onChange={(e) => updateParams({ functionSlug: e.target.value || null })}
              >
                <option value="">All functions</option>
                {functionSlug && functions && !selectedFunction && (
                  <option value={functionSlug}>{functionSlug}</option>
                )}
                {(functions || []).map((f) => (
                  <option key={f.id} value={f.slug}>
                    {f.name}
                    {typeof f.productCount === 'number' ? ` (${f.productCount})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="r-field" htmlFor="catalog-min-price">
              Min price (USD)
              <input
                id="catalog-min-price"
                name="minPrice"
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
              />
            </label>

            <label className="r-field" htmlFor="catalog-max-price">
              Max price (USD)
              <input
                id="catalog-max-price"
                name="maxPrice"
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
              />
            </label>

            <label className="g-cat-check" htmlFor="catalog-in-stock">
              <input
                id="catalog-in-stock"
                type="checkbox"
                name="inStockOnly"
                value="true"
                checked={inStockOnly}
                onChange={(e) => updateParams({ inStockOnly: e.target.checked ? 'true' : null })}
              />
              In stock only
            </label>

            <button type="submit" className="r-btn r-primary">
              Apply filters
            </button>
            <button type="button" className="r-text-button" onClick={clearAll}>
              Reset filters
            </button>
          </form>
        </FilterDetails>

        <div className="r-filter-help">
          <BookOpen size={28} aria-hidden />
          <h3>Find the right fit.</h3>
          <p>Compare up to four ingredients and see their properties together.</p>
          <Link href="/compare">Open comparison</Link>
        </div>
      </aside>

      <section aria-label="Ingredient results">
        {activeFilters.length > 0 && (
          <div className="r-filter-chips g-cat-chips" aria-live="polite">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.clear}
                aria-label={`Remove ${f.label} filter ${f.value}`}
              >
                <small>{f.label}:</small> {f.value}
                <X size={14} aria-hidden />
              </button>
            ))}
            <button type="button" className="g-cat-clear" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        <div className="r-results-toolbar">
          <p aria-live="polite">
            {data ? (
              <>
                <strong>{total.toLocaleString('en-US')}</strong> ingredient{total === 1 ? '' : 's'}
                {activeFilters.length > 0 ? ' match these filters' : ''}
              </>
            ) : (
              ' '
            )}
          </p>
          <form
            action={basePath}
            onSubmit={(e) => {
              e.preventDefault();
              const value = new FormData(e.currentTarget).get('sort');
              updateParams({ sort: value ? String(value) : null });
            }}
          >
            <label htmlFor="catalog-sort">
              Sort
              <select
                id="catalog-sort"
                name="sort"
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Apply</button>
          </form>
        </div>

        {busy && (
          <div className="g-cat-loading" role="status">
            <LoaderCircle size={30} className="r-spin" aria-hidden />
            <span className="r-visually-hidden">Loading ingredients</span>
          </div>
        )}

        {isError && <p className="r-error">Couldn’t load products. Please try again.</p>}

        {!busy && data && data.data.length === 0 && (
          <EmptyState
            title="No ingredients match these filters."
            text="Try a broader category or function, or remove a filter to see more of the catalog."
            href={activeFilters.length > 0 ? basePath : '/contact'}
            label={activeFilters.length > 0 ? 'Clear all filters' : 'Ask about an ingredient'}
          />
        )}

        {!busy && data && data.data.length > 0 && (
          <>
            <div className="r-product-grid r-catalog-grid">
              {data.data.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {(page > 1 || hasNext) && (
              <nav className="r-pagination" aria-label="Catalog pages">
                {page > 1 && (
                  <Link href={hrefFor({ page: page - 1 > 1 ? String(page - 1) : null })} rel="prev">
                    Previous
                  </Link>
                )}
                <span>
                  Page {page} of {totalPages}
                </span>
                {hasNext && (
                  <Link href={hrefFor({ page: String(page + 1) })} rel="next">
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}

        <p className="r-fine r-catalog-note">
          Prices are per pack size in USD, before shipping and tax. Ingredients without a published
          price can still be added to your cart under “Price to confirm”, and we confirm pricing and availability with you.
        </p>
      </section>
    </div>
  );
}

export function CatalogBrowser({ basePath = '/products' }: { basePath?: string }) {
  return (
    <Suspense>
      <CatalogBrowserInner basePath={basePath} />
    </Suspense>
  );
}

/**
 * The big catalog search (`r-search`, not compact). It keeps every other
 * filter in the URL as hidden fields, and resets when `?search=` changes.
 */
function CatalogSearchInner({ action }: { action: string }) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const hidden: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    hidden[key] = value;
  });
  return <HeaderSearch key={search} compact={false} initial={search} action={action} hidden={hidden} />;
}

export function CatalogSearch({ action = '/products' }: { action?: string }) {
  return (
    <Suspense fallback={<HeaderSearch compact={false} action={action} />}>
      <CatalogSearchInner action={action} />
    </Suspense>
  );
}
