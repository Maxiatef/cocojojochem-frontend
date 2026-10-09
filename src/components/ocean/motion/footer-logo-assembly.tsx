"use client";

import { useEffect, useRef } from "react";
import LogoAssembly from "./logo-assembly";

/** Start the supplied artwork's assembly when the large footer enters view. */
export default function FooterLogoAssembly() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const shell = el.closest<HTMLElement>(".lusion-home-shell");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0,
      visible = false;
    const blocked = () => reduced.matches || document.hidden || shell?.dataset.motion === "paused";
    function settle() {
      clearTimeout(timer);
      el!.dataset.assembly = "complete";
    }
    function prepare() {
      clearTimeout(timer);
      el!.dataset.assembly = blocked() ? "complete" : "waiting";
    }
    function play() {
      if (blocked()) {
        settle();
        return;
      }
      if (!visible || el!.dataset.assembly !== "waiting") return;
      el!.dataset.assembly = "forming";
      timer = window.setTimeout(settle, 1440);
    }
    function sync() {
      if (blocked()) settle();
      else if (!visible) prepare();
      else play();
    }
    if (!("IntersectionObserver" in window)) {
      settle();
      return;
    }
    prepare();
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.22;
        el.dataset.visible = String(entry.isIntersecting);
        if (!entry.isIntersecting) prepare();
        else play();
      },
      { threshold: [0, 0.22] },
    );
    observer.observe(el);
    window.addEventListener("cj-motion-change", sync);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("cj-motion-change", sync);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div className="b-footer-wordmark cj-footer-reveal" ref={root}>
      <LogoAssembly variant="footer" />
    </div>
  );
}
