'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Testimonial } from '@/lib/types';

/**
 * Testimonial carousel for the About page.
 *
 * Adapted from a shadcn-styled reference component. Two changes were required
 * to make it work here:
 *
 * 1. This is not a shadcn project — `bg-background`, `text-foreground`,
 *    `border-border`, `text-muted-foreground` and `bg-accent` are not defined
 *    in tailwind.config.ts, so as written the component rendered as invisible
 *    text on an invisible background. Every token is mapped to the Scientific
 *    edition palette the rest of the page uses.
 * 2. The reference hardcodes its own quotes. This takes the real published
 *    testimonials as a prop so the admin (Settings → Testimonials) stays the
 *    source of truth.
 *
 * Dropped at the caller's request: the oversized background index number and
 * the bottom scrolling company ticker. The mouse-parallax springs that drove
 * the number went with it — they animated nothing else.
 *
 * The entity has no `role` field, so the line under the author is `result`
 * (the outcome line, e.g. "Faster compliance turnaround"), which is the
 * closest real data and reads as the reason the quote is worth showing.
 */
const AUTOPLAY_MS = 6000;
const EASE = [0.22, 1, 0.36, 1] as const;

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = testimonials.length;

  const goNext = useCallback(() => setActiveIndex((prev) => (prev + 1) % count), [count]);
  const goPrev = useCallback(
    () => setActiveIndex((prev) => (prev - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    // A single quote has nothing to rotate to, and pausing on hover/focus stops
    // the text changing out from under someone who is still reading it.
    if (paused || count < 2) return;
    const timer = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [goNext, paused, count]);

  if (count === 0) return null;

  const current = testimonials[activeIndex];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Asymmetric split: vertical label rail, then the quote. The rail is
          hidden below md — a 90°-rotated word in a 375px column is unreadable
          and steals width the quote needs. */}
      <div className="relative flex flex-col md:flex-row">
        <div className="hidden shrink-0 flex-col items-center justify-center pr-10 md:flex lg:pr-16 md:border-r md:border-sci-border">
          <motion.span
            className="font-sci-body text-sci-eyebrow uppercase text-sci-muted"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Testimonials
          </motion.span>

          {/* Vertical progress rail */}
          <div className="relative mt-8 h-32 w-px bg-sci-border">
            <motion.div
              className="absolute left-0 top-0 w-full origin-top bg-sci-navy"
              animate={{ height: `${((activeIndex + 1) / count) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
        </div>

        <div className="flex-1 md:pl-10 md:py-4 lg:pl-16">
          {/* Company chip */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`company-${activeIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-sci-border bg-white px-3 py-1 font-sci-body text-xs text-sci-muted">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sci-accent" />
                {current.company || 'Verified customer'}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Quote, revealed word by word */}
          <div className="relative mb-12 min-h-[160px] md:min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={`quote-${activeIndex}`}
                className="font-sci-heading text-[26px] font-light leading-[1.25] tracking-tight text-sci-navy md:text-[38px] lg:text-[44px]"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* A real space text node between the spans, not a margin: the
                    reference used `mr-[0.3em]`, which looks right but makes the
                    whole quote copy out as one unbroken word. */}
                {current.quote.split(' ').map((word, i) => (
                  <span key={`${activeIndex}-${i}`}>
                  <motion.span
                    className="inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 20, rotateX: 90 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        transition: { duration: 0.5, delay: i * 0.035, ease: EASE },
                      },
                      exit: { opacity: 0, y: -10, transition: { duration: 0.2, delay: i * 0.015 } },
                    }}
                  >
                    {word}
                  </motion.span>
                  {' '}
                  </span>
                ))}
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Author + navigation */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={`author-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-4"
              >
                {current.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={current.imageUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <motion.div
                    aria-hidden
                    className="h-px w-8 shrink-0 bg-sci-navy"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ originX: 0 }}
                  />
                )}
                <div className="min-w-0">
                  <p className="font-sci-body text-sci-label font-medium text-sci-navy">
                    {current.authorName}
                  </p>
                  {current.result && (
                    <p className="font-sci-body text-sci-label text-sci-muted">{current.result}</p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {count > 1 && (
              <div className="flex items-center gap-4">
                <CarouselButton label="Previous testimonial" direction="prev" onClick={goPrev} />
                <CarouselButton label="Next testimonial" direction="next" onClick={goNext} />

                <span className="font-sci-body text-xs tabular-nums text-sci-muted">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announces the change to screen readers, which never see the animation. */}
      <p aria-live="polite" className="sr-only">
        Testimonial {activeIndex + 1} of {count}: {current.quote} — {current.authorName}
      </p>
    </div>
  );
}

/**
 * The reference's hover fill was inert — a motion.div with an `initial` offset
 * and a transition but no animate/whileHover target, so it never moved while
 * the icon still faded on hover. Driven by group-hover here instead, so the
 * fill actually sweeps in behind the arrow.
 */
function CarouselButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: 'prev' | 'next';
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.95 }}
      className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-sci-border focus:outline-none focus-visible:ring-2 focus-visible:ring-sci-blue focus-visible:ring-offset-2"
    >
      <span
        aria-hidden
        className={`absolute inset-0 bg-sci-navy transition-transform duration-300 ease-out ${
          direction === 'prev'
            ? '-translate-x-full group-hover:translate-x-0'
            : 'translate-x-full group-hover:translate-x-0'
        }`}
      />
      <svg
        width="18"
        height="18"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="relative z-10 text-sci-navy transition-colors group-hover:text-white"
      >
        <path
          d={direction === 'prev' ? 'M10 12L6 8L10 4' : 'M6 4L10 8L6 12'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}
