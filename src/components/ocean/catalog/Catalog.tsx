import { BookOpen, Search } from 'lucide-react';
import { OceanProductCard } from '@/components/ocean/OceanProductCard';
import { OceanSearchBox } from '@/components/ocean/OceanSearchBox';
import { PackagingCard } from '@/components/ocean/packaging/PackagingPages';
import {
  catalogCategories,
  categoryImage,
  categoryLabel,
  normalizeCategory,
  referenceCount,
  supplierCounts,
  supplierCoverage,
  type CatalogProduct,
} from '@/lib/ocean/catalog-data';
import { packagingCatalog, packagingMatches } from '@/lib/ocean/packaging-data';
import { referenceCatalog, toReferenceCard } from '@/lib/ocean/references';
import { sourceName } from '@/lib/ocean/supplier-names';
import { getPriceRange } from '@/lib/pricing';
import { FilterPanel } from './FilterPanel';
import { cardProduct, type CatalogOurProduct } from './ourProducts';

/**
 * The ocean catalog (reference retail-page.tsx `Catalog`), markup unchanged,
 * used by /shop, /products and /ingredients-a-z. The reference filters one
 * merged list on the server; so do we — OUR products (backend API) take the
 * place of the reference's own "cocojojo" records, and the supplier
 * references come from the copied reference data.
 */

const applications = ['Creams', 'Lotions', 'Serums', 'Shampoos', 'Conditioners', 'Makeup', 'Soaps', 'Balms'];
const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

// Our backend categories → the reference's ingredient families, so our
// products sit in the same Category filter as the references. First match wins.
const FAMILY_RULES: [RegExp, string][] = [
  [/peptide|protein/i, 'proteins-peptides'],
  [/essential|fragrance|aroma/i, 'aromatics'],
  [/butter|wax/i, 'butters-waxes'],
  [/emulsif|solubili/i, 'emulsifiers'],
  [/surfact|cleans|soap|foam/i, 'surfactants'],
  [/thicken|gum|texture|rheolog|gel/i, 'rheology'],
  [/humect|glycerin|moistur/i, 'humectants'],
  [/preserv/i, 'preservation'],
  [/antioxid/i, 'antioxidants'],
  [/\buv\b|sunscreen/i, 'uv-filters'],
  [/chelat/i, 'chelators'],
  [/acid|exfol/i, 'exfoliants-acids'],
  [/hydrosol|botanic|extract|herb|floral water/i, 'botanicals'],
  [/oil|carrier/i, 'carrier-oils'],
  [/vitamin|active/i, 'actives-vitamins'],
  [/emollient|condition|alcohol/i, 'emollients-conditioners'],
  [/color|pigment|mineral|mica|clay/i, 'colors-minerals'],
  [/solvent/i, 'solvents'],
];

function familyOfText(text: string): string {
  for (const [re, id] of FAMILY_RULES) if (re.test(text)) return id;
  return 'formulation-aids';
}

function familyOf(p: CatalogOurProduct): string {
  return familyOfText(`${p.category?.slug || ''} ${p.category?.name || ''}`);
}

function letterOf(name: string) {
  return /^[A-Z]/i.test(name) ? name[0].toUpperCase() : '#';
}

function solubleIn(value: string | null | undefined, medium: string) {
  if (!value) return false;
  return value
    .toLowerCase()
    .split(/[,;.]|\bbut\b/)
    .some((clause) => {
      const c = clause.trim();
      return (
        c === medium ||
        (new RegExp('\\b' + medium + '\\b').test(c) &&
          /\bsoluble\b/.test(c) &&
          !/(?:in|non[ -]?)soluble|not\s+(?:readily\s+)?soluble|poorly\s+soluble/.test(c))
      );
    });
}

type Row =
  | { kind: 'ours'; p: CatalogOurProduct; name: string; slug: string; letter: string; categoryId: string; price: number }
  | { kind: 'ref'; p: CatalogProduct; name: string; slug: string; letter: string; categoryId: string; price: number };

function toRows(ours: CatalogOurProduct[]): Row[] {
  return [
    ...ours.map(
      (p): Row => ({
        kind: 'ours',
        p,
        name: p.name,
        slug: p.slug,
        letter: letterOf(p.name),
        categoryId: familyOf(p),
        price: getPriceRange(p.variants || [])?.min ?? Infinity,
      }),
    ),
    ...referenceCatalog.map(
      (p): Row => ({
        kind: 'ref',
        p,
        name: p.name,
        slug: p.slug,
        letter: p.letter,
        categoryId: p.categoryId,
        price: Infinity,
      }),
    ),
  ];
}

function spec(p: CatalogOurProduct, re: RegExp) {
  return (p.specs || [])
    .filter((s) => re.test(s.key))
    .map((s) => s.value)
    .join('; ');
}

export function Catalog({
  path,
  params: rawParams,
  ours,
}: {
  path: '/shop' | '/products' | '/ingredients-a-z';
  params: URLSearchParams;
  ours: CatalogOurProduct[];
}) {
  // Our older catalog URLs used ?search= and ?functionSlug=.
  const params = new URLSearchParams(rawParams);
  if (params.has('search')) {
    if (!params.get('q')) params.set('q', params.get('search') || '');
    params.delete('search');
  }
  if (params.has('functionSlug')) {
    if (!params.get('function')) params.set('function', params.get('functionSlug') || '');
    params.delete('functionSlug');
  }

  const az = path === '/ingredients-a-z',
    shop = path === '/shop',
    q = params.get('q')?.trim() || '',
    source = params.get('source') || (shop ? 'cocojojo' : ''),
    rawCategory = params.get('category') || '',
    category = normalizeCategory(rawCategory),
    letter = params.get('letter') || '',
    fn = params.get('function') || '',
    application = params.get('application') || '',
    solubility = params.get('solubility') || '',
    form = params.get('form') || '',
    sort = params.get('sort') || (shop ? 'featured' : 'az');

  const ourCategory = ours.find((p) => p.category?.slug === rawCategory)?.category;
  const needle = q.toLowerCase();
  const fnLower = fn.toLowerCase();

  const matchBase = (r: Row) => {
    if (r.kind === 'ours') {
      const p = r.p;
      return (
        (!source || source === 'cocojojo') &&
        (!q ||
          [
            p.name,
            p.inciName,
            p.casNumber,
            p.brand,
            p.sku,
            'COCOJOJO',
            p.category?.name,
            ...(p.functions || []).map((f) => f.name),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(needle)) &&
        (!fn || (p.functions || []).some((f) => f.name.toLowerCase() === fnLower || f.slug === fn)) &&
        (!application || p.filterText.includes(application.toLowerCase().replace(/s$/, ''))) &&
        (!solubility || solubleIn(spec(p, /solub/i), solubility)) &&
        (!form || spec(p, /appear|form/i).toLowerCase().includes(form))
      );
    }
    const p = r.p;
    return (
      (!source || (source === 'references' ? true : p.source === source)) &&
      (!q ||
        [
          p.name,
          p.inci,
          p.facts.cas,
          p.manufacturer,
          p.supplierProductId,
          sourceName(p.source),
          ...p.functions,
          ...(p.extra.applications || []),
        ]
          .join(' ')
          .toLowerCase()
          .includes(needle)) &&
      (!fn || p.functions.includes(fn)) &&
      (!application ||
        p.extra.applications?.some((x) => x.toLowerCase().includes(application.toLowerCase().replace(/s$/, '')))) &&
      (!solubility || solubleIn(p.facts.solubility, solubility)) &&
      (!form || !!p.facts.appearance?.toLowerCase().includes(form))
    );
  };
  // ?category= is a reference family id, or one of OUR category slugs (older
  // catalog URLs): then our products in that category plus the references in
  // the matching family.
  const isFamily = catalogCategories.some((c) => c.id === category);
  const slugFamily = isFamily ? category : familyOfText(rawCategory.replace(/-/g, ' '));
  const inCategory = (r: Row) =>
    !rawCategory ||
    (r.kind === 'ours'
      ? r.p.category?.slug === rawCategory || (isFamily && r.categoryId === category)
      : r.categoryId === slugFamily);

  const baseList = toRows(ours).filter((r) => matchBase(r) && (!letter || r.letter === letter));
  const list = baseList.filter((r) => inCategory(r));
  list.sort((a, b) =>
    sort === 'price-low'
      ? (a.price === b.price ? 0 : a.price - b.price) || a.name.localeCompare(b.name)
      : sort === 'za'
        ? b.name.localeCompare(a.name)
        : sort === 'featured'
          ? (a.kind === 'ours' ? 0 : 1) - (b.kind === 'ours' ? 0 : 1) ||
            (a.kind === 'ours' && b.kind === 'ours' ? Number(b.p.isFeatured) - Number(a.p.isFeatured) : 0) ||
            a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
  );

  const perPage = az ? 36 : 24,
    pages = Math.max(1, Math.ceil(list.length / perPage)),
    page = Math.max(1, Math.min(pages, Number(params.get('page')) || 1)),
    shown = list.slice((page - 1) * perPage, page * perPage);

  const url = (changes: Record<string, string>) => {
    const n = new URLSearchParams(params);
    n.delete('page');
    Object.entries(changes).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    const qs = n.toString();
    return path + (qs ? '?' + qs : '');
  };

  const categoryName = (v: string) =>
    catalogCategories.find((c) => c.id === normalizeCategory(v))?.label ||
    (ourCategory?.slug === v ? ourCategory.name : v.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()));

  const title = az
    ? 'Ingredients, A to Z.'
    : catalogCategories.find((c) => c.id === category)?.label ||
      ourCategory?.name ||
      fn ||
      (shop ? 'Your next creation starts here.' : 'Explore the ingredient library.');

  const selected = [
    ['q', q],
    ['source', source],
    ['category', rawCategory],
    ['letter', letter],
    ['function', fn],
    ['application', application],
    ['solubility', solubility],
    ['form', form],
  ].filter(([, v]) => v);

  const paramsObject = Object.fromEntries(params);
  const paramsString = params.toString();

  return (
    <>
      <div className="r-catalog-head r-wrap" data-category-catalog={category || undefined}>
        <div>
          <span className="r-eyebrow">{shop ? 'The COCOJOJO shop' : 'Discover. Understand. Create.'}</span>
          <h1>{title}</h1>
          <p>
            {shop
              ? 'Choose a published pack or request the size you need.'
              : 'Browse supplier reference materials and COCOJOJO ingredients. Source and availability are clearly identified.'}
          </p>
        </div>
        <OceanSearchBox query={q} scope={path} params={paramsObject} />
      </div>
      <div className="r-wrap r-source-bar">
        <a href={shop ? '/shop' : url({ source: '' })} aria-current={!source || shop ? 'page' : undefined}>
          {shop ? 'Shop COCOJOJO' : 'All ingredients'}
        </a>
        {!shop && (
          <a href={url({ source: 'cocojojo' })} aria-current={source === 'cocojojo' ? 'page' : undefined}>
            COCOJOJO collection
          </a>
        )}
        <a
          href={shop ? '/products?source=references' : url({ source: 'references' })}
          aria-current={source === 'references' ? 'page' : undefined}
        >
          Supplier reference library
        </a>
        <a href={(az ? '/products' : '/ingredients-a-z') + (paramsString ? '?' + paramsString : '')}>
          {az ? 'Picture view' : 'A–Z view'}
        </a>
        <a href="/suppliers">Sources &amp; coverage</a>
        <a href="/packaging">Packaging</a>
      </div>
      <div className="r-wrap r-catalog-layout">
        <aside className="r-filters">
          <FilterPanel>
            <form action={path}>
              <input type="hidden" name="q" value={q} />
              <label className="r-field">
                Supplier
                <select name="source" defaultValue={source}>
                  <option value="">All sources</option>
                  <option value="cocojojo">COCOJOJO ({ours.length})</option>
                  <option value="references">All supplier references ({referenceCount.toLocaleString('en-US')})</option>
                  {supplierCoverage.sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({supplierCounts[s.id] || 0})
                    </option>
                  ))}
                </select>
              </label>
              <label className="r-field">
                Category
                <select name="category" defaultValue={catalogCategories.some((c) => c.id === category) ? category : ''}>
                  <option value="">All categories ({baseList.length})</option>
                  {catalogCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({baseList.filter((r) => r.categoryId === c.id).length})
                    </option>
                  ))}
                </select>
              </label>
              <label className="r-field">
                Application
                <select name="application" defaultValue={application}>
                  <option value="">All applications</option>
                  {applications.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="r-field">
                Solubility
                <select name="solubility" defaultValue={solubility}>
                  <option value="">All solubilities</option>
                  <option value="water">Water</option>
                  <option value="oil">Oil</option>
                  <option value="alcohol">Alcohol</option>
                </select>
              </label>
              <label className="r-field">
                Physical form
                <select name="form" defaultValue={form}>
                  <option value="">All forms</option>
                  <option value="powder">Powder</option>
                  <option value="liquid">Liquid</option>
                  <option value="flakes">Flakes</option>
                  <option value="gel">Gel</option>
                </select>
              </label>
              {letter && <input type="hidden" name="letter" value={letter} />}{' '}
              {fn && <input type="hidden" name="function" value={fn} />}
              <input type="hidden" name="sort" value={sort} />
              <button className="r-btn r-primary">Apply filters</button>
              <a className="r-text-button" href={path}>
                Reset filters
              </a>
            </form>
          </FilterPanel>
          <div className="r-filter-help">
            <BookOpen size={24} />
            <h3>Find the right fit.</h3>
            <p>Compare up to seven ingredients and see their properties together.</p>
            <a href="/compare">Open comparison</a>
          </div>
        </aside>
        <section aria-label="Ingredient results">
          <div className="r-results-toolbar">
            <p>
              <strong>{list.length.toLocaleString('en-US')}</strong> ingredients{q ? ' matching “' + q + '”' : ''}
            </p>
            <form action={path}>
              {Object.entries(paramsObject)
                .filter(([k]) => !['sort', 'page'].includes(k))
                .map(([k, v]) => (
                  <input key={k} type="hidden" name={k} value={v} />
                ))}
              <label>
                Sort
                <select name="sort" defaultValue={sort}>
                  <option value="featured">Featured</option>
                  <option value="az">Name A to Z</option>
                  <option value="za">Name Z to A</option>
                  <option value="price-low">Published price: low to high</option>
                </select>
              </label>
              <button type="submit">Apply</button>
            </form>
          </div>
          {selected.length > 0 && (
            <div className="r-filter-chips">
              {selected.map(([k, v]) => (
                <a key={k} href={url({ [k]: '' })} aria-label={'Remove ' + k + ' filter: ' + v}>
                  {k === 'category'
                    ? categoryName(v)
                    : k === 'source'
                      ? v === 'references'
                        ? 'Supplier references'
                        : sourceName(v)
                      : v}{' '}
                  <span aria-hidden="true">×</span>
                </a>
              ))}
            </div>
          )}
          {(!shop || az) && (
            <nav className="r-alphabet" aria-label="Ingredient alphabet">
              <a href={url({ letter: '' })} aria-current={!letter ? 'page' : undefined}>
                All
              </a>
              {LETTERS.map((l) => (
                <a key={l} href={url({ letter: l })} aria-current={letter === l ? 'page' : undefined}>
                  {l}
                </a>
              ))}
            </nav>
          )}
          {shown.length ? (
            az ? (
              <div className="r-az-list">
                {shown.map((r) =>
                  r.kind === 'ours' ? (
                    <a href={'/products/' + r.slug} key={'o-' + r.slug}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.p.imageUrl || r.p.gallery?.[0]?.url || categoryImage(r.categoryId)}
                        alt=""
                        width={60}
                        height={64}
                        loading="lazy"
                      />
                      <div>
                        <small>
                          {sourceName('cocojojo')} · {r.p.category?.name || categoryLabel(r.categoryId)}
                        </small>
                        <h2>{r.name}</h2>
                        <p>{r.p.inciName || 'View technical reference'}</p>
                      </div>
                    </a>
                  ) : (
                    <a href={'/products/' + r.slug} key={r.slug}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={categoryImage(r.categoryId)} alt="" width={60} height={64} loading="lazy" />
                      <div>
                        <small>
                          {sourceName(r.p.source)} · {categoryLabel(r.categoryId)}
                        </small>
                        <h2>{r.name}</h2>
                        <p>
                          {r.p.inci ||
                            (r.p.source === 'univar' && r.p.supplierProductId
                              ? 'Supplier product ' + r.p.supplierProductId
                              : 'View technical reference')}
                        </p>
                      </div>
                    </a>
                  ),
                )}
              </div>
            ) : (
              <div className="r-product-grid r-catalog-grid">
                {shown.map((r) =>
                  r.kind === 'ours' ? (
                    <OceanProductCard key={'o-' + r.slug} item={{ kind: 'ours', product: cardProduct(r.p) }} />
                  ) : (
                    <OceanProductCard key={r.slug} item={{ kind: 'reference', ref: toReferenceCard(r.p) }} />
                  ),
                )}
              </div>
            )
          ) : (
            <div className="r-empty">
              <Search size={32} />
              <h2>No matching ingredients yet.</h2>
              <p>Try fewer filters, a common ingredient name or its INCI.</p>
              <a href={path} className="r-btn r-primary">
                Clear filters
              </a>
              <a href="/contact" className="r-text-link">
                Ask us to help you find it
              </a>
            </div>
          )}
          {pages > 1 && (
            <nav className="r-pagination" aria-label="Catalog pages">
              {page > 1 && <a href={url({ page: String(page - 1) })}>Previous</a>}
              <span>
                Page {page} of {pages}
              </span>
              {page < pages && <a href={url({ page: String(page + 1) })}>Next</a>}
            </nav>
          )}
          {q && !az && !shop && packagingCatalog.some((p) => packagingMatches(p, q)) && (
            <div className="pk-search-results">
              <div className="r-section-heading">
                <h2>Matching packaging</h2>
                <a href={'/packaging?q=' + encodeURIComponent(q)}>View all packaging results</a>
              </div>
              <div className="r-product-grid">
                {packagingCatalog
                  .filter((p) => packagingMatches(p, q))
                  .slice(0, 4)
                  .map((p) => (
                    <PackagingCard p={p} key={p.slug} />
                  ))}
              </div>
            </div>
          )}
          <p className="r-fine r-catalog-note">
            Technical filters use available published properties; records with missing properties may not appear.
            Supplier references do not establish COCOJOJO stock or grade equivalence.
          </p>
        </section>
      </div>
    </>
  );
}

/** Next 14 searchParams → URLSearchParams (first value of repeated keys). */
export function toSearchParams(sp: Record<string, string | string[] | undefined>): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value !== undefined) out.set(k, value);
  }
  return out;
}

/** True when the view lists only supplier references (kept noindex,follow). */
export function isReferenceView(params: URLSearchParams): boolean {
  const source = params.get('source') || '';
  return !!source && source !== 'cocojojo';
}
