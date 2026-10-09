"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowDownRight, ArrowUpRight, Pause, Play } from "lucide-react";
import CategoryAtmosphere from "@/components/ocean/motion/category-atmosphere";
import { useCategoryNavigation } from "@/components/ocean/motion/category-navigation";
import styles from "./category-gallery.module.css";

type Category = {
  id: string;
  label: string;
  image: string;
  description: string;
  count: number;
  href?: string;
  unit?: string;
};
const clamp = (value: number, min = -1, max = 1) => Math.min(max, Math.max(min, value));

export default function CategoryGallery({ categories }: { categories: Category[] }) {
  const root = useRef<HTMLDivElement>(null);
  const control = useRef<(() => void) | null>(null);
  const syncMotion = useRef<(() => void) | null>(null);
  const opening = useRef(false);
  const [motion, setMotion] = useState({ paused: true, reduced: false });
  const { selection, start } = useCategoryNavigation();
  useEffect(() => {
    opening.current = !!selection;
    syncMotion.current?.();
  }, [selection]);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover:hover) and (pointer:fine)");
    const small = window.matchMedia("(max-width:700px)");
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-cg-card]"));
    const media = cards.map((card) => card.querySelector<HTMLElement>("[data-cg-media]")!);
    let manualPaused = false,
      paused = preference.matches || document.hidden,
      frame = 0,
      lastTime = 0;
    let lastScroll = window.scrollY,
      lastScrollTime = performance.now(),
      velocity = 0,
      targetVelocity = 0,
      disposed = false;
    const visible = new Set<HTMLElement>();
    const cleanup: (() => void)[] = [];
    const pointerStops: (() => void)[] = [];
    function neutral(card: HTMLElement) {
      ["--cg-y", "--cg-x", "--cg-turn", "--cg-roll", "--cg-image-y", "--cg-caption-y"].forEach((name) =>
        card.style.setProperty(name, "0" + (name === "--cg-turn" || name === "--cg-roll" ? "deg" : "px")),
      );
      card.style.setProperty("--cg-scale", "1");
    }
    function paint() {
      const vh = window.innerHeight,
        mobile = small.matches;
      const measurements = cards.map((card, index) => ({
        card,
        index,
        rect: visible.has(card) ? card.getBoundingClientRect() : null,
      }));
      for (const { card, index, rect: r } of measurements) {
        if (!r) continue;
        if (paused || card.contains(document.activeElement)) {
          if (!opening.current) neutral(card);
          continue;
        }
        const p = clamp((vh * 0.5 - r.top - r.height * 0.5) / (vh * 0.5 + r.height * 0.5));
        const entering = Math.pow(clamp((r.top - vh * 0.57) / (vh * 0.6), 0, 1), 2);
        const direction = index % 2 ? 1 : -1,
          intensity = mobile ? 0.45 : 1;
        card.style.setProperty(
          "--cg-y",
          `${(-p * 32 + entering * 90 + direction * p * 18 + velocity * 0.4) * intensity}px`,
        );
        card.style.setProperty("--cg-x", `${direction * entering * 36 * intensity}px`);
        card.style.setProperty("--cg-turn", `${(p * 4 + velocity * 0.12) * intensity}deg`);
        card.style.setProperty("--cg-roll", `${direction * (entering * 0.65 + velocity * 0.025) * intensity}deg`);
        card.style.setProperty("--cg-scale", `${1 - entering * 0.07}`);
        card.style.setProperty("--cg-image-y", `${(p * 40 + velocity * 0.3) * intensity}px`);
        card.style.setProperty("--cg-caption-y", `${p * -8 * intensity}px`);
      }
    }
    function render(time: number) {
      frame = 0;
      if (paused || document.hidden) return;
      const dt = Math.min(50, lastTime ? time - lastTime : 16.67);
      lastTime = time;
      velocity += (targetVelocity - velocity) * (1 - Math.exp(-dt / 80));
      targetVelocity *= Math.exp(-dt / 110);
      paint();
      if (Math.abs(velocity) > 0.025 || Math.abs(targetVelocity) > 0.025) frame = requestAnimationFrame(render);
      else {
        velocity = 0;
        targetVelocity = 0;
        lastTime = 0;
      }
    }
    function schedule() {
      if (!paused && !frame && !document.hidden) frame = requestAnimationFrame(render);
    }
    function scroll() {
      const now = performance.now(),
        delta = window.scrollY - lastScroll;
      if (!paused) targetVelocity = clamp((delta / Math.max(16, now - lastScrollTime)) * 16, -32, 32);
      lastScroll = window.scrollY;
      lastScrollTime = now;
      schedule();
    }
    function sync() {
      paused = manualPaused || preference.matches || document.hidden || opening.current;
      el!.dataset.cgMotion = paused ? "paused" : "playing";
      setMotion({ paused: manualPaused || preference.matches, reduced: preference.matches });
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      velocity = 0;
      targetVelocity = 0;
      lastScroll = window.scrollY;
      lastScrollTime = performance.now();
      if (!opening.current) {
        pointerStops.forEach((stop) => stop());
        if (paused) cards.forEach(neutral);
        else schedule();
      }
    }
    syncMotion.current = sync;
    control.current = () => {
      manualPaused = !manualPaused;
      sync();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const card = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(card);
          else visible.delete(card);
        }
        schedule();
      },
      { rootMargin: "150px 0px", threshold: 0 },
    );
    cards.forEach((card) => observer.observe(card));
    media.forEach((surface) => {
      let pointerFrame = 0,
        x = 0,
        y = 0,
        tx = 0,
        ty = 0,
        z = 0,
        tz = 0,
        last = 0;
      function draw(time: number) {
        pointerFrame = 0;
        if (paused) return;
        const ease = 1 - Math.exp(-Math.min(50, last ? time - last : 16.7) / 95);
        last = time;
        x += (tx - x) * ease;
        y += (ty - y) * ease;
        z += (tz - z) * ease;
        surface.style.setProperty("--cg-focus-x", `${x * 19}px`);
        surface.style.setProperty("--cg-focus-y", `${y * 14}px`);
        surface.style.setProperty("--cg-zoom", `${1 + z * 0.075}`);
        surface.style.setProperty("--cg-light-x", `${50 - x * 35}%`);
        surface.style.setProperty("--cg-light-y", `${50 - y * 35}%`);
        if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tz - z) > 0.002) pointerFrame = requestAnimationFrame(draw);
        else last = 0;
      }
      function animate() {
        if (!pointerFrame && !paused) pointerFrame = requestAnimationFrame(draw);
      }
      const stop = () => {
        cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        tx = ty = x = y = z = tz = 0;
        surface.dataset.cgHover = "false";
        surface.style.setProperty("--cg-focus-x", "0px");
        surface.style.setProperty("--cg-focus-y", "0px");
        surface.style.setProperty("--cg-zoom", "1");
      };
      const leave = () => {
        tx = ty = tz = 0;
        surface.dataset.cgHover = "false";
        animate();
      };
      const point = (event: PointerEvent) => {
        if (paused || !fine.matches || event.pointerType !== "mouse") return;
        const rect = surface.getBoundingClientRect();
        const px = clamp((event.clientX - rect.left) / rect.width, 0, 1),
          py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        tx = (0.5 - px) * 2;
        ty = (0.5 - py) * 2;
        tz = 1;
        surface.dataset.cgHover = "true";
        surface.style.setProperty("--cg-pointer-x", `${px * 100}%`);
        surface.style.setProperty("--cg-pointer-y", `${py * 100}%`);
        animate();
      };
      surface.addEventListener("pointermove", point, { passive: true });
      surface.addEventListener("pointerleave", leave);
      surface.addEventListener("pointercancel", leave);
      pointerStops.push(stop);
      cleanup.push(() => {
        stop();
        surface.removeEventListener("pointermove", point);
        surface.removeEventListener("pointerleave", leave);
        surface.removeEventListener("pointercancel", leave);
      });
    });
    // The title uses the whole available width, including on narrow screens.
    const title = el.querySelector<HTMLElement>("[data-cg-title]")!;
    const titleText = title.querySelector<HTMLElement>("[data-cg-title-text]")!;
    function fitTitle() {
      title.style.setProperty("--cg-title-width", String(title.clientWidth / Math.max(1, titleText.offsetWidth)));
    }
    const resizeObserver = new ResizeObserver(fitTitle);
    resizeObserver.observe(title);
    function focus(event: FocusEvent) {
      if (event.target instanceof Element) {
        const card = event.target.closest<HTMLElement>("[data-cg-card]");
        if (card && !opening.current) neutral(card);
      }
    }
    function resize() {
      lastScroll = window.scrollY;
      fitTitle();
      schedule();
    }
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);
    el.addEventListener("focusin", focus);
    el.addEventListener("focusout", schedule);
    sync();
    fitTitle();
    document.fonts.ready.then(() => {
      if (!disposed) {
        fitTitle();
        schedule();
      }
    });
    return () => {
      disposed = true;
      control.current = null;
      syncMotion.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      cleanup.forEach((fn) => fn());
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
      el.removeEventListener("focusin", focus);
      el.removeEventListener("focusout", schedule);
    };
  }, []);
  function openCategory(event: MouseEvent<HTMLAnchorElement>, category: Category) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      motion.paused ||
      motion.reduced
    )
      return;
    if (opening.current) {
      event.preventDefault();
      return;
    }
    const link = event.currentTarget,
      media = link.querySelector<HTMLElement>("[data-cg-media]"),
      image = link.querySelector("img");
    if (!media || !image) return;
    const box = media.getBoundingClientRect(),
      imageBox = image.getBoundingClientRect();
    // Offscreen keyboard activation retains the immediate, native link behavior.
    if (box.bottom < 0 || box.top > window.innerHeight) return;
    event.preventDefault();
    opening.current = true;
    const rect = ({ left, top, width, height }: DOMRect) => ({ left, top, width, height });
    if (!start({ ...category, href: link.href, rect: rect(box), imageRect: rect(imageBox), trigger: link }))
      opening.current = false;
  }
  return (
    <div className={styles.page} ref={root} data-cg-root data-cg-opening={selection?.id || undefined}>
      <CategoryAtmosphere paused={motion.paused || !!selection} className={styles.atmosphere} />
      <header className={styles.intro}>
        <div className={styles.introTop}>
          <span className={styles.eyebrow}>A place for every ingredient</span>
          <span className={styles.total}>
            ({String(categories.length).padStart(2, "0")}) <ArrowDownRight aria-hidden="true" />
          </span>
        </div>
        <h1 className={styles.title} data-cg-title aria-label="Categories">
          <span className={styles.titleText} data-cg-title-text aria-hidden="true">
            {"CATEGORIES".split("").map((letter, index) => (
              <span key={index} className={styles.letter} style={{ "--cg-letter": index } as CSSProperties}>
                {letter}
              </span>
            ))}
          </span>
        </h1>
        <div className={styles.introBottom}>
          <div>
            <h2>Explore ingredients & packaging.</h2>
            <p>Find your ingredients, explore specifications and choose packaging for your next creation.</p>
          </div>
          <button
            className={styles.motionButton}
            type="button"
            aria-label={
              motion.reduced
                ? "Reduced motion enabled"
                : motion.paused
                  ? "Play category motion"
                  : "Pause category motion"
            }
            disabled={motion.reduced}
            onClick={() => control.current?.()}
          >
            {motion.paused ? <Play size={14} /> : <Pause size={14} />}
            <span>{motion.reduced ? "Reduced motion" : motion.paused ? "Play motion" : "Pause motion"}</span>
          </button>
        </div>
      </header>
      <section className={styles.grid} aria-label="Ingredient categories">
        {categories.map((category, index) => (
          <article
            className={styles.card}
            data-cg-card
            data-cg-selected={selection?.id === category.id || undefined}
            key={category.id}
          >
            <a
              className={styles.link}
              href={category.href || "/products?category=" + category.id}
              onClick={(event) => openCategory(event, category)}
              aria-labelledby={"category-title-" + category.id}
              aria-describedby={"category-copy-" + category.id}
            >
              <div className={styles.media} data-cg-media>
                <div className={styles.imageLayer}>
                  <img
                    src={category.image}
                    alt={category.label + " representative image"}
                    width={900}
                    height={600}
                    loading={index < 2 ? "eager" : "lazy"}
                    {...({ fetchpriority: index === 0 ? "high" : "auto" } as object)}
                  />
                </div>
                <span className={styles.explore} aria-hidden="true">
                  Explore
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <div className={styles.caption}>
                <div className={styles.meta}>
                  <span>
                    {category.count} {category.unit || "ingredients"}
                  </span>
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
                  </span>
                </div>
                <h2 id={"category-title-" + category.id}>
                  {category.label}
                  <ArrowUpRight aria-hidden="true" />
                </h2>
                <p id={"category-copy-" + category.id}>{category.description}</p>
              </div>
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
