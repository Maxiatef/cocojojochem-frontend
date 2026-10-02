'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, LoaderCircle, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { categoryImage } from '@/lib/gloss/images';
import { addReferenceToCart } from '@/lib/gloss/useUnifiedCart';
import { EmptyState } from '@/components/gloss/EmptyState';
import { CatalogBrowser } from './CatalogBrowser';

/**
 * The supplier reference library in the catalog, as the Gloss Studio
 * prototype shows it: `?source=makingcosmetics` lists the reference materials,
 * `?source=cocojojo` only our own catalog, and no source shows ours first
 * with matching reference materials beneath.
 *
 * Reference materials are not our products: no price, no stock. "Add to cart"
 * puts them in the cart's "Price to confirm" group and we source and price
 * them.
 */

export const REFERENCE_SOURCE = 'makingcosmetics';
export const OWN_SOURCE = 'cocojojo';

export interface ReferenceItem {
  name: string;
  slug: string;
  category: string;
  inci: string | null;
  sourceUrl: string | null;
}

interface ReferencePage {
  data: ReferenceItem[];
  total: number;
  page: number;
  totalPages: number;
  categories: { id: string; name: string; count: number }[];
}

function fetchReferences(params: Record<string, string>) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return fetch(`/api/reference-library?${qs}`).then((r) => {
    if (!r.ok) throw new Error('Could not load the reference library.');
    return r.json() as Promise<ReferencePage>;
  });
}

/** The prototype's reference `r-product-card`. */
export function ReferenceCard({ item }: { item: ReferenceItem }) {
  const [busy, setBusy] = useState(false);
  return (
    <article className="r-product-card">
      <Link className="r-product-photo" href={`/products/${item.slug}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={categoryImage(item.category)}
          alt={`${item.category} representative ingredient texture`}
          width={420}
          height={370}
          loading="lazy"
        />
        <span>Reference library</span>
      </Link>
      <div className="r-product-info">
        <span className="r-card-category">{item.category}</span>
        <h3>
          <Link href={`/products/${item.slug}`}>{item.name}</Link>
        </h3>
        {item.inci && <p>{item.inci}</p>}
        <div className="r-card-price">Price on request</div>
        <div className="r-card-actions">
          <button
            type="button"
            className="r-btn r-primary r-small"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await addReferenceToCart(
                { slug: item.slug, name: item.name, category: item.category, sourceUrl: item.sourceUrl || '' },
                null,
                1,
              );
              setBusy(false);
            }}
          >
            <ShoppingBag size={16} />
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

/** `?source=makingcosmetics`: the full reference library with its own filters. */
function ReferenceBrowserInner() {
  const router = useRouter();
  const pathname = usePathname() || '/products';
  const params = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const letter = params.get('letter') || '';
  const sort = params.get('sort') === 'za' ? 'za' : 'az';
  const page = Math.max(Number(params.get('page')) || 1, 1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reference-library', search, category, letter, sort, page],
    queryFn: () => fetchReferences({ search, category, letter, sort, page: String(page), limit: '24' }),
    staleTime: 5 * 60_000,
  });

  function hrefFor(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    next.set('source', REFERENCE_SOURCE);
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!('page' in updates)) next.delete('page');
    return `${pathname}?${next.toString()}`;
  }

  return (
    <div className="r-wrap r-catalog-layout">
      <aside className="r-filters">
        <details open>
          <summary>
            <SlidersHorizontal size={18} />
            Filter ingredients
          </summary>
          <div className="r-field">
            <label htmlFor="ref-category">Category</label>
            <select
              id="ref-category"
              value={category}
              onChange={(e) => router.push(hrefFor({ category: e.target.value || null }))}
            >
              <option value="">All categories ({data?.categories.reduce((n, c) => n + c.count, 0) ?? '…'})</option>
              {data?.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>
          <Link className="r-text-button" href={`${pathname}?source=${REFERENCE_SOURCE}`}>
            Reset filters
          </Link>
        </details>
        <div className="r-filter-help">
          <BookOpen size={22} />
          <h3>Supplier reference only.</h3>
          <p>
            These materials come from a supplier catalog. COCOJOJO stock and grade are not confirmed — add one to your
            cart and we confirm price and availability.
          </p>
        </div>
      </aside>

      <section aria-label="Reference results">
        <div className="r-results-toolbar">
          <p aria-live="polite">
            {data ? (
              <>
                <strong>{data.total.toLocaleString('en-US')}</strong> reference material{data.total === 1 ? '' : 's'}
              </>
            ) : (
              ' '
            )}
          </p>
          <label htmlFor="ref-sort">
            Sort
            <select id="ref-sort" value={sort} onChange={(e) => router.push(hrefFor({ sort: e.target.value }))}>
              <option value="az">Name A to Z</option>
              <option value="za">Name Z to A</option>
            </select>
          </label>
        </div>

        <nav className="r-alphabet" aria-label="Ingredient alphabet">
          <Link href={hrefFor({ letter: null })} aria-current={!letter ? 'page' : undefined}>
            All
          </Link>
          {LETTERS.map((l) => (
            <Link key={l} href={hrefFor({ letter: l })} aria-current={letter === l ? 'page' : undefined}>
              {l}
            </Link>
          ))}
        </nav>

        {isLoading && (
          <div className="g-cat-loading" role="status">
            <LoaderCircle size={30} className="r-spin" aria-hidden />
            <span className="r-visually-hidden">Loading reference materials</span>
          </div>
        )}
        {isError && <p className="r-error">Couldn’t load the reference library. Please try again.</p>}
        {data && data.data.length === 0 && (
          <EmptyState
            title="No reference materials match."
            text="Try another letter or category, or ask us to source the material you need."
            href={`/contact?subject=${encodeURIComponent('Sourcing request')}`}
            label="Ask us to source it"
          />
        )}
        {data && data.data.length > 0 && (
          <>
            <div className="r-product-grid r-catalog-grid">
              {data.data.map((item) => (
                <ReferenceCard key={item.slug} item={item} />
              ))}
            </div>
            {data.totalPages > 1 && (
              <nav className="r-pagination" aria-label="Catalog pages">
                {page > 1 && (
                  <Link href={hrefFor({ page: page > 2 ? String(page - 1) : null })} rel="prev">
                    Previous
                  </Link>
                )}
                <span>
                  Page {page} of {data.totalPages}
                </span>
                {page < data.totalPages && (
                  <Link href={hrefFor({ page: String(page + 1) })} rel="next">
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
        <p className="r-fine r-catalog-note">
          Supplier references do not establish COCOJOJO stock or grade equivalence. Prices are confirmed by our team
          before anything is charged.
        </p>
      </section>
    </div>
  );
}

/** Under "All ingredients": reference materials matching the same search. */
function ReferenceStrip() {
  const params = useSearchParams();
  const search = params.get('search') || '';
  const { data } = useQuery({
    queryKey: ['reference-strip', search],
    queryFn: () => fetchReferences({ search, limit: '8' }),
    staleTime: 5 * 60_000,
  });
  if (!data || data.total === 0) return null;
  const more = `/products?source=${REFERENCE_SOURCE}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
  return (
    <section className="r-wrap r-section" aria-labelledby="ref-strip-heading">
      <div className="r-section-heading">
        <div>
          <span className="r-eyebrow">Supplier reference library</span>
          <h2 id="ref-strip-heading">
            {search ? `${data.total.toLocaleString('en-US')} more we can source` : 'More materials we can source.'}
          </h2>
        </div>
        <Link href={more}>See all {data.total.toLocaleString('en-US')}</Link>
      </div>
      <p className="r-fine">Not stocked by COCOJOJO — add one to your cart and we confirm price and availability.</p>
      <div className="r-product-grid">
        {data.data.map((item) => (
          <ReferenceCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}

function SourceBarInner() {
  const source = useSearchParams().get('source') || '';
  const current = (value: string) => (source === value ? 'page' : undefined);
  return (
    <div className="r-wrap r-source-bar">
      <Link href="/products" aria-current={current('')}>
        All ingredients
      </Link>
      <Link href={`/products?source=${OWN_SOURCE}`} aria-current={current(OWN_SOURCE)}>
        COCOJOJO collection
      </Link>
      <Link href={`/products?source=${REFERENCE_SOURCE}`} aria-current={current(REFERENCE_SOURCE)}>
        Supplier reference library
      </Link>
      <Link href="/ingredients-a-z">A–Z view</Link>
    </div>
  );
}

function CatalogBySourceInner({ basePath }: { basePath: string }) {
  const source = useSearchParams().get('source') || '';
  if (source === REFERENCE_SOURCE) return <ReferenceBrowserInner />;
  return (
    <>
      <CatalogBrowser basePath={basePath} />
      {source !== OWN_SOURCE && <ReferenceStrip />}
    </>
  );
}

export function SourceBar() {
  return (
    <Suspense fallback={<div className="r-wrap r-source-bar" />}>
      <SourceBarInner />
    </Suspense>
  );
}

/** The catalog body for /products, chosen by `?source=`. */
export function CatalogBySource({ basePath = '/products' }: { basePath?: string }) {
  return (
    <Suspense fallback={null}>
      <CatalogBySourceInner basePath={basePath} />
    </Suspense>
  );
}
