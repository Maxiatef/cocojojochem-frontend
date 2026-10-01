'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, SearchX } from 'lucide-react';
import type { ProductDocType } from '@/lib/types';
import type { CatalogDocument } from './catalogData';
import { DOC_TYPE_LABEL, DOC_TYPES } from './docTypes';

const PER_PAGE = 24;

/**
 * The prototype's document search (`r-document-search` + `r-doc-search-results`).
 *
 * The prototype submits a GET form; here the whole (small) document list is
 * already on the page, so filtering is instant and client-side. The form still
 * has `action="/documents"` and named fields, so it works before hydration,
 * and the URL is kept in sync so a filtered view can be shared.
 */
export function DocumentLibrary({
  documents,
  initialQuery,
  initialType,
}: {
  documents: CatalogDocument[];
  initialQuery: string;
  initialType: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState<ProductDocType | ''>(
    DOC_TYPES.includes(initialType as ProductDocType) ? (initialType as ProductDocType) : '',
  );
  const [page, setPage] = useState(1);

  const presentTypes = useMemo(() => {
    const seen = new Set(documents.map((d) => d.type));
    return DOC_TYPES.filter((t) => seen.has(t));
  }, [documents]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return documents.filter(
      (d) =>
        (!type || d.type === type) &&
        (!needle ||
          d.productName.toLowerCase().includes(needle) ||
          d.title.toLowerCase().includes(needle) ||
          (d.label || '').toLowerCase().includes(needle)),
    );
  }, [documents, q, type]);

  useEffect(() => setPage(1), [q, type]);

  // Keep the address bar shareable without a navigation per keystroke.
  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (type) params.set('type', type);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/documents?${qs}` : '/documents');
  }, [q, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <>
      <form className="r-document-search" action="/documents" onSubmit={(e) => e.preventDefault()}>
        <label className="r-field" htmlFor="doc-q">
          Ingredient or document name
          <input
            id="doc-q"
            name="q"
            placeholder="For example, jojoba"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="r-field" htmlFor="doc-type">
          Document type
          <select id="doc-type" name="type" value={type} onChange={(e) => setType(e.target.value as ProductDocType | '')}>
            <option value="">All documents</option>
            {(presentTypes.length ? presentTypes : DOC_TYPES).map((t) => (
              <option key={t} value={t}>
                {DOC_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <button className="r-btn r-primary" type="submit">
          Search documents
        </button>
      </form>

      <p className="r-results-count" aria-live="polite">
        {filtered.length.toLocaleString('en-US')} published {filtered.length === 1 ? 'document' : 'documents'}
      </p>

      {visible.length ? (
        <div className="r-doc-search-results">
          {visible.map((d) => (
            <article key={d.id}>
              <FileText size={24} aria-hidden />
              <div>
                <Link href={'/products/' + d.productSlug}>
                  <h2>{d.productName}</h2>
                </Link>
                <p>
                  {d.title}
                  {d.label ? ' · ' + d.label : ''} · COCOJOJO · {d.format}
                </p>
              </div>
              <a className="r-btn r-outline r-small" href={d.url} target="_blank" rel="noopener noreferrer">
                {d.format === 'PDF' ? 'Open PDF' : 'Open file'}
                <span className="sr-only">
                  : {d.title} for {d.productName} (opens in a new tab)
                </span>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="r-empty">
          <SearchX size={38} aria-hidden />
          <h2>No documents match.</h2>
          <p>Try another ingredient name or document type, or ask us for the paperwork you need.</p>
          <button
            type="button"
            className="r-btn r-primary"
            onClick={() => {
              setQ('');
              setType('');
            }}
          >
            Show all documents
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="r-pagination" aria-label="Document pages">
          {current > 1 && (
            <button type="button" onClick={() => setPage(current - 1)}>
              Previous
            </button>
          )}
          <span>
            Page {current} of {totalPages}
          </span>
          {current < totalPages && (
            <button type="button" onClick={() => setPage(current + 1)}>
              Next
            </button>
          )}
        </nav>
      )}
    </>
  );
}
