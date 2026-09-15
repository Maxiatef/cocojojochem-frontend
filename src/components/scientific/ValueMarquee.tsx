import { Fragment } from 'react';

/**
 * The scrolling ticker from the testimonial reference component, taken on its
 * own for the value strip under the homepage hero. Only the ticker was wanted,
 * so none of the rest of that component is here — no carousel, no quote, no
 * oversized index number.
 *
 * Driven by the `.marquee-track` class already defined in globals.css rather
 * than by framer-motion. That class existed but nothing used it, and it brings
 * a `prefers-reduced-motion` guard with it. Using it means no client bundle and
 * no JS at all for what is a decorative loop.
 *
 * Two fixes versus the reference ticker:
 *
 * 1. It looped by animating `x: [0, -1000]` over ten copies of the text. That
 *    -1000px bears no relation to how wide the content actually is, so the
 *    strip visibly jumped every cycle. The row is rendered exactly twice here
 *    and the keyframe travels half the track, which is seamless at any width.
 * 2. The reference drew it at 8% opacity as background texture. This strip is
 *    real content the page already showed as readable blue links, so it keeps
 *    that treatment rather than fading to a ghost.
 *
 * Travels left → right. `marquee-scroll` runs 0 → -50%, which reads right to
 * left, so the direction is reversed here; drop that utility to flip it back.
 */
export function ValueMarquee({ items }: { items: string[] }) {
  const row = (key: string, hidden: boolean) => (
    <div key={key} aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((item) => (
        <Fragment key={item}>
          <span className="whitespace-nowrap px-6 font-sci-body text-sci-label font-medium text-sci-blue">
            {item}
          </span>
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-sci-accent" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      {/* The second copy exists only to fill the gap as the first scrolls away;
          it's hidden from screen readers so the list isn't announced twice. */}
      {/* Direction and duration are set inline, not as utilities: .marquee-track
          declares the `animation` shorthand, which resets those longhands and
          wins the cascade against a same-specificity utility class. Inline
          beats it, while the reduced-motion rule still stops the animation
          outright because that sets animation-name to none. */}
      <div
        className="marquee-track flex w-max"
        style={{ animationDirection: 'reverse', animationDuration: '40s' }}
      >
        {row('a', false)}
        {row('b', true)}
      </div>

      {/* Soften both ends so the text doesn't hard-cut at the container edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent"
      />
    </div>
  );
}
