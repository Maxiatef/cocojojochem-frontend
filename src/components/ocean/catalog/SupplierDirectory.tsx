import { BookOpen, FileText } from 'lucide-react';
import { referenceCount, supplierCounts, supplierCoverage } from '@/lib/ocean/catalog-data';
import review from '@/lib/ocean/data/catalog-review-summary.json';
import { packagingCatalog } from '@/lib/ocean/packaging-data';

/** The ocean design's sources page (reference supplier-directory.tsx), markup unchanged. */
export function SupplierDirectory() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">The sources behind the materials</span>
        <h1>
          More possibilities.
          <br />
          Clearer sources.
        </h1>
        <p>
          {referenceCount.toLocaleString('en-US')} reviewed generic ingredient references, alongside the COCOJOJO
          collection.
        </p>
      </div>
      <section className="r-wrap r-section">
        <div className="r-muted-panel">
          <BookOpen size={25} />
          <h2>Know what you’re exploring.</h2>
          <p>
            We reviewed {review.originalReferences.toLocaleString('en-US')} supplier records, excluded branded,
            company-specific, unclear and non-cosmetic entries, and added {review.newGenericIngredients} independently
            sourced generic ingredients. The library is organized into {review.categoryCount} ingredient families.
          </p>
          <p>
            Original supplier links identify each reference. Confirm the supplied grade, full composition, documents and
            COCOJOJO availability before ordering. This is a selected catalog, not an exhaustive market inventory or a
            trademark, patent or regulatory clearance. Permitted applications vary by market.
          </p>
          <a href="/ingredients-a-z" className="r-btn r-primary">
            Browse the ingredient library
          </a>{' '}
          <a href="/downloads/generic-cosmetic-ingredients.csv" className="r-btn r-outline" download>
            Download ingredient sheet
          </a>{' '}
          <a href="/downloads/cosmetic-ingredient-categories.csv" className="r-btn r-outline" download>
            Download categories
          </a>
        </div>
        <p className="r-muted-panel">
          Looking for bottles, jars or closures? {packagingCatalog.length} generic packaging references are available in
          a separate <a href="/packaging">packaging collection</a>. They are kept outside the ingredient and INCI
          library.
        </p>
        <div className="r-section-heading">
          <h2>{supplierCoverage.sources.length} reviewed sources.</h2>
          <p>Reviewed October 8, 2026</p>
        </div>
        <div className="r-doc-grid">
          {supplierCoverage.sources.map((source) => {
            const count = supplierCounts[source.id] || 0;
            return (
              <article className="r-reading-aside" key={source.id}>
                <FileText size={24} />
                <h2>{source.name}</h2>
                <p>
                  <strong>{count.toLocaleString('en-US')}</strong> generic ingredient references
                </p>
                {(source.productFamilyCount || 0) > 0 && (
                  <p>{source.productFamilyCount} entries describe product families, rather than individual grades.</p>
                )}
                <p>{source.coverageNote}</p>
                {count > 0 && <a href={'/products?source=' + source.id}>Browse these products</a>}
                <a href={source.catalogUrl || source.homepage} target="_blank" rel="noopener noreferrer">
                  Open original catalog
                </a>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
