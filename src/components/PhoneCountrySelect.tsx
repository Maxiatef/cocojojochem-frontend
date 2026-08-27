'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRY_CODES } from '@/lib/countryCodes';

// Native <select> can't render <img>/flag icons per <option> in any browser,
// and flag EMOJI render as plain two-letter codes on Windows (no color-flag
// font support there) — hence this custom dropdown using real SVG flags
// from the `flag-icons` package instead.
export function PhoneCountrySelect({
  value,
  onChange,
}: {
  value: string; // ISO2 code, e.g. "us"
  onChange: (iso2: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRY_CODES.find((c) => c.iso2 === value) || COUNTRY_CODES.find((c) => c.iso2 === 'us')!;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.iso2.includes(q),
    );
  }, [search]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
    else setSearch('');
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Select country code"
        aria-expanded={open}
        className="flex h-full items-center gap-1.5 border border-sand-300 px-2.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
      >
        <span className={`fi fi-${selected.iso2}`} />
        <span>+{selected.dialCode}</span>
        <span className="text-ink-soft/60">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-72 border border-sand-300 bg-white shadow-lg">
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country or code…"
            className="w-full border-b border-sand-200 px-3 py-2 text-sm text-ink outline-none"
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-sm text-ink-soft">No matches.</p>
            )}
            {filtered.map((c) => (
              <button
                key={c.iso2}
                type="button"
                onClick={() => {
                  onChange(c.iso2);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-sand-50 ${
                  c.iso2 === selected.iso2 ? 'bg-sand-50' : ''
                }`}
              >
                <span className={`fi fi-${c.iso2}`} />
                <span className="flex-1 truncate text-ink">{c.name}</span>
                <span className="text-ink-soft">+{c.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
