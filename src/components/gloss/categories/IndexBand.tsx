import Link from 'next/link';
import { ReactNode } from 'react';

type Tile = { href: string; kicker: string; letter: string; caption: string };

/**
 * The home page's dark `r-library-band`, reused as the "other ways into the
 * catalog" panel at the foot of the directory pages.
 */
export function IndexBand({
  eyebrow,
  title,
  text,
  cta,
  tiles,
}: {
  eyebrow: string;
  title: ReactNode;
  text: string;
  cta: { href: string; label: string };
  tiles: [Tile, Tile];
}) {
  return (
    <section className="r-library-band">
      <div className="r-wrap">
        <div>
          <span className="r-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{text}</p>
          <Link className="r-btn r-white" href={cta.href}>
            {cta.label}
          </Link>
        </div>
        <div className="g-library-tiles" aria-label="Other ways to browse">
          {tiles.map((t) => (
            <Link key={t.href} href={t.href}>
              <span>{t.kicker}</span>
              <strong aria-hidden="true">{t.letter}</strong>
              <small>{t.caption}</small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
