import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { EmptyState } from '@/components/gloss/EmptyState';
import { DocumentLibrary } from '@/components/gloss/library/DocumentLibrary';
import { getCatalogDocuments } from '@/components/gloss/library/catalogData';

/**
 * Technical document library — the prototype's `/documents`.
 *
 * Lists the documents attached to our published products (SDS, COA, TDS,
 * spec sheets, certificates). There is no list endpoint for documents, so
 * catalogData walks the az-index and reads each product's detail record —
 * bounded and cached for an hour — and the search runs client-side.
 */

export const revalidate = 3600;

const DOCUMENTATION_REQUEST = '/contact?subject=' + encodeURIComponent('Documentation request');

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

export default async function DocumentsPage({ searchParams }: { searchParams: SearchParams }) {
  const documents = await getCatalogDocuments();

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
        <p>
          Search the documents published for COCOJOJO ingredients, or request documentation for your specific
          grade and batch.
        </p>
      </div>

      <section className="r-wrap r-section">
        {documents.length ? (
          <DocumentLibrary
            documents={documents}
            initialQuery={param(searchParams, 'q')}
            initialType={param(searchParams, 'type').toUpperCase()}
          />
        ) : (
          <EmptyState
            title="Documents are available on request."
            text="Ask for a safety data sheet, certificate of analysis or specification sheet for any COCOJOJO ingredient."
            href={DOCUMENTATION_REQUEST}
            label="Request documentation"
          />
        )}
        <p className="r-fine">
          Dates and revisions appear within each document. Need a certificate of analysis for a specific batch?{' '}
          <Link href={DOCUMENTATION_REQUEST}>Request documentation</Link>.
        </p>
      </section>
    </>
  );
}
