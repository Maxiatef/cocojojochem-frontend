'use client';

import { useEffect, useRef } from 'react';

/**
 * The hero's looping background video, loaded only once the page has.
 *
 * It used to be a plain `<video autoPlay preload="auto">` — twice, one for
 * desktop and one for mobile, hidden from each other with CSS. `display:none`
 * does not stop a video downloading, so every visitor fetched the 2.8 MB file
 * (in both players) at the same moment as the page's fonts and CSS. On
 * PageSpeed's throttled phone that pushed the heading's paint back ~4.6 s and
 * the Speed Index to 7.2 s.
 *
 * Now there is no `src` in the HTML at all. After the window `load` event —
 * text, fonts and styles already on screen — each player checks whether it is
 * actually displayed at this breakpoint and under the user's motion setting,
 * and only then attaches the source and plays. The hidden player never
 * downloads anything.
 */
export function HeroVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const start = () => {
      // `offsetParent` is null when this element (or an ancestor) is
      // display:none — i.e. the other breakpoint's player, or motion-reduce.
      if (video.offsetParent === null || video.src) return;
      video.src = src;
      // Autoplay of a muted inline video is allowed everywhere; if a browser
      // refuses anyway, the still frame behind it is the fallback.
      video.play().catch(() => {});
    };

    if (document.readyState === 'complete') {
      start();
      return;
    }
    window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, [src]);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop
      playsInline
      preload="none"
      className={className}
    />
  );
}
