"use client";
import { useEffect, useRef } from "react";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export default function CompanyMotion() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = marker.current?.closest<HTMLElement>(".e-company");
    const shell = root?.closest<HTMLElement>(".lusion-home-shell");
    if (!root || !shell) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width:1000px) and (min-height:780px)");
    const fine = window.matchMedia("(hover:hover) and (pointer:fine)");
    const hero = root.querySelector<HTMLElement>(".e-hero");
    const ribbon = root.querySelector<HTMLElement>(".e-type-ribbon");
    const values = root.querySelector<HTMLElement>(".e-values-section");
    const photos = Array.from(root.querySelectorAll<HTMLElement>("[data-e-parallax]"));
    const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-e-reveal]"));
    const live = Array.from(root.querySelectorAll<HTMLElement>("[data-e-live]"));
    const surfaces = Array.from(root.querySelectorAll<HTMLElement>("[data-e-tilt],.e-hero-scene"));
    const deck = root.querySelector<HTMLElement>("[data-e-deck]");
    const viewport = deck?.querySelector<HTMLElement>(".e-deck-viewport");
    const pin = deck?.querySelector<HTMLElement>(".e-deck-pin");
    const counter = deck?.querySelector<HTMLElement>(".e-deck-counter");
    const panels = Array.from(deck?.querySelectorAll<HTMLElement>(".e-service-card") || []);
    let paused = reduced.matches || shell.dataset.motion === "paused",
      frame = 0,
      disposed = false;
    let deckActive = false,
      travel = 0,
      slideWidth = 0,
      lastCounter = -1;
    const cleanup: (() => void)[] = [],
      freeze: (() => void)[] = [];
    function show(el: HTMLElement) {
      el.classList.remove("e-pending");
      el.classList.add("e-in-view");
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (el.hasAttribute("data-e-live")) el.dataset.eVisible = String(entry.isIntersecting);
          if (el === hero) el.dataset.visible = String(entry.isIntersecting);
          if (entry.isIntersecting && el.hasAttribute("data-e-reveal")) show(el);
        });
      },
      { threshold: 0.06 },
    );
    live.forEach((el) => observer.observe(el));
    reveals.forEach((el) => {
      if (paused || el.getBoundingClientRect().top < window.innerHeight) show(el);
      else el.classList.add("e-pending");
      observer.observe(el);
    });
    function paint() {
      frame = 0;
      if (document.hidden) return;
      // The deck follows direct scrolling even when ambient visual motion is paused.
      if (deckActive && deck) {
        const r = deck.getBoundingClientRect(),
          x = clamp(140 - r.top, 0, travel);
        deck.style.setProperty("--e-deck-x", `${-x}px`);
        deck.style.setProperty("--e-deck-progress", `${0.03 + (0.97 * x) / Math.max(travel, 1)}`);
        const current = Math.min(panels.length - 1, Math.round(x / (slideWidth + 28)));
        if (counter && current !== lastCounter) {
          counter.textContent = `0${current + 1} / 0${panels.length}`;
          lastCounter = current;
        }
        panels.forEach((panel, i) => {
          const distance = clamp((i * (slideWidth + 28) - x) / (slideWidth + 28), -1, 1);
          panel.style.setProperty("--e-panel-turn", `${paused ? 0 : distance * -7}deg`);
          panel.style.setProperty("--e-panel-scale", `${paused ? 1 : 1 - Math.abs(distance) * 0.055}`);
        });
      }
      if (paused) return;
      const heroRect = hero?.getBoundingClientRect();
      const ribbonRect = ribbon?.getBoundingClientRect();
      const valuesRect = values?.getBoundingClientRect();
      const photoRects = photos.map((el) => ({ el, r: el.getBoundingClientRect() }));
      if (hero && heroRect) {
        const p = clamp(-heroRect.top / Math.max(1, heroRect.height), 0, 1);
        hero.style.setProperty("--e-hero-y", `${p * 115}px`);
        hero.style.setProperty("--e-hero-x", `${p * 155}px`);
        hero.style.setProperty("--e-hero-turn", `${p * 22}deg`);
        hero.style.setProperty("--e-hero-scale", `${1 + p * 0.23}`);
      }
      if (ribbonRect)
        root!.style.setProperty("--e-ribbon-x", `${clamp((innerHeight * 0.5 - ribbonRect.top) * -0.35, -240, 240)}px`);
      if (values && valuesRect)
        values.style.setProperty("--e-word-x", `${clamp((innerHeight * 0.5 - valuesRect.top) * 0.2, -180, 180)}px`);
      photoRects.forEach(({ el, r }) => {
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = clamp((innerHeight * 0.5 - r.top - r.height * 0.5) / (innerHeight + r.height), -0.5, 0.5);
        el.style.setProperty("--e-photo-y", `${p * 140}px`);
        el.style.setProperty("--e-photo-turn", `${p * 7}deg`);
      });
    }
    function schedule() {
      if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
    }
    function measure() {
      if (!deck || !viewport || !pin) return;
      deckActive = wide.matches && !reduced.matches;
      deck.dataset.deckActive = String(deckActive);
      if (deckActive) {
        slideWidth = Math.max(1, viewport.clientWidth - Math.min(65, viewport.clientWidth * 0.055));
        deck.style.setProperty("--e-slide-width", `${slideWidth}px`);
        travel = Math.max(0, panels.length * slideWidth + (panels.length - 1) * 28 - viewport.clientWidth);
        deck.style.setProperty("--e-deck-height", `${travel + pin.offsetHeight}px`);
        panels.forEach(show);
      } else {
        deck.style.removeProperty("--e-deck-height");
        deck.style.removeProperty("--e-deck-x");
      }
      schedule();
    }
    function goToPanel(panel: HTMLElement) {
      if (!deckActive || !deck) return false;
      const index = panels.indexOf(panel);
      if (index < 0) return false;
      const top = window.scrollY + deck.getBoundingClientRect().top - 140 + Math.min(travel, index * (slideWidth + 28));
      show(panel);
      window.scrollTo({ top, behavior: "instant" });
      paint();
      return true;
    }
    function anchor(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#service-"]') : null;
      const panel = link && panels.find((el) => "#" + el.id === link.getAttribute("href"));
      if (panel && goToPanel(panel)) {
        event.preventDefault();
        window.history.replaceState(null, "", "#" + panel.id);
        panel.focus({ preventScroll: true });
      }
    }
    function hash() {
      const panel = panels.find((el) => "#" + el.id === window.location.hash);
      if (panel) goToPanel(panel);
    }
    surfaces.forEach((el) => {
      let pointerFrame = 0,
        x = 0,
        y = 0;
      const apply = () => {
        pointerFrame = 0;
        if (paused) return;
        el.style.setProperty("--e-rx", `${y * -6}deg`);
        el.style.setProperty("--e-ry", `${x * 8}deg`);
        el.style.setProperty("--e-px", `${50 + x * 35}%`);
        el.style.setProperty("--e-py", `${50 + y * 35}%`);
      };
      const point = (event: PointerEvent) => {
        if (paused || !fine.matches || event.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        x = clamp(((event.clientX - r.left) / Math.max(1, r.width)) * 2 - 1, -1, 1);
        y = clamp(((event.clientY - r.top) / Math.max(1, r.height)) * 2 - 1, -1, 1);
        if (!pointerFrame) pointerFrame = requestAnimationFrame(apply);
      };
      const reset = () => {
        cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        x = 0;
        y = 0;
        apply();
      };
      freeze.push(() => {
        cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
      });
      el.addEventListener("pointermove", point, { passive: true });
      el.addEventListener("pointerleave", reset);
      el.addEventListener("pointercancel", reset);
      cleanup.push(() => {
        cancelAnimationFrame(pointerFrame);
        el.removeEventListener("pointermove", point);
        el.removeEventListener("pointerleave", reset);
        el.removeEventListener("pointercancel", reset);
      });
    });
    function motion() {
      paused = reduced.matches || document.hidden || shell!.dataset.motion === "paused";
      cancelAnimationFrame(frame);
      frame = 0;
      if (paused) {
        freeze.forEach((fn) => fn());
        reveals.forEach(show);
      }
      schedule();
    }
    function preference() {
      measure();
      motion();
    }
    function resize() {
      measure();
      schedule();
    }
    function focus(event: FocusEvent) {
      if (event.target instanceof Element) {
        const panel = event.target.closest<HTMLElement>("[data-e-reveal],.e-service-card");
        if (panel) {
          show(panel);
          goToPanel(panel);
        }
      }
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("cj-motion-change", motion);
    window.addEventListener("hashchange", hash);
    document.addEventListener("visibilitychange", motion);
    reduced.addEventListener("change", preference);
    root.addEventListener("focusin", focus);
    root.addEventListener("click", anchor);
    measure();
    schedule();
    hash();
    document.fonts.ready.then(() => {
      if (!disposed) {
        measure();
        hash();
      }
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      cleanup.forEach((fn) => fn());
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.removeEventListener("cj-motion-change", motion);
      window.removeEventListener("hashchange", hash);
      document.removeEventListener("visibilitychange", motion);
      reduced.removeEventListener("change", preference);
      root.removeEventListener("focusin", focus);
      root.removeEventListener("click", anchor);
      reveals.forEach(show);
    };
  }, []);
  return <span ref={marker} hidden />;
}
