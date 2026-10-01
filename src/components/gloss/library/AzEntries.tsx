import Link from 'next/link';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { categoryImage } from '@/lib/gloss/images';

/**
 * One row of the prototype's `r-az-list`, grouped under letter headings.
 *
 * Our products are a single link to their product page, exactly like the
 * prototype. A supplier reference entry has no page of its own here and two
 * separate actions (request it, open the supplier's listing), so it renders as
 * an `article` with the same layout instead of one big link — anchors cannot
 * nest.
 */

export type AzRow =
  | {
      kind: 'catalog';
      key: string;
      name: string;
      slug: string;
      category: string | null;
      inci: string | null;
      image: string;
    }
  | {
      kind: 'reference';
      key: string;
      name: string;
      category: string;
      inci: string | null;
      sourceUrl: string | null;
    };

export function azLetter(name: string): string {
  const c = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
}

/** Sourcing requests for reference materials go through the contact form. */
export function referenceRequestHref(name: string): string {
  return '/contact?subject=' + encodeURIComponent('Sourcing request: ' + name);
}

function CatalogRow({ row }: { row: Extract<AzRow, { kind: 'catalog' }> }) {
  return (
    <Link href={'/products/' + row.slug}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={row.image} alt="" width={60} height={64} loading="lazy" />
      <div>
        <small>
          COCOJOJO{row.category ? ' · ' + row.category : ''}
        </small>
        <h3>{row.name}</h3>
        <p>{row.inci || 'View ingredient specifications'}</p>
      </div>
    </Link>
  );
}

function ReferenceRow({ row }: { row: Extract<AzRow, { kind: 'reference' }> }) {
  return (
    <article className="library-ref-row">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={categoryImage(row.category)} alt="" width={60} height={64} loading="lazy" />
      <div>
        <small>Reference library · {row.category}</small>
        <h3>{row.name}</h3>
        <p>{row.inci || 'INCI not listed'}</p>
        <div className="library-ref-actions">
          <Link className="r-btn r-primary r-small" href={referenceRequestHref(row.name)}>
            <ShoppingBag size={16} aria-hidden />
            Request
          </Link>
          {row.sourceUrl && (
            <a href={row.sourceUrl} target="_blank" rel="noopener nofollow">
              <ExternalLink size={14} aria-hidden />
              Original listing<span className="sr-only"> for {row.name} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function AzEntries({ rows }: { rows: AzRow[] }) {
  const groups: { letter: string; rows: AzRow[] }[] = [];
  for (const row of rows) {
    const letter = azLetter(row.name);
    const last = groups[groups.length - 1];
    if (last && last.letter === letter) last.rows.push(row);
    else groups.push({ letter, rows: [row] });
  }

  return (
    <div className="library-az-groups">
      {groups.map((group) => (
        <section
          key={group.letter}
          className="library-az-group"
          aria-labelledby={'az-letter-' + (group.letter === '#' ? 'num' : group.letter)}
        >
          <h2 className="library-az-letter" id={'az-letter-' + (group.letter === '#' ? 'num' : group.letter)}>
            {group.letter}
          </h2>
          <div className="r-az-list">
            {group.rows.map((row) =>
              row.kind === 'catalog' ? <CatalogRow key={row.key} row={row} /> : <ReferenceRow key={row.key} row={row} />,
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
