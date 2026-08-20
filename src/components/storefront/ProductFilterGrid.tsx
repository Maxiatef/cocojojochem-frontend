'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { Paginated, Product, ProductFunction } from '@/lib/types';
import { ProductCard } from './ProductCard';

type Sort = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

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
    router.push(`?${next.toString()}`, { scroll: false });
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

  const { data: functionsRes } = useQuery({
    queryKey: ['storefront-functions'],
    queryFn: () => customerApi.get<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=200'),
  });
  const functions = functionsRes?.data;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '24');
    params.set('sort', sort);
    if (fixedCategoryId) params.set('categoryId', String(fixedCategoryId));
    if (functionSlug) params.set('functionSlug', functionSlug);
    if (search) params.set('search', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (inStockOnly) params.set('inStockOnly', 'true');
    return params.toString();
  }, [page, sort, fixedCategoryId, functionSlug, search, minPrice, maxPrice, inStockOnly]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['storefront-products', queryString],
    queryFn: () => customerApi.get<Paginated<Product>>(`/wholesale/products?${queryString}`),
  });

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

        {functions && functions.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Function</p>
            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              <button
                onClick={() => updateParams({ functionSlug: null })}
                className={`block w-full px-2 py-1.5 text-left text-sm ${
                  !functionSlug ? 'bg-olive-100 text-olive-800' : 'text-ink-soft hover:bg-sand-50'
                }`}
              >
                All functions
              </button>
              {functions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateParams({ functionSlug: functionSlug === f.slug ? null : f.slug })}
                  className={`flex w-full items-center justify-between px-2 py-1.5 text-left text-sm ${
                    functionSlug === f.slug ? 'bg-olive-100 text-olive-800' : 'text-ink-soft hover:bg-sand-50'
                  }`}
                >
                  <span>{f.name}</span>
                  {typeof f.productCount === 'number' && (
                    <span className="text-xs text-ink-soft/60">{f.productCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-sand-200 pb-4">
          <p className="text-sm text-ink-soft">
            {data ? `${data.pagination.total} product${data.pagination.total === 1 ? '' : 's'}` : ''}
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

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
          </div>
        )}
        {isError && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn’t load products. Please try again.
          </p>
        )}
        {data && data.data.length === 0 && (
          <p className="border border-dashed border-sand-300 py-16 text-center text-sm text-ink-soft">
            No products match these filters.
          </p>
        )}

        {data && data.data.length > 0 && (
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
