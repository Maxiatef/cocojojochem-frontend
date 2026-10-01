'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, FlaskConical, Layers } from 'lucide-react';
import type { HeroCollection } from './homeCategories';

export interface HeroSpotlight {
  href: string;
  name: string;
  /** Pack size of the default variant, e.g. "1 Gallon". */
  pack: string | null;
  /** Formatted price, or "Price on request". */
  price: string;
}

/**
 * The prototype's `g-hero`: copy on the left, a three-slide "ingredient edit"
 * on the right with tabs, a glass spotlight note for a real product, and a
 * sheen that follows a mouse pointer (skipped for touch and reduced motion).
 */
export function HomeHero({ collections, spotlight }: { collections: HeroCollection[]; spotlight: HeroSpotlight | null }) {
  const [active, setActive] = useState(0);
  const current = collections[active];
  const total = String(collections.length).padStart(2, '0');

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--shine-x', ((e.clientX - box.left) / box.width) * 100 + '%');
    e.currentTarget.style.setProperty('--shine-y', ((e.clientY - box.top) / box.height) * 100 + '%');
  }

  return (
    <section className="g-hero" onPointerMove={onPointerMove}>
      <div className="g-hero-sheen" aria-hidden="true" />
      <div className="r-wrap g-hero-layout">
        <div className="g-hero-copy">
          <span className="g-kicker">
            <FlaskConical size={16} /> COCOJOJO CHEMICAL
          </span>
          <h1>
            Great formulas.
            <br />
            Start with
            <br />
            <em>great ingredients.</em>
          </h1>
          <p>
            Bring your next idea to life. Explore oils, actives and cosmetic ingredients with the information you need
            to create.
          </p>
          <div className="g-hero-actions">
            <Link className="r-btn r-primary" href="/products">
              Shop ingredients
            </Link>
            <Link className="r-btn r-glass" href="/ingredients-a-z">
              Explore A–Z
            </Link>
          </div>
          <div className="g-hero-links">
            <Link href="/documents">
              <BookOpen size={18} />
              Technical library
            </Link>
            <Link href="/formulation-tools">
              <FlaskConical size={18} />
              Formulation tools
            </Link>
          </div>
        </div>

        <div className="g-hero-visual">
          <div className="g-image-border">
            {/* Keyed by slide so the frame remounts and replays g-image-in. */}
            <div className="g-ingredient-image" key={current.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image}
                alt={current.label + ' representative ingredient photograph'}
                width={700}
                height={760}
                fetchPriority="high"
              />
              <span className="g-photo-label">
                THE INGREDIENT EDIT{' '}
                <span>
                  {String(active + 1).padStart(2, '0')} / {total}
                </span>
              </span>
              <div className="g-image-caption">
                <span>{current.label}</span>
                <h2>{current.title}</h2>
                <Link href={current.href}>Explore this collection</Link>
              </div>
            </div>
          </div>

          {spotlight ? (
            <Link className="g-glass-note" href={spotlight.href}>
              <span className="g-note-icon">
                <Layers size={22} />
              </span>
              <span>
                <small>Ingredient spotlight</small>
                <strong>{spotlight.name}</strong>
                <span>{spotlight.pack ? `${spotlight.pack} · ${spotlight.price}` : spotlight.price}</span>
              </span>
            </Link>
          ) : null}

          <div className="g-hero-tabs" role="group" aria-label="Choose an ingredient collection">
            {collections.map((c, i) => (
              <button key={c.id} type="button" aria-pressed={active === i} onClick={() => setActive(i)}>
                <span className="g-tab-number">{String(i + 1).padStart(2, '0')}</span>
                {c.label}
              </button>
            ))}
          </div>
          <p className="r-visually-hidden" aria-live="polite">
            {current.copy}
          </p>
        </div>
      </div>
    </section>
  );
}
