"use client";

import { useEffect, useRef } from "react";

export default function BlueFooterArt() {
  const scene = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scene.current,
      footer = el?.closest("footer");
    if (!el || !footer) return;
    const root = footer.closest<HTMLElement>(".lusion-home-shell");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover:hover) and (pointer:fine)");
    let frame = 0,
      x = 0,
      y = 0,
      visible = false;
    function reset() {
      x = 0;
      y = 0;
      el!.style.setProperty("--footer-x", "0px");
      el!.style.setProperty("--footer-y", "0px");
      el!.style.setProperty("--footer-turn", "0deg");
    }
    function paint() {
      frame = 0;
      el!.style.setProperty("--footer-x", `${x * 12}px`);
      el!.style.setProperty("--footer-y", `${y * 8}px`);
      el!.style.setProperty("--footer-turn", `${x * 2}deg`);
    }
    function point(event: PointerEvent) {
      if (
        !visible ||
        reduced.matches ||
        !fine.matches ||
        event.pointerType !== "mouse" ||
        root?.dataset.motion !== "playing"
      )
        return;
      const r = footer!.getBoundingClientRect();
      x = (event.clientX - r.left) / r.width - 0.5;
      y = (event.clientY - r.top) / r.height - 0.5;
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function motion() {
      if (reduced.matches || root?.dataset.motion !== "playing") {
        cancelAnimationFrame(frame);
        frame = 0;
        reset();
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        el.dataset.visible = String(visible);
      },
      { rootMargin: "80px" },
    );
    observer.observe(el);
    footer.addEventListener("pointermove", point, { passive: true });
    footer.addEventListener("pointerleave", reset);
    window.addEventListener("cj-motion-change", motion);
    reduced.addEventListener("change", motion);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      footer.removeEventListener("pointermove", point);
      footer.removeEventListener("pointerleave", reset);
      window.removeEventListener("cj-motion-change", motion);
      reduced.removeEventListener("change", motion);
    };
  }, []);
  return (
    <div className="b-footer-art" ref={scene} aria-hidden="true">
      <div className="b-footer-sculpture">
        <img
          src="/assets/footer-blue-molecules.webp"
          alt=""
          width={1564}
          height={1006}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}
