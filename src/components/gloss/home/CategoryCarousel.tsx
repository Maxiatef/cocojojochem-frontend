'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { CarouselCategory } from './homeCategories';

const ROTATE_MS = 3400;
const DRAG_THRESHOLD = 6;

/**
 * The prototype's category carousel (`r-category-carousel`). The prototype
 * drives it with Embla; this is a dependency-free equivalent on the same
 * markup: the track is translated slide by slide, wraps at either end, can be
 * dragged with mouse or touch, follows keyboard focus, and auto-rotates while
 * it is on screen and not hovered or focused. With reduced motion it neither
 * rotates nor animates, and the play/pause control is not shown.
 */
export function CategoryCarousel({ categories, total }: { categories: CarouselCategory[]; total: number }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(categories.length - 1);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [status, setStatus] = useState('');
  const [dragX, setDragX] = useState<number | null>(null);
  // Bumped on resize: slide widths change, so the current offset must be re-read.
  const [, setLayoutTick] = useState(0);

  const drag = useRef<{ id: number; startX: number; startY: number; moved: boolean; captured: boolean } | null>(null);
  // A drag ends in a click on whatever card it started on; swallow that one.
  const suppressClickUntil = useRef(0);

  const n = categories.length;

  // Pixel offset of slide i from the first slide (layout offsets ignore the
  // track's transform, so this is stable while the track moves).
  const offsetOf = useCallback((i: number) => {
    const slides = trackRef.current?.children;
    if (!slides || !slides.length) return 0;
    const first = slides[0] as HTMLElement;
    const target = slides[Math.min(i, slides.length - 1)] as HTMLElement;
    return target.offsetLeft - first.offsetLeft;
  }, []);

  // The last index that still fills the viewport: past it the track would
  // show empty space, so "next" wraps back to the start from there.
  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const slides = trackRef.current?.children;
    if (!viewport || !slides || !slides.length) return;
    const last = slides[slides.length - 1] as HTMLElement;
    const end = last.offsetLeft + last.offsetWidth - (slides[0] as HTMLElement).offsetLeft;
    let max = 0;
    while (max < slides.length - 1 && end - offsetOf(max) > viewport.clientWidth + 1) max++;
    setMaxIndex(max);
    setIndex((i) => Math.min(i, max));
    setLayoutTick((t) => t + 1);
  }, [offsetOf]);

  useEffect(() => {
    measure();
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [measure, n]);

  // Reduced motion: no rotation, no animation. Re-checked live.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReduced(mq.matches);
      setPlaying(!mq.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || hovered || !inView || reduced || maxIndex === 0) return;
    const t = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [playing, hovered, inView, reduced, maxIndex]);

  function step(dir: 'next' | 'previous') {
    setPlaying(false);
    const next = dir === 'next' ? (index >= maxIndex ? 0 : index + 1) : index <= 0 ? maxIndex : index - 1;
    setIndex(next);
    setStatus(`${categories[next].label}, category ${next + 1} of ${n}`);
  }

  // Focus moving onto a card brings it into view (Embla's watchFocus). The
  // browser may also have scrolled the clipped viewport natively; undo that,
  // since position is owned by the transform.
  function onSlideFocus(i: number) {
    if (viewportRef.current) viewportRef.current.scrollLeft = 0;
    const width = viewportRef.current?.clientWidth || 0;
    const visibleFrom = offsetOf(index);
    const start = offsetOf(i);
    const slide = trackRef.current?.children[i] as HTMLElement | undefined;
    const end = start + (slide?.offsetWidth || 0);
    if (start < visibleFrom || end > visibleFrom + width) setIndex(Math.min(i, maxIndex));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || maxIndex === 0) return;
    setPlaying(false);
    drag.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false, captured: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD || Math.abs(dx) < Math.abs(e.clientY - d.startY)) return;
      d.moved = true;
      // Capture only once it is a drag, so a plain click still reaches the link.
      e.currentTarget.setPointerCapture(e.pointerId);
      d.captured = true;
    }
    setDragX(dx);
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.captured && e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!d.moved) return;
    suppressClickUntil.current = Date.now() + 400;
    const dx = e.clientX - d.startX;
    const target = offsetOf(index) - dx;
    // Nearest slide to where the drag stopped, but at least one step for a
    // deliberate swipe.
    let nearest = 0;
    for (let i = 0; i <= maxIndex; i++) {
      if (Math.abs(offsetOf(i) - target) < Math.abs(offsetOf(nearest) - target)) nearest = i;
    }
    if (nearest === index && Math.abs(dx) > 40) nearest = dx < 0 ? Math.min(index + 1, maxIndex) : Math.max(index - 1, 0);
    setDragX(null);
    setIndex(nearest);
  }

  if (!n) return null;

  // While dragging, resist past either end instead of showing empty space.
  let offset = offsetOf(index);
  if (dragX !== null) {
    const raw = offset - dragX;
    const max = offsetOf(maxIndex);
    offset = raw < 0 ? raw * 0.3 : raw > max ? max + (raw - max) * 0.3 : raw;
  }

  return (
    <section
      ref={sectionRef}
      className="r-wrap r-category-carousel"
      aria-label="Shop ingredient categories"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={(e) => {
        if (!(e.target as HTMLElement).closest('[data-rotation-control]')) setPlaying(false);
      }}
    >
      <div className="r-category-carousel-controls">
        <Link className="r-text-link" href="/categories">
          Explore all {total} categories
        </Link>
        <div className="r-category-carousel-buttons">
          <span className="r-category-position" aria-hidden="true">
            {String(index + 1).padStart(2, '0')} <span>/ {n}</span>
          </span>
          {!reduced && maxIndex > 0 ? (
            <button
              type="button"
              data-rotation-control
              aria-controls="ingredient-category-slides"
              aria-label={playing ? 'Pause category rotation' : 'Start category rotation'}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
              <span>{playing ? 'Pause' : 'Play'}</span>
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Previous categories"
            aria-controls="ingredient-category-slides"
            onClick={() => step('previous')}
          >
            Previous
          </button>
          <button
            type="button"
            aria-label="Next categories"
            aria-controls="ingredient-category-slides"
            onClick={() => step('next')}
          >
            Next
          </button>
        </div>
      </div>

      <div
        className="r-category-carousel-viewport"
        id="ingredient-category-slides"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (Date.now() < suppressClickUntil.current) {
            suppressClickUntil.current = 0;
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div
          className={'r-category-carousel-track' + (dragX !== null ? ' is-dragging' : '')}
          ref={trackRef}
          style={{
            transform: `translate3d(${-offset}px, 0, 0)`,
            transition: dragX !== null || reduced ? 'none' : 'transform .6s cubic-bezier(.2,.7,.2,1)',
          }}
        >
          {categories.map((c, i) => (
            <div
              key={c.id}
              className="r-category-carousel-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              onFocus={() => onSlideFocus(i)}
            >
              <Link className="r-category-card" href={c.href} draggable={false}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.label + ' representative ingredient texture'}
                  width={430}
                  height={420}
                  loading="lazy"
                  draggable={false}
                />
                <div>
                  <h2>{c.label}</h2>
                  <span>Discover the collection</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <p className="r-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {status}
      </p>
    </section>
  );
}
