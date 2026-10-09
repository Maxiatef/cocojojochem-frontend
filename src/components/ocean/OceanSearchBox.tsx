'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

/**
 * The ocean design's search (reference app/store-client.tsx `SearchBox`):
 * compact in the header, full-size on catalog pages, with a suggestion list
 * from /api/search (src/app/api/search/route.ts — our catalog plus the
 * supplier references, same response shape as the reference's endpoint).
 */
export interface SearchSuggestion {
  slug: string;
  name: string;
  image: string;
  href: string;
  /** e.g. "COCOJOJO ingredient", "Redox reference", "Packaging · Lotioncrafter" */
  label: string;
}

export function OceanSearchBox({
  compact = false,
  query = '',
  scope = '',
  params = {},
}: {
  compact?: boolean;
  query?: string;
  /** '/packaging' searches packaging; anything else searches ingredients. */
  scope?: string;
  /** Other filters to keep as hidden fields when the form submits. */
  params?: Record<string, string>;
}) {
  const [value, setValue] = useState(query);
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(() => {
      const kind = scope === '/packaging' ? 'packaging' : compact ? 'all' : 'ingredients';
      fetch(`/api/search?q=${encodeURIComponent(value)}&scope=${kind}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : { products: [] }))
        .then((d) => setResults(d.products || []))
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [value, scope, compact]);

  const prefix = compact ? 'header' : 'catalog';

  return (
    <form
      action={compact ? '/products' : scope || '/products'}
      className={'r-search ' + (compact ? 'r-search-compact' : '')}
      role="search"
    >
      <Search size={20} />
      <input
        name="q"
        aria-label={compact ? 'Search ingredients or packaging' : 'Search this catalog'}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setResults([]);
          setOpen(true);
          setIndex(-1);
        }}
        placeholder={
          scope === '/packaging'
            ? 'Search bottles, jars, closures…'
            : compact
              ? 'Search ingredients or packaging…'
              : 'Search ingredients, INCI or CAS…'
        }
        autoComplete="off"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={`${prefix}-suggestions`}
        aria-autocomplete="list"
        aria-activedescendant={index >= 0 ? `${prefix}-result-${index}` : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            setIndex(-1);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIndex((i) => Math.min(i + 1, results.length - 1));
            setOpen(true);
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setIndex((i) => Math.max(0, i - 1));
          }
          if (e.key === 'Enter' && open && index >= 0 && results[index]) {
            e.preventDefault();
            window.location.assign(results[index].href);
          }
        }}
      />
      {Object.entries(params)
        .filter(([k, v]) => v && k !== 'q' && k !== 'page')
        .map(([k, v]) => (
          <input type="hidden" key={k} name={k} value={v} />
        ))}
      <button
        type="submit"
        aria-label={
          scope === '/packaging' ? 'Search packaging' : compact ? 'Search ingredients or packaging' : 'Search ingredients'
        }
      >
        {compact ? <Search size={19} /> : <>Search</>}
      </button>
      {open && results.length > 0 && (
        <div id={`${prefix}-suggestions`} className="r-suggestions" role="listbox" aria-label="Product suggestions">
          {results.map((p, i) => (
            <a role="option" aria-selected={i === index} id={`${prefix}-result-${i}`} href={p.href} key={p.slug}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" width={42} height={42} />
              <span>
                <strong>{p.name}</strong>
                <small>{p.label}</small>
              </span>
            </a>
          ))}
          <button type="submit">See all matching results</button>
        </div>
      )}
    </form>
  );
}
