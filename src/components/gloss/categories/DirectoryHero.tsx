import Link from 'next/link';
import { Fragment, ReactNode } from 'react';
import { GlossPhoto } from './GlossPhoto';

export type Crumb = { name: string; href?: string };

/** The product page's `r-breadcrumb`, ending on the current page. */
export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav className="r-breadcrumb r-wrap" aria-label="Breadcrumb">
      {trail.map((c, i) => (
        <Fragment key={c.name + i}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {c.href ? (
            <Link href={c.href}>{c.name}</Link>
          ) : (
            <span aria-current="page">{c.name}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

/**
 * The prototype's `library-hero`: copy on the left, a photo on the right with
 * a Georgia figure card over it. Used as the head of a single category or
 * function — the prototype's equivalent is the catalog head over a filtered
 * shop, in this same pale-teal band.
 */
export function DirectoryHero({
  eyebrow,
  title,
  intro,
  meta,
  image,
  imageAlt,
  figure,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  meta: { icon: ReactNode; text: string }[];
  image: string;
  imageAlt: string;
  figure: { value: string | number; label: string };
}) {
  return (
    <section className="library-hero">
      <div className="r-wrap library-hero-inner">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          {meta.length > 0 && (
            <div className="library-hero-meta">
              {/* Flat icon/span pairs, as the gloss sheet's mobile rule for
                  `.library-hero-meta span:last-child` expects. */}
              {meta.map((m) => (
                <Fragment key={m.text}>
                  {m.icon}
                  <span>{m.text}</span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
        <div className="library-hero-image">
          {/* The photo column is display:none under 760px, so the tiny mobile
              `sizes` keeps phones from downloading a banner they never show. */}
          <GlossPhoto src={image} alt={imageAlt} fill priority sizes="(max-width: 760px) 1px, 40vw" />
          <span aria-hidden="true">
            {figure.value}
            <span>{figure.label}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
