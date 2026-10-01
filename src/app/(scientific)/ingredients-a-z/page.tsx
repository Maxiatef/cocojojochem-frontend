import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, SlidersHorizontal } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { HeaderSearch } from '@/components/gloss/HeaderSearch';
import { EmptyState } from '@/components/gloss/EmptyState';
import { AzEntries, AzRow, azLetter } from '@/components/gloss/library/AzEntries';
import { getCatalogIndex } from '@/components/gloss/library/catalogData';
import {
  getReferenceCategories,
  getReferenceLibrary,
  referenceCategoryId,
} from '@/lib/gloss/referenceLibrary';

/**
 * Ingredients A to Z — the prototype's `/ingredients-a-z`.
 *
 * Default view is OUR catalog: every published product (az-index), each
 * linking to its product page. `?source=makingcosmetics` switches to the
 * supplier reference library carried over from the prototype — materials we
 * can source on request, clearly labelled as reference only, not purchasable
 * and noindexed (it lists another supplier's catalog).
 *
 * Filtering, letter and paging are plain GET parameters, as in the prototype,
 * so the page works without JavaScript and the reference list (~1,100 rows)
 * never ships to the browser.
 */

export const revalidate = 3600;

const PATH = '/ingredients-a-z';
const PER_PAGE = 36;
const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
const REFERENCE_SOURCE = 'makingcosmetics';

type SearchParams = Record<string, string | string[] | undefined>;

function param(sp: SearchParams, key: string): string {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v || '').trim();
}

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const isReference = param(searchParams, 'source') === REFERENCE_SOURCE;
  const base = pageMetadata({
    title: isReference ? 'Supplier Reference Library A–Z' : 'Ingredients A–Z',
    description: isReference
      ? 'Supplier reference library: cosmetic raw materials COCOJOJO can source on request. Reference only — COCOJOJO stock and grade are not confirmed.'
      : 'Every COCOJOJO wholesale cosmetic ingredient from A to Z, with INCI names and categories. Browse by letter, filter by category and open the product page for pack sizes and pricing.',
    path: PATH,
    keywords: ['cosmetic ingredients a-z', 'ingredient glossary', 'INCI names', 'wholesale cosmetic raw materials'],
  });
  // The reference view lists another supplier's catalog: keep it out of the
  // index, but let crawlers follow its links back into ours.
  return isReference ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function IngredientsAzPage({ searchParams }: { searchParams: SearchParams }) {
  const isReference = param(searchParams, 'source') === REFERENCE_SOURCE;
  const search = param(searchParams, 'search') || param(searchParams, 'q');
  const category = param(searchParams, 'category');
  const sort = param(searchParams, 'sort') === 'za' ? 'za' : 'az';
  const rawLetter = param(searchParams, 'letter').toUpperCase();
  const letter = LETTERS.includes(rawLetter) ? rawLetter : '';

  // ── Rows + categories for the active source ─────────────────────────────
  let rows: (AzRow & { categoryKey: string | null; haystack: string })[];
  let categories: { id: string; name: string; count: number }[];

  if (isReference) {
    rows = getReferenceLibrary().map((e) => ({
      kind: 'reference' as const,
      key: e.slug,
      name: e.name,
      category: e.category,
      inci: e.inci,
      sourceUrl: e.sourceUrl,
      categoryKey: referenceCategoryId(e.category),
      haystack: `${e.name} ${e.inci || ''}`.toLowerCase(),
    }));
    categories = getReferenceCategories();
  } else {
    const catalog = await getCatalogIndex();
    rows = catalog.map((p) => ({
      kind: 'catalog' as const,
      key: p.id,
      name: p.name,
      slug: p.slug,
      category: p.categoryName,
      inci: p.inci,
      image: p.image,
      categoryKey: p.categorySlug,
      haystack: `${p.name} ${p.inci || ''}`.toLowerCase(),
    }));
    const counts = new Map<string, { id: string; name: string; count: number }>();
    for (const p of catalog) {
      if (!p.categorySlug || !p.categoryName) continue;
      const c = counts.get(p.categorySlug) || { id: p.categorySlug, name: p.categoryName, count: 0 };
      c.count++;
      counts.set(p.categorySlug, c);
    }
    categories = [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
  const totalInSource = rows.length;

  // ── Filter, sort, letter, page ──────────────────────────────────────────
  const needle = search.toLowerCase();
  let filtered = rows.filter(
    (r) => (!category || r.categoryKey === category) && (!needle || r.haystack.includes(needle)),
  );
  if (sort === 'za') filtered = [...filtered].reverse();
  const letterCounts = new Map<string, number>();
  for (const r of filtered) letterCounts.set(azLetter(r.name), (letterCounts.get(azLetter(r.name)) || 0) + 1);
  if (letter) filtered = filtered.filter((r) => azLetter(r.name) === letter);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, Number(param(searchParams, 'page')) || 1), totalPages);
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Links that keep the current view ────────────────────────────────────
  function href(overrides: Record<string, string | number | null>): string {
    const merged: Record<string, string> = {
      source: isReference ? REFERENCE_SOURCE : '',
      search,
      category,
      sort: sort === 'za' ? 'za' : '',
      letter,
      page: '',
    };
    for (const [k, v] of Object.entries(overrides)) merged[k] = v == null ? '' : String(v);
    if (merged.page === '1') merged.page = '';
    const qs = new URLSearchParams(Object.entries(merged).filter(([, v]) => v)).toString();
    return qs ? `${PATH}?${qs}` : PATH;
  }

  const sourceHidden: Record<string, string> = isReference ? { source: REFERENCE_SOURCE } : {};

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Ingredients A–Z', path: PATH },
        ])}
      />

      <div className="r-catalog-head r-wrap">
        <div>
          <span className="r-eyebrow">Discover. Understand. Create.</span>
          <h1>Ingredients, A to Z.</h1>
          <p>
            {isReference
              ? 'Browse supplier reference materials alongside the COCOJOJO collection. Source and availability are clearly identified.'
              : 'Every COCOJOJO ingredient by name, with its INCI and category. Switch to the supplier reference library for materials we can source on request.'}
          </p>
        </div>
        <HeaderSearch
          action={PATH}
          initial={search}
          hidden={{ ...sourceHidden, category, sort: sort === 'za' ? 'za' : '' }}
        />
      </div>

      <div className="r-wrap r-source-bar">
        <Link href={PATH} aria-current={!isReference ? 'page' : undefined}>
          COCOJOJO ingredients
        </Link>
        <Link href={`${PATH}?source=${REFERENCE_SOURCE}`} aria-current={isReference ? 'page' : undefined}>
          Supplier reference library
        </Link>
        <Link href="/products">Picture view</Link>
      </div>

      <div className="r-wrap r-catalog-layout">
        <aside className="r-filters">
          <details open>
            <summary>
              <SlidersHorizontal size={18} aria-hidden />
              Filter ingredients
            </summary>
            <form action={PATH}>
              {isReference && <input type="hidden" name="source" value={REFERENCE_SOURCE} />}
              {search && <input type="hidden" name="search" value={search} />}
              <label className="r-field" htmlFor="az-category">
                Category
                <select id="az-category" name="category" defaultValue={category}>
                  <option value="">All categories ({totalInSource})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>
              </label>
              {sort === 'za' && <input type="hidden" name="sort" value="za" />}
              <button className="r-btn r-primary" type="submit">
                Apply filters
              </button>
              <Link className="r-text-button" href={isReference ? `${PATH}?source=${REFERENCE_SOURCE}` : PATH}>
                Reset filters
              </Link>
            </form>
          </details>
          <div className="r-filter-help">
            <BookOpen size={24} aria-hidden />
            <h3>Find the right fit.</h3>
            <p>Compare up to four ingredients and see their properties together.</p>
            <Link href="/compare">Open comparison</Link>
          </div>
        </aside>

        <section aria-label="Ingredient results">
          {isReference && (
            <div className="library-ref-notice" role="note">
              <span>Reference library</span>
              <p>Supplier reference only. COCOJOJO stock and grade are not confirmed.</p>
            </div>
          )}

          <div className="r-results-toolbar">
            <p>
              <strong>{total.toLocaleString('en-US')}</strong> {total === 1 ? 'ingredient' : 'ingredients'}
            </p>
            <form action={PATH}>
              {isReference && <input type="hidden" name="source" value={REFERENCE_SOURCE} />}
              {search && <input type="hidden" name="search" value={search} />}
              {category && <input type="hidden" name="category" value={category} />}
              {letter && <input type="hidden" name="letter" value={letter} />}
              <label htmlFor="az-sort">
                Sort
                <select id="az-sort" name="sort" defaultValue={sort}>
                  <option value="az">Name A to Z</option>
                  <option value="za">Name Z to A</option>
                </select>
              </label>
              <button type="submit">Apply</button>
            </form>
          </div>

          <nav className="r-alphabet" aria-label="Ingredient alphabet">
            <Link href={href({ letter: null })} aria-current={!letter ? 'page' : undefined}>
              All
            </Link>
            {LETTERS.map((l) => (
              <Link
                key={l}
                href={href({ letter: l })}
                aria-current={letter === l ? 'page' : undefined}
                className={letterCounts.get(l) ? undefined : 'library-az-empty'}
                aria-label={l === '#' ? 'Names starting with a number or symbol' : undefined}
              >
                {l}
              </Link>
            ))}
          </nav>

          {pageRows.length ? (
            <AzEntries rows={pageRows} />
          ) : (
            <EmptyState
              title={totalInSource ? 'No ingredients match.' : 'The ingredient list is loading.'}
              text={
                totalInSource
                  ? 'Try another letter, search term or category.'
                  : 'We could not load the catalog just now. Please try again in a moment.'
              }
              href={isReference ? `${PATH}?source=${REFERENCE_SOURCE}` : PATH}
              label="Show all ingredients"
            />
          )}

          {totalPages > 1 && (
            <nav className="r-pagination" aria-label="Catalog pages">
              {page > 1 && <Link href={href({ page: page - 1 })}>Previous</Link>}
              <span>
                Page {page} of {totalPages}
              </span>
              {page < totalPages && <Link href={href({ page: page + 1 })}>Next</Link>}
            </nav>
          )}

          <p className="r-fine r-catalog-note">
            {isReference
              ? 'Supplier references do not establish COCOJOJO stock or grade equivalence. Original listings open on the supplier’s own site; ask us to source any material you need.'
              : 'Every entry opens its product page with pack sizes, pricing and available documents.'}
          </p>
        </section>
      </div>
    </>
  );
}
