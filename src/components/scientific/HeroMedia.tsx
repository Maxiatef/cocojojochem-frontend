import Image from 'next/image';
import { isOptimisable } from '@/lib/images';

/**
 * A photograph behind a hero section, under a blue wash.
 *
 * Two things about it are deliberate and easy to get wrong later.
 *
 * **It is not decorative.** No `aria-hidden`, and `alt` is required and
 * non-empty. The site's own crawler excludes `aria-hidden` and `alt=""`
 * images from its image count — correctly, since that is what those mean —
 * so a hero marked decorative would leave the page reading as having no
 * images at all, which is the problem this component exists to solve. The
 * consequence is that the alt text is announced, so it has to describe the
 * photograph honestly rather than repeat the heading underneath it.
 *
 * **The wash does the legibility work, not the opacity alone.** The image sits
 * at a low opacity AND under a gradient in the section's own colour, so the
 * text above keeps its contrast whatever the photograph happens to be. Tuning
 * one without the other is how a hero ends up unreadable on a light photo.
 *
 * Usage: the parent <section> needs `relative isolate overflow-hidden`, and
 * its content needs to sit above this (Container is already a stacking
 * sibling; this layer is at -z-10).
 */
export function HeroMedia({
  src,
  alt,
  tone = 'light',
  priority = false,
}: {
  src: string;
  /** Describes the photograph. Required — see the note above. */
  alt: string;
  /** 'dark' for navy sections with white text, 'light' for pale ones. */
  tone?: 'dark' | 'light';
  /** True only for a hero above the fold on first paint. */
  priority?: boolean;
}) {
  const dark = tone === 'dark';

  return (
    <div className="absolute inset-0 -z-10">
      {/* next/image rather than a plain <img>, for three reasons Lighthouse
          measured on /about:
          - `priority` puts a <link rel="preload"> in the <head>, so the
            browser starts the download before it has parsed down to the
            hero. Without it the LCP image waited ~0.3–0.9 s to be discovered.
          - It is served from this origin via /_next/image, so there is no
            extra DNS + TLS handshake to images.unsplash.com on the
            critical path.
          - `sizes` lets a phone fetch a phone-width file; the fixed w=1600
            source was 1600x2180 for a 721x1084 slot. */}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        unoptimized={!isOptimisable(src)}
        className={`object-cover ${dark ? '' : 'opacity-90'}`}
      />

      {/* Two washes, not one, because the copy moves.

          Below md the heading spans the full width and sits over any part of
          the photograph, so the wash has to be flat and heavy. From md up the
          copy stays in the left column, so it can fall away to the right and
          let the photograph actually be seen.

          The darkening is done by the wash rather than by fading the image,
          which was the first attempt and did not work: a half-transparent
          photo over a navy section just resolves to navy, and the picture
          disappears entirely. The gradient leaves the right-hand edge mostly
          clear, so there is something to look at. */}
      <div
        aria-hidden
        className={`absolute inset-0 md:hidden ${dark ? 'bg-sci-deep/88' : 'bg-sci-pale/90'}`}
      />
      <div
        aria-hidden
        className={
          dark
            ? 'absolute inset-0 hidden bg-gradient-to-r from-sci-deep via-sci-deep/90 to-sci-deep/30 md:block'
            : 'absolute inset-0 hidden bg-gradient-to-r from-sci-pale via-sci-pale/92 to-sci-pale/55 md:block'
        }
      />
      {/* A blue cast over the whole thing, so a photograph with its own colour
          temperature still belongs to this palette. */}
      <div aria-hidden className="absolute inset-0 bg-sci-blue/10 mix-blend-multiply" />
    </div>
  );
}
