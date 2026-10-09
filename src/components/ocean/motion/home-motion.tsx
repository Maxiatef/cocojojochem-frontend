"use client";

import { useEffect, useRef, useState } from "react";
import { Pause as LucidePause, Play as LucidePlay } from "lucide-react";

const MOTION_EVENT = "cj-motion-change";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

/** Enhances existing homepage markup; all content is readable before mounting. */
export function HomeMotion() {
  const [status, setStatus] = useState({ paused: true, reduced: false });
  const toggle = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lusion-home-shell");
    if (!root) return;

    const preference = window.matchMedia(REDUCED_MOTION);
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const previousMotion = root.dataset.motion;
    let userPaused = false;
    let paused = preference.matches || document.hidden;
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const restore: (() => void)[] = [];
    const savedStyles = new Map<HTMLElement, Set<string>>();

    function setVariable(element: HTMLElement, name: string, value: string) {
      let names = savedStyles.get(element);
      if (!names) {
        names = new Set();
        savedStyles.set(element, names);
      }
      if (!names.has(name)) {
        names.add(name);
        const previous = element.style.getPropertyValue(name);
        const priority = element.style.getPropertyPriority(name);
        restore.push(() =>
          previous ? element.style.setProperty(name, previous, priority) : element.style.removeProperty(name),
        );
      }
      element.style.setProperty(name, value);
    }

    const reveals = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".r-section-heading, .r-editorial-copy, .l-library > .r-wrap > div, .l-featured .r-product-card, .r-help-band",
      ),
    );
    function reveal(element: HTMLElement) {
      element.classList.add("l-in-view");
      observer?.unobserve(element);
    }
    function revealAll() {
      reveals.forEach(reveal);
      observer?.disconnect();
    }
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target as HTMLElement);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
      );
    }
    reveals.forEach((element, index) => {
      const hadReveal = element.classList.contains("l-reveal");
      const hadInView = element.classList.contains("l-in-view");
      restore.push(() => {
        element.classList.toggle("l-reveal", hadReveal);
        element.classList.toggle("l-in-view", hadInView);
      });
      setVariable(
        element,
        "--reveal-delay",
        `${element.matches(".r-product-card, .l-library > .r-wrap > div") ? (index % 4) * 85 : 0}ms`,
      );
      // Never hide content already reached through scrolling, anchors or focus.
      const alreadyReached = element.getBoundingClientRect().top < window.innerHeight;
      if (paused || !observer || alreadyReached || element.contains(document.activeElement)) {
        element.classList.add("l-in-view");
      }
      element.classList.add("l-reveal");
      if (!element.classList.contains("l-in-view")) observer?.observe(element);
    });

    const photos = Array.from(root.querySelectorAll<HTMLElement>(".l-featured .r-product-photo"));
    const editorialPhotos = Array.from(root.querySelectorAll<HTMLElement>(".r-editorial-photo"));
    const libraryCards = Array.from(root.querySelectorAll<HTMLElement>(".l-library .g-library-tiles > a"));

    function resetPhoto(photo: HTMLElement) {
      setVariable(photo, "--media-x", "0px");
      setVariable(photo, "--media-y", "0px");
      setVariable(photo, "--media-tilt-x", "0deg");
      setVariable(photo, "--media-tilt-y", "0deg");
    }
    photos.forEach((photo) => {
      const point = (event: PointerEvent) => {
        if (paused || !finePointer.matches || event.pointerType !== "mouse") return;
        const bounds = photo.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
        const y = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
        setVariable(photo, "--media-x", `${(x * 20).toFixed(2)}px`);
        setVariable(photo, "--media-y", `${(y * 20).toFixed(2)}px`);
        setVariable(photo, "--media-tilt-x", `${(-y * 5).toFixed(2)}deg`);
        setVariable(photo, "--media-tilt-y", `${(x * 5).toFixed(2)}deg`);
      };
      const leave = () => {
        if (!paused) resetPhoto(photo);
      };
      photo.addEventListener("pointermove", point, { passive: true });
      photo.addEventListener("pointerleave", leave);
      photo.addEventListener("pointercancel", leave);
      restore.push(() => {
        photo.removeEventListener("pointermove", point);
        photo.removeEventListener("pointerleave", leave);
        photo.removeEventListener("pointercancel", leave);
      });
    });

    function renderScroll() {
      frame = 0;
      if (paused) return;
      const viewport = window.innerHeight;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - viewport);
      setVariable(root!, "--page-progress", clamp(window.scrollY / scrollable, 0, 1).toFixed(4));
      editorialPhotos.forEach((photo) => {
        const bounds = photo.getBoundingClientRect();
        if (bounds.bottom < -100 || bounds.top > viewport + 100) return;
        const progress = clamp(
          (viewport / 2 - bounds.top - bounds.height / 2) / ((viewport + bounds.height) / 2),
          -1,
          1,
        );
        setVariable(photo, "--photo-shift", `${(progress * 50).toFixed(2)}px`);
      });
      libraryCards.forEach((card, index) => {
        // Measure the stable tile container, not its rotating child.
        const bounds = (card.parentElement || card).getBoundingClientRect();
        const progress = clamp(
          (viewport / 2 - bounds.top - bounds.height / 2) / ((viewport + bounds.height) / 2),
          -1,
          1,
        );
        setVariable(card, "--library-turn", `${(progress * 8 * (index % 2 ? -1 : 1)).toFixed(2)}deg`);
      });
    }
    function scheduleScroll() {
      if (!paused && !frame) frame = window.requestAnimationFrame(renderScroll);
    }
    setVariable(
      root,
      "--page-progress",
      clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight), 0, 1).toFixed(4),
    );
    function syncMotion() {
      paused = userPaused || preference.matches || document.hidden;
      root!.dataset.motion = paused ? "paused" : "playing";
      setStatus({ paused, reduced: preference.matches });
      window.dispatchEvent(new CustomEvent<{ paused: boolean }>(MOTION_EVENT, { detail: { paused } }));
      if (paused) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        revealAll();
        if (preference.matches) {
          photos.forEach(resetPhoto);
          editorialPhotos.forEach((photo) => setVariable(photo, "--photo-shift", "0px"));
          libraryCards.forEach((card) => setVariable(card, "--library-turn", "0deg"));
        }
      } else {
        // A pointer may have left while paused; resume from a neutral position.
        photos.forEach(resetPhoto);
        scheduleScroll();
      }
    }
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      reveals.forEach((element) => {
        if (element.contains(target)) {
          setVariable(element, "--reveal-delay", "0ms");
          reveal(element);
        }
      });
    };
    toggle.current = () => {
      userPaused = !userPaused;
      syncMotion();
    };
    root.addEventListener("focusin", focus);
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
    document.addEventListener("visibilitychange", syncMotion);
    preference.addEventListener("change", syncMotion);
    syncMotion();

    return () => {
      toggle.current = null;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      root.removeEventListener("focusin", focus);
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      document.removeEventListener("visibilitychange", syncMotion);
      preference.removeEventListener("change", syncMotion);
      restore.reverse().forEach((reset) => reset());
      if (previousMotion === undefined) delete root.dataset.motion;
      else root.dataset.motion = previousMotion;
    };
  }, []);

  return (
    <button
      type="button"
      className="l-global-motion"
      onClick={() => toggle.current?.()}
      aria-label={
        status.reduced
          ? "Motion off: reduced motion preference"
          : status.paused
            ? "Play visual motion"
            : "Pause visual motion"
      }
      aria-pressed={status.paused}
      disabled={status.reduced}
    >
      {status.paused ? <LucidePlay size={16} aria-hidden="true" /> : <LucidePause size={16} aria-hidden="true" />}
      <span>{status.reduced ? "Motion off" : status.paused ? "Play motion" : "Pause motion"}</span>
    </button>
  );
}

/** The real total is the server-rendered and assistive-technology value. */
export function MotionCount({ value = 1103 }: { value?: number }) {
  const total = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 1103;
  const element = useRef<HTMLSpanElement>(null);
  const [visual, setVisual] = useState(total);

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const root = node.closest<HTMLElement>(".lusion-home-shell");
    const preference = window.matchMedia(REDUCED_MOTION);
    let paused = root?.dataset.motion === "paused";
    let visible = false;
    let complete = false;
    let elapsed = 0;
    let previousTime: number | null = null;
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    setVisual(total);

    function stop() {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
    }
    function finish() {
      stop();
      complete = true;
      setVisual(total);
      observer?.disconnect();
    }
    function tick(time: number) {
      frame = 0;
      if (paused || document.hidden || complete) {
        previousTime = null;
        return;
      }
      if (previousTime !== null) elapsed += time - previousTime;
      previousTime = time;
      const progress = clamp(elapsed / 1200, 0, 1);
      setVisual(Math.round(total * (1 - Math.pow(1 - progress, 3))));
      if (progress === 1) finish();
      else frame = window.requestAnimationFrame(tick);
    }
    function sync() {
      if (preference.matches) {
        finish();
        return;
      }
      if (paused || document.hidden) {
        stop();
        return;
      }
      if (visible && !complete && !frame) frame = window.requestAnimationFrame(tick);
    }
    const motionChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ paused: boolean }>).detail;
      if (typeof detail?.paused === "boolean") paused = detail.paused;
      sync();
    };
    const visibilityChanged = () => {
      paused = root?.dataset.motion === "paused";
      sync();
    };
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            visible = true;
            observer?.disconnect();
            sync();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(node);
    } else finish();
    window.addEventListener(MOTION_EVENT, motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    preference.addEventListener("change", sync);
    sync();
    return () => {
      stop();
      observer?.disconnect();
      window.removeEventListener(MOTION_EVENT, motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      preference.removeEventListener("change", sync);
    };
  }, [total]);

  return (
    <span ref={element} className="l-motion-count" aria-label={String(total)}>
      <span className="r-visually-hidden">{total.toLocaleString("en-US")}</span>
      <span aria-hidden="true">{visual.toLocaleString("en-US")}</span>
    </span>
  );
}
