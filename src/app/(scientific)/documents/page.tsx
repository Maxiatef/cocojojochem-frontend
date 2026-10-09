import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { getCatalogDocuments } from '@/components/gloss/library/catalogData';
import { referenceCatalog } from '@/lib/ocean/references';
import { sourceName } from '@/lib/ocean/supplier-names';

/**
 * Technical document library — the reference's `/documents`.
 *
 * A searchable, paginated list (24 per page) of every published document:
 * first the documents attached to OUR products (SDS, COA, TDS, spec sheets,
 * certificates — read from our backend, cached for an hour by catalogData),
 * then the supplier PDFs from the reference library (cocojojo records
 * excluded). The search is a plain GET form, exactly as in the reference.
 */

export const revalidate = 3600;

const PAGE_SIZE = 24;

type SearchParams = Record<string, string | string[] | undefined>;

function param(sp: SearchParams, key: string): string {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v || '').trim();
}

export const metadata: Metadata = pageMetadata({
  title: 'Technical Document Library',
  description:
    'Safety data sheets, certificates of analysis, technical data and specification sheets for COCOJOJO wholesale cosmetic ingredients. Search by ingredient or document type.',
  path: '/documents',
  keywords: ['safety data sheet', 'SDS', 'certificate of analysis', 'COA', 'technical data sheet', 'specification sheet'],
});

type LibraryDoc = { key: string; name: string; slug: string; title: string; detail: string; url: string; format: string };

/** Supplier PDFs from the reference library (server-only data, built once). */
const supplierDocs: LibraryDoc[] = referenceCatalog.flatMap((p) =>
  (p.extra.documents || []).map((d, i) => ({
    key: d.url + i,
    name: p.name,
    slug: p.slug,
    title: d.title,
    detail: sourceName(p.source) + ' supplier reference',
    url: d.url,
    format: 'PDF',
  })),
);

/** The reference filters on the document title; our types map onto the same three choices. */
const OUR_TYPE: Record<string, string[]> = { sds: ['SDS'], fact: ['TDS', 'SPEC_SHEET'], analysis: ['COA'] };

export default async function DocumentsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = param(searchParams, 'q');
  const type = param(searchParams, 'type').toLowerCase();
  const needle = q.toLowerCase();

  const ours: LibraryDoc[] = (await getCatalogDocuments())
    .filter((d) => !type || OUR_TYPE[type]?.includes(d.type) || d.title.toLowerCase().includes(type))
    .map((d) => ({
      key: d.id,
      name: d.productName,
      slug: d.productSlug,
      title: d.label ? d.title + ' · ' + d.label : d.title,
      detail: 'COCOJOJO',
      url: d.url,
      format: d.format,
    }));
  const suppliers = supplierDocs.filter((d) => !type || d.title.toLowerCase().includes(type));
  const docs = [...ours, ...suppliers].filter(
    (d) => !needle || (d.name + ' ' + d.title).toLowerCase().includes(needle),
  );

  const pages = Math.max(1, Math.ceil(docs.length / PAGE_SIZE));
  const page = Math.max(1, Math.min(pages, Number(param(searchParams, 'page')) || 1));
  const link = (n: number) => '/documents?' + new URLSearchParams({ q, type, page: String(n) });

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Technical documents', path: '/documents' },
        ])}
      />
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">The technical document library</span>
        <h1>Good information. Within reach.</h1>
        <p>Search published supplier PDFs, or request documentation for your specific COCOJOJO grade and batch.</p>
      </div>
      <section className="r-wrap r-section">
        <form action="/documents" className="r-document-search">
          <label className="r-field">
            Ingredient or document name
            <input name="q" defaultValue={q} placeholder="For example, niacinamide" />
          </label>
          <label className="r-field">
            Document type
            <select name="type" defaultValue={type}>
              <option value="">All documents</option>
              <option value="sds">Safety data sheet</option>
              <option value="fact">Fact sheet</option>
              <option value="analysis">Certificate of analysis</option>
            </select>
          </label>
          <button className="r-btn r-primary">Search documents</button>
        </form>
        <p className="r-results-count">{docs.length.toLocaleString('en-US')} published documents</p>
        <div className="r-doc-search-results">
          {docs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((d) => (
            <article key={d.key}>
              <FileText size={24} />
              <div>
                <a href={'/products/' + d.slug}>
                  <h2>{d.name}</h2>
                </a>
                <p>
                  {d.title} · {d.detail} · {d.format}
                </p>
              </div>
              <a className="r-btn r-outline r-small" href={d.url} target="_blank" rel="noopener noreferrer">
                Open {d.format === 'PDF' ? 'PDF' : 'document'}
              </a>
            </article>
          ))}
        </div>
        {!docs.length && (
          <p className="r-muted-panel">
            No documents match your search.{' '}
            <a href="/contact?subject=Technical%20document%20request">Request the document you need.</a>
          </p>
        )}
        <nav className="r-pagination" aria-label="Document pages">
          {page > 1 && <a href={link(page - 1)}>Previous</a>}
          <span>
            Page {page} of {pages}
          </span>
          {page * PAGE_SIZE < docs.length && <a href={link(page + 1)}>Next</a>}
        </nav>
        <p className="r-fine">
          Dates and revisions appear within each source document. Supplier reference PDFs do not establish the specification or
          analysis of a COCOJOJO batch.
        </p>
      </section>
    </>
  );
}
