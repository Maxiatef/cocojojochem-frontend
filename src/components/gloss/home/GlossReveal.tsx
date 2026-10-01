'use client';

import { useEffect } from 'react';

const SELECTOR =
  '.r-section-heading,.r-editorial,.r-library-band>.r-wrap,.r-help-band,.r-category-directory>a,.r-product-card,.r-page-intro';

/**
 * The prototype's scroll reveal (GlossMotion): blocks below the fold fade and
 * rise in as they enter the viewport. Nothing happens with reduced motion, and
 * content above the fold is never hidden. Renders nothing.
 */
export function GlossReveal() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches || typeof IntersectionObserver === 'undefined') return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('g-revealed');
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.07, rootMargin: '0px 0px 30px 0px' },
    );
    els.forEach((el, i) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('g-reveal');
        el.style.setProperty('--reveal-delay', `${Math.min(i % 4, 3) * 65}ms`);
        io.observe(el);
      }
    });
    const revealAll = () => els.forEach((el) => el.classList.add('g-revealed'));
    mq.addEventListener('change', revealAll);
    return () => {
      io.disconnect();
      mq.removeEventListener('change', revealAll);
      els.forEach((el) => el.classList.remove('g-reveal', 'g-revealed'));
    };
  }, []);

  return null;
}
