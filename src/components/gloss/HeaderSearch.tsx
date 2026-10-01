'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Paginated, Product } from '@/lib/types';
import { productImage } from '@/lib/gloss/images';

/**
 * The prototype's `r-search` with live suggestions.
 *
 * Suggestions come from the catalog's own search (name, INCI, CAS), debounced
 * like the prototype's. Submitting goes to the full results on /products,
 * which reads `?search=` — the parameter the catalog already uses.
 */
export function HeaderSearch({
  compact = false,
  initial = '',
  action = '/products',
  hidden = {},
}: {
  compact?: boolean;
  initial?: string;
  action?: string;
  /** Extra params to keep when searching within a filtered view. */
  hidden?: Record<string, string>;
}) {
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const id = compact ? 'header' : 'catalog';

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      api
        .get<Paginated<Product>>(`/wholesale/products?search=${encodeURIComponent(q.trim())}&limit=6&page=1`)
        .then((r) => !cancelled && setResults(r.data || []))
        .catch(() => {});
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q]);

  const showing = open && results.length > 0;

  return (
    <form action={action} className={'r-search ' + (compact ? 'r-search-compact' : '')} role="search">
      <Search size={20} aria-hidden />
      <input
        name="search"
        aria-label={compact ? 'Search ingredients' : 'Search this catalog'}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        placeholder="Search ingredients, INCI or CAS…"
        autoComplete="off"
        role="combobox"
        aria-expanded={showing}
        aria-controls={`${id}-suggestions`}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-result-${active}` : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 180)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            setActive(-1);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
            setOpen(true);
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          }
          if (e.key === 'Enter' && showing && active >= 0 && results[active]) {
            e.preventDefault();
            window.location.assign('/products/' + results[active].slug);
          }
        }}
      />
      {Object.entries(hidden)
        .filter(([k, v]) => v && k !== 'search' && k !== 'page')
        .map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <button type="submit" aria-label="Search ingredients">
        {compact ? <Search size={19} /> : 'Search'}
      </button>
      {showing && (
        <div id={`${id}-suggestions`} className="r-suggestions" role="listbox" aria-label="Ingredient suggestions">
          {results.map((p, i) => (
            <a
              key={p.id}
              role="option"
              aria-selected={i === active}
              id={`${id}-result-${i}`}
              href={'/products/' + p.slug}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImage(p)} alt="" width={42} height={42} />
              <span>
                <strong>{p.name}</strong>
                <small>{p.inciName || p.category?.name || 'COCOJOJO ingredient'}</small>
              </span>
            </a>
          ))}
          <button type="submit">See all matching ingredients</button>
        </div>
      )}
    </form>
  );
}
