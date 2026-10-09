"use client";
import BrandLogo from "./brand-logo";
import LogoAssembly from "./logo-assembly";

import { useEffect, useRef, useState } from "react";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (a: number, b: number, n: number) => {
  const p = clamp((n - a) / (b - a));
  return p * p * (3 - 2 * p);
};

/** A separate entry layer. The selected page is ready beneath it. */
export default function CinematicIntro({
  variant = "home",
}: {
  variant?: "home" | "packaging" | "services" | "studio" | "about" | "library";
}) {
  const packaging = variant === "packaging";
  const titleIntro = variant !== "home";
  const title = {
    home: "COCOJOJO",
    packaging: "Shop Packaging",
    services: "Services",
    studio: "Formulation studio",
    about: "Who Are We?",
    library: "A to Z Library",
  }[variant];
  const root = useRef<HTMLDivElement>(null);
  const finish = useRef<() => void>(() => {});
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (complete) return;
    const el = root.current;
    const shell = document.querySelector<HTMLElement>(
      titleIntro ? "." + variant + "-entry-shell" : ".lusion-home-shell",
    );
    if (!el || !shell) {
      setComplete(true);
      return;
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const catalogParams =
      variant === "library"
        ? ["q", "source", "category", "letter", "function", "application", "solubility", "form", "sort", "page"]
        : ["q", "type", "source", "sort", "page"];
    const catalogNavigation =
      (packaging || variant === "library") &&
      catalogParams.some((key) => new URLSearchParams(location.search).has(key));
    if (
      reduced.matches ||
      location.hash ||
      window.scrollY > 100 ||
      navigation?.type === "back_forward" ||
      catalogNavigation
    ) {
      setComplete(true);
      return;
    }
    const oldOverflow = document.documentElement.style.overflow;
    const oldInert = shell.inert;
    const previousFocus = document.activeElement as HTMLElement | null;
    const skip = el.querySelector<HTMLButtonElement>(".cj-entry-skip");
    let stopped = false,
      frame = 0,
      failSafe = 0,
      assetsReady = false,
      phaseStart: number | null = null,
      lastCount = -1;
    const begin = performance.now();
    document.documentElement.style.overflow = "hidden";
    shell.inert = true;
    shell.dataset.entry = "waiting";
    skip?.focus({ preventScroll: true });

    const restore = () => {
      document.documentElement.style.overflow = oldOverflow;
      shell.inert = oldInert;
      delete shell.dataset.entry;
      shell.style.removeProperty("--entry-reveal");
    };
    const end = (focus = false) => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(frame);
      clearTimeout(failSafe);
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
      restore();
      setComplete(true);
      if (focus) {
        const heading = titleIntro
          ? shell.querySelector<HTMLElement>(
              packaging
                ? ".pk-hero h1"
                : variant === "studio"
                  ? ".r-page-intro h1"
                  : variant === "library"
                    ? ".r-catalog-head h1"
                    : ".e-hero h1",
            )
          : document.getElementById("home-title");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
          heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
        }
      } else if (document.activeElement === skip) {
        skip?.blur();
        previousFocus?.focus?.({ preventScroll: true });
      }
    };
    finish.current = () => end(true);
    const images = [
      ...el.querySelectorAll("img"),
      ...shell.querySelectorAll<HTMLImageElement>(
        packaging
          ? ".pk-hero img"
          : variant === "services" || variant === "about"
            ? ".e-hero-object img"
            : ".l-sculpture",
      ),
    ];
    Promise.allSettled([document.fonts.ready, ...images.map((img) => img.decode().catch(() => {}))]).then(() => {
      assetsReady = true;
    });

    function render(now: number) {
      if (stopped) return;
      const elapsed = now - begin;
      if (titleIntro && phaseStart === null) phaseStart = begin;
      if (phaseStart === null && elapsed >= 1950 && (assetsReady || elapsed >= 2700)) phaseStart = now;
      const progress =
        phaseStart === null
          ? Math.min(assetsReady ? 99 : 89, Math.floor(100 * (1 - Math.pow(1 - clamp(elapsed / 2050), 1.35))))
          : 100;
      if (progress !== lastCount) {
        const value = String(progress).padStart(3, "0");
        el!
          .querySelectorAll<HTMLElement>(".cj-entry-digit-track")
          .forEach((digit, i) => (digit.style.transform = `translateY(-${value[i]}em)`));
        el!.style.setProperty("--entry-load", String(progress / 100));
        lastCount = progress;
      }
      const t = phaseStart === null ? -1 : now - phaseStart;
      const assemblyTime = titleIntro ? 0 : 1000;
      const phase =
        t < 0
          ? "loading"
          : t < (titleIntro ? 480 : 1440)
            ? "resolve"
            : t < 1030 + assemblyTime
              ? "logo"
              : t < 1510 + assemblyTime
                ? "large-logo"
                : t < 1930 + assemblyTime
                  ? "zoom"
                  : "reveal";
      el!.dataset.phase = phase;
      el!.dataset.elapsed = String(Math.round(elapsed));
      if (!titleIntro) {
        el!.dataset.assembly = t < 0 ? "waiting" : t < 1440 ? "forming" : "complete";
        el!.style.setProperty("--entry-assembled-alpha", String(smooth(1320, 1440, t)));
      }
      const appear = smooth(60, 410, t);
      const expand = smooth(800 + assemblyTime, 1270 + assemblyTime, t);
      const flight = Math.pow(clamp((t - 1510 - assemblyTime) / 420), 3.4);
      const small = titleIntro ? Math.min(250, window.innerWidth * 0.55) : Math.min(690, window.innerWidth * 0.82);
      const large = Math.min(1450, window.innerWidth * 0.92);
      const logoScale = (small + (large - small) * expand) / large;
      el!.style.setProperty("--entry-logo-width", `${large}px`);
      el!.style.setProperty("--entry-logo-alpha", String(appear));
      el!.style.setProperty("--entry-logo-scale", String(logoScale * (1 + flight * 26)));
      el!.style.setProperty("--entry-logo-tilt", `${(1 - appear) * -28 + flight * 9}deg`);
      el!.style.setProperty("--entry-logo-y", `${(1 - appear) * 20}px`);
      el!.style.setProperty("--entry-bar-alpha", String(1 - smooth(0, 300, t)));
      el!.style.setProperty("--entry-collapse", String(smooth(0, 360, t)));
      el!.style.setProperty("--entry-bloom", String(0.12 + expand * 0.24 + flight * 0.64));
      el!.style.setProperty("--entry-wash", String(smooth(1720 + assemblyTime, 1920 + assemblyTime, t)));
      el!.style.setProperty("--entry-ui", String(1 - smooth(1390 + assemblyTime, 1610 + assemblyTime, t)));
      const reveal = smooth(1920 + assemblyTime, 2470 + assemblyTime, t);
      el!.style.setProperty("--entry-opacity", String(1 - reveal));
      shell!.style.setProperty("--entry-reveal", String(reveal));
      if (t >= 1920 + assemblyTime) shell!.dataset.entry = "revealing";
      if (t >= 2500 + assemblyTime) {
        end();
        return;
      }
      frame = requestAnimationFrame(render);
    }
    const key = (e: KeyboardEvent) => {
      if (stopped) return;
      if (e.key === "Escape") {
        e.preventDefault();
        end(true);
      } else if (e.key === "Tab") {
        e.preventDefault();
        skip?.focus();
      }
    };
    const preference = () => {
      if (reduced.matches) end();
    };
    const visibility = () => {
      if (document.hidden) end();
    };
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", preference);
    frame = requestAnimationFrame(render);
    // A failed image, stalled animation frame or hidden tab must never block entry.
    failSafe = window.setTimeout(() => end(), 7000);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      clearTimeout(failSafe);
      restore();
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
      finish.current = () => {};
    };
  }, [variant, complete]);

  if (complete) return null;
  return (
    <div
      className={"cj-entry cj-entry-" + variant}
      ref={root}
      data-phase={titleIntro ? "resolve" : "loading"}
      role="dialog"
      aria-modal="true"
      aria-label={titleIntro ? title + " introduction" : "COCOJOJO introduction"}
      onPointerMove={
        titleIntro
          ? undefined
          : (event) => {
              if (event.pointerType === "touch" || !root.current) return;
              root.current.style.setProperty("--loader-x", String(event.clientX / window.innerWidth - 0.5));
              root.current.style.setProperty("--loader-y", String(event.clientY / window.innerHeight - 0.5));
            }
      }
      onPointerLeave={
        titleIntro
          ? undefined
          : () => {
              root.current?.style.setProperty("--loader-x", "0");
              root.current?.style.setProperty("--loader-y", "0");
            }
      }
    >
      <div className="cj-entry-atmosphere" aria-hidden="true" />
      <div className="cj-entry-top" aria-hidden="true">
        <span className="cj-brand-surface">
          <BrandLogo decorative />
        </span>
      </div>
      <div className="cj-entry-center" aria-hidden="true">
        {!titleIntro && (
          <div className="cj-entry-launch">
            <div className="cj-entry-launch-field">
              <div className="cj-entry-launch-aura" />
              <svg className="cj-entry-orbital-meter" viewBox="0 0 500 420" fill="none">
                <defs>
                  <linearGradient
                    id="cj-launch-energy"
                    x1="80"
                    y1="80"
                    x2="420"
                    y2="340"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#d7f8ff" />
                    <stop offset=".36" stopColor="#40cfff" />
                    <stop offset=".76" stopColor="#376ee9" />
                    <stop offset="1" stopColor="#ffe6a4" />
                  </linearGradient>
                </defs>
                <circle
                  className="cj-entry-meter-ticks"
                  cx="250"
                  cy="210"
                  r="191"
                  stroke="#6da7cb"
                  strokeWidth="2"
                  strokeDasharray="1 15"
                />
                <circle cx="250" cy="210" r="169" stroke="#67c8f0" strokeOpacity=".12" />
                <circle
                  className="cj-entry-meter-fill"
                  cx="250"
                  cy="210"
                  r="169"
                  pathLength="100"
                  stroke="url(#cj-launch-energy)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className="cj-entry-launch-art">
                <img
                  src="/assets/footer-blue-molecules.webp"
                  width={1600}
                  height={1000}
                  alt=""
                  draggable={false}
                  decoding="async"
                  {...({ fetchpriority: "high" } as object)}
                />
              </div>
              <div className="cj-entry-electrons">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="cj-entry-track-wrap">
              <div className="cj-entry-track">
                <div className="cj-entry-track-fill" />
                <div className="cj-entry-track-divisions">
                  {Array.from({ length: 16 }, (_, i) => (
                    <i key={i} />
                  ))}
                </div>
              </div>
              <div className="cj-entry-track-head" />
              <div className="cj-entry-track-reflection" />
            </div>
          </div>
        )}
        <div className="cj-entry-logo">
          {titleIntro ? (
            <div className="cj-entry-title">
              {packaging && <span>Shop</span>}
              <strong>
                {packaging ? (
                  "Packaging"
                ) : variant === "studio" ? (
                  <>
                    Formulation
                    <br />
                    studio
                  </>
                ) : variant === "about" ? (
                  <>
                    Who Are
                    <br />
                    We?
                  </>
                ) : variant === "library" ? (
                  <>
                    A to Z<br />
                    Library
                  </>
                ) : (
                  "Services"
                )}
              </strong>
            </div>
          ) : (
            <LogoAssembly />
          )}
        </div>
      </div>
      <div className="cj-entry-wash" aria-hidden="true" />
      <div className="cj-entry-bottom">
        {!titleIntro && (
          <div className="cj-entry-loading">
            <div className="cj-entry-counter" aria-hidden="true">
              {[0, 1, 2].map((n) => (
                <span className="cj-entry-digit" key={n}>
                  <span className="cj-entry-digit-track">
                    {Array.from({ length: 10 }, (_, d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </span>
                </span>
              ))}
            </div>
            <span className="cj-entry-caption">Loading experience</span>
          </div>
        )}
        <button
          className="cj-entry-skip"
          onClick={() => {
            finish.current();
            setComplete(true);
          }}
        >
          Skip intro
        </button>
      </div>
      <p className="r-visually-hidden" role="status">
        {titleIntro ? title : "Loading COCOJOJO"}. You can skip the introduction.
      </p>
      <noscript>
        <style>{".cj-entry{display:none!important}"}</style>
      </noscript>
    </div>
  );
}
