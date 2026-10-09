import { ArrowUpRight, FileText, Package, Search } from 'lucide-react';
import { PackagingScroll } from './packaging-scroll';
import { PackagingVisual } from './packaging-visual';
import { PackagingPurchase } from './PackagingPurchase';
import { ReferenceActions, type ReferenceCardData } from '@/components/ocean/OceanProductCard';
import { OceanSearchBox } from '@/components/ocean/OceanSearchBox';
import { packagingCatalog, packagingMatches, packagingTypes, type PackagingProduct } from '@/lib/ocean/packaging-data';
import { sourceName } from '@/lib/ocean/supplier-names';

/**
 * The ocean design's packaging pages (reference packaging-pages.tsx), markup
 * unchanged. Packaging items are supplier references: "Request" puts them in
 * the cart's "Price to confirm" section, like the ingredient references.
 */

const PAGE_SIZE = 24;

function toCard(p: PackagingProduct): ReferenceCardData {
  return {
    slug: p.slug,
    name: p.name,
    category: 'Packaging',
    categoryId: 'packaging',
    sourceLabel: p.subtype,
    inci: null,
    image: p.image,
    sourceUrl: p.sourceUrl,
    href: '/packaging/' + p.slug,
  };
}

export function PackagingCard({ p }: { p: PackagingProduct }) {
  return (
    <article className="r-product-card pk-card">
      <a className="r-product-photo" href={'/packaging/' + p.slug}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.imageNote} width={420} height={370} loading="lazy" />
        <span>{p.subtype}</span>
      </a>
      <div className="r-product-info">
        <span className="r-card-category">{sourceName(p.source)} reference</span>
        <h3>
          <a href={'/packaging/' + p.slug}>{p.name}</a>
        </h3>
        <p>
          {Object.entries(p.specifications)
            .slice(0, 2)
            .map(([k, v]) => k + ': ' + v)
            .join(' · ') || 'Choose a format. Confirm the details.'}
        </p>
        <div className="r-card-price">Price on request</div>
        <ReferenceActions data={toCard(p)} />
      </div>
    </article>
  );
}

export function PackagingCatalog({ params }: { params: URLSearchParams }) {
  const q = params.get('q')?.trim() || '',
    type = params.get('type') || '',
    source = params.get('source') || '',
    sort = params.get('sort') || 'featured';
  const results = packagingCatalog
    .filter((p) => (!q || packagingMatches(p, q)) && (!type || p.subtype === type) && (!source || p.source === source))
    .sort((a, b) =>
      sort === 'za'
        ? b.name.localeCompare(a.name)
        : sort === 'featured'
          ? Number(b.imageNote.startsWith('Supplier product')) - Number(a.imageNote.startsWith('Supplier product')) ||
            a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
    );
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE)),
    page = Math.max(1, Math.min(pages, Number(params.get('page')) || 1));
  const link = (changes: Record<string, string>) => {
    const p = new URLSearchParams(params);
    p.delete('page');
    Object.entries(changes).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    const qs = p.toString();
    return '/packaging' + (qs ? '?' + qs : '');
  };
  return (
    <PackagingScroll>
      <section className="r-wrap pk-hero" data-category-catalog="packaging">
        <div>
          <span className="r-eyebrow">A home for your formula</span>
          <h1>
            Good chemistry.
            <br />
            <em>Beautifully contained.</em>
          </h1>
          <p>
            Discover cosmetic bottles, jars, dispensers and closures. Build your packaging shortlist, then confirm
            specifications and quantities with our team.
          </p>
          <div className="pk-hero-links">
            <a className="r-btn r-primary" href="#packaging-catalog">
              Explore packaging <ArrowUpRight size={18} />
            </a>
            <a className="r-text-link" href="/services/packaging-filling">
              Filling & packaging services
            </a>
          </div>
        </div>
        <PackagingVisual />
      </section>
      <section className="r-wrap r-section" id="packaging-catalog">
        <div className="r-section-heading">
          <div>
            <span className="r-eyebrow">The packaging collection</span>
            <h2>Find your format.</h2>
          </div>
          <a href="/categories">
            All categories <ArrowUpRight size={18} />
          </a>
        </div>
        <nav className="pk-types" aria-label="Packaging types">
          <a href={link({ type: '' })} aria-current={!type ? 'page' : undefined}>
            All packaging
          </a>
          {packagingTypes.map((t) => (
            <a key={t} href={link({ type: t })} aria-current={type === t ? 'page' : undefined}>
              {t}
            </a>
          ))}
        </nav>
        <div className="pk-catalog-tools">
          <OceanSearchBox query={q} scope="/packaging" params={Object.fromEntries(params)} />
          <form action="/packaging">
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="type" value={type} />
            <label className="r-field">
              Supplier
              <select name="source" defaultValue={source}>
                <option value="">All suppliers</option>
                {[...new Set(packagingCatalog.map((p) => p.source))].map((s) => (
                  <option key={s} value={s}>
                    {sourceName(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="r-field">
              Sort
              <select name="sort" defaultValue={sort}>
                <option value="featured">Featured formats</option>
                <option value="az">Name A to Z</option>
                <option value="za">Name Z to A</option>
              </select>
            </label>
            <button className="r-btn r-outline">Apply</button>
          </form>
        </div>
        <p className="r-results-count">
          <strong>{results.length}</strong> packaging references{q ? ' matching “' + q + '”' : ''}
        </p>
        <div className="r-product-grid">
          {results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((p) => (
            <PackagingCard key={p.slug} p={p} />
          ))}
        </div>
        {!results.length && (
          <div className="r-empty">
            <Search size={32} />
            <h2>No packaging matches yet.</h2>
            <p>Try another name, material or format.</p>
            <a href="/packaging" className="r-btn r-primary">
              Clear filters
            </a>
          </div>
        )}
        {pages > 1 && (
          <nav className="r-pagination" aria-label="Packaging pages">
            {page > 1 && <a href={link({ page: String(page - 1) })}>Previous</a>}
            <span>
              Page {page} of {pages}
            </span>
            {page < pages && <a href={link({ page: String(page + 1) })}>Next</a>}
          </nav>
        )}
        <p className="r-fine pk-source-note">
          These are generic supplier references. Photos are representative format references from Lotioncrafter; the
          exact item, closure, dimensions, availability and minimum order are confirmed with your quote.
        </p>
      </section>
      <section className="r-wrap pk-service-band">
        <Package size={36} />
        <div>
          <span className="r-eyebrow">Bring the details together</span>
          <h2>Formula. Format. Finished product.</h2>
          <p>Discuss filling, labels, artwork and package compatibility alongside your packaging request.</p>
        </div>
        <a className="r-btn r-primary" href="/services/packaging-filling">
          Explore packaging services
        </a>
      </section>
    </PackagingScroll>
  );
}

export function PackagingDetail({ p }: { p: PackagingProduct }) {
  const related = packagingCatalog.filter((x) => x.slug !== p.slug && x.subtype === p.subtype).slice(0, 4);
  return (
    <>
      <nav className="r-breadcrumb r-wrap" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/packaging">Packaging</a>
        <span>/</span>
        <a href={'/packaging?type=' + encodeURIComponent(p.subtype)}>{p.subtype}</a>
      </nav>
      <section className="r-wrap r-product-detail pk-detail">
        <div className="r-detail-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={p.imageNote} width={740} height={740} {...({ fetchpriority: 'high' } as object)} />
          <span>{p.imageNote}</span>
        </div>
        <div className="r-detail-copy">
          <span className="r-product-source">{sourceName(p.source)} packaging reference</span>
          <h1>{p.name}</h1>
          <p className="r-description">{p.description}</p>
          <div className="r-product-traits">
            <a href={'/packaging?type=' + encodeURIComponent(p.subtype)}>{p.subtype}</a>
            <a href="/services/packaging-filling">Filling & packaging</a>
          </div>
          <PackagingPurchase data={toCard(p)} />
        </div>
      </section>
      <div className="r-wrap r-detail-content">
        <div>
          <section>
            <span className="r-eyebrow">Find the right fit</span>
            <h2>Packaging specifications.</h2>
            <dl className="r-specifications">
              <div>
                <dt>Supplier reference</dt>
                <dd>{sourceName(p.source)}</dd>
              </div>
              <div>
                <dt>Packaging type</dt>
                <dd>{p.subtype}</dd>
              </div>
              {Object.entries(p.specifications).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p>
              Confirm the exact dimensions, capacity, neck finish, closure, decoration and minimum order in your quote.
              Validate compatibility with your finished formula before production.
            </p>
          </section>
          <section>
            <h2>Source & project support.</h2>
            <div className="r-doc-grid">
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
                <FileText size={24} />
                <h3>Original supplier listing</h3>
                <p>Review current specifications and supplied components.</p>
                <span>View source</span>
              </a>
              <a href={'/contact?subject=' + encodeURIComponent('Packaging specification request: ' + p.name)}>
                <Package size={24} />
                <h3>Request dimensions & samples</h3>
                <p>Share your preferred size, formula type and order quantity.</p>
                <span>Discuss requirements</span>
              </a>
            </div>
          </section>
        </div>
        <aside className="r-reading-aside">
          <Package size={28} />
          <h3>A package that works with your formula.</h3>
          <p>Plan for dispensing, product protection and the experience you want to create.</p>
          <a href="/services/stability-compatibility">Compatibility testing</a>
          <a href="/services/label-artwork">Labels & artwork</a>
          <a href="/services/private-label">Private label</a>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="r-wrap r-section">
          <div className="r-section-heading">
            <h2>More in this format.</h2>
            <a href="/packaging">Explore packaging</a>
          </div>
          <div className="r-product-grid">
            {related.map((x) => (
              <PackagingCard key={x.slug} p={x} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
