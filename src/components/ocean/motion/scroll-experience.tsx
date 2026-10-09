"use client";

import { useEffect } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const p = clamp(value);
  return p * p * (3 - 2 * p);
};

/** Scroll is native. Every content link remains available without animation. */
export function ScrollExperience() {
  useEffect(() => {
    type Tool = {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => Promise<unknown>;
    };
    const context = (
      document as Document & {
        modelContext?: { registerTool: (tool: Tool, options: { signal: AbortSignal }) => void | Promise<void> };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: "search_ingredients",
            description:
              "Search the same cosmetic ingredient catalog as the website search box. Returns matching ingredient details and product-page links; does not change the cart.",
            inputSchema: {
              type: "object",
              properties: { query: { type: "string", minLength: 2, maxLength: 100 } },
              required: ["query"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
            async execute(input) {
              if (!input || typeof input !== "object" || Array.isArray(input))
                throw new Error("Provide a query of 2 to 100 characters.");
              const values = input as Record<string, unknown>;
              if (
                Object.keys(values).some((key) => key !== "query") ||
                typeof values.query !== "string" ||
                values.query.trim().length < 2 ||
                values.query.trim().length > 100
              )
                throw new Error("Provide a query of 2 to 100 characters.");
              const response = await fetch("/api/search?q=" + encodeURIComponent(values.query.trim()), {
                signal: lifecycle.signal,
              });
              if (!response.ok) throw new Error("Ingredient search is temporarily unavailable.");
              const data = (await response.json()) as {
                products: { slug: string; name: string; inci: string; category: string }[];
              };
              return {
                products: data.products.map((p) => ({
                  name: p.name,
                  inci: p.inci,
                  category: p.category,
                  href: "/products/" + p.slug,
                })),
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lusion-home-shell");
    if (!root) return;
    const rail = root.querySelector<HTMLElement>(".x-category-journey");
    const stage = root.querySelector<HTMLElement>(".x-category-stage");
    const viewport = root.querySelector<HTMLElement>(".x-category-viewport");
    const track = viewport?.querySelector<HTMLElement>(".r-product-grid");
    const cards = Array.from(track?.querySelectorAll<HTMLElement>(".l-category-link") || []);
    const index = root.querySelector<HTMLElement>(".x-rail-index");
    const portal = root.querySelector<HTMLElement>(".x-portal-journey");
    const portalStage = portal?.querySelector<HTMLElement>(".x-portal-stage");
    const rings = Array.from(portal?.querySelectorAll<HTMLElement>(".x-portal-ring") || []);
    const workspace = root.querySelector<HTMLElement>(".l-workspace");
    const bridge = root.querySelector<HTMLElement>(".molecular-bridge");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px) and (min-height: 820px)");
    let paused = root.dataset.motion === "paused" || media.matches;
    let frame = 0,
      travel = 0,
      top = 130,
      disposed = false;
    const oldEnhanced = root.dataset.scrollExperience;
    const saved = new Map<HTMLElement, Map<string, string>>();
    function set(el: HTMLElement | undefined | null, key: string, value: string) {
      if (!el) return;
      if (!saved.has(el)) saved.set(el, new Map());
      const values = saved.get(el)!;
      if (!values.has(key)) values.set(key, el.style.getPropertyValue(key));
      el.style.setProperty(key, value);
    }
    function paint() {
      frame = 0;
      if (paused || media.matches || document.hidden) return;
      const height = window.innerHeight;
      if (rail && stage && track && viewport && rail.dataset.scrollRail === "true") {
        const rect = rail.getBoundingClientRect();
        const p = clamp((top - rect.top) / Math.max(1, rail.offsetHeight - stage.offsetHeight));
        set(track, "--rail-x", `${(-travel * p).toFixed(2)}px`);
        set(rail, "--rail-progress", p.toFixed(4));
        if (index)
          index.textContent = `${String(Math.min(cards.length, Math.floor(p * (cards.length - 0.001)) + 1)).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
        cards.forEach((card) => {
          const article = card.parentElement!;
          const center = article.offsetLeft + article.offsetWidth / 2 - travel * p;
          const drift = Math.max(-1, Math.min(1, (center - viewport.clientWidth / 2) / viewport.clientWidth));
          set(card, "--card-turn", `${(drift * 5).toFixed(2)}deg`);
          set(card, "--card-lift", `${(Math.abs(drift) * 36).toFixed(2)}px`);
        });
      }
      if (portal && portalStage) {
        const rect = portal.getBoundingClientRect();
        const cinematic = portal.dataset.cinematic === "true";
        const p = cinematic
          ? clamp((top - rect.top) / Math.max(1, portal.offsetHeight - portalStage.offsetHeight))
          : clamp((height - rect.top) / (height + rect.height));
        set(portal, "--portal-progress", p.toFixed(4));
        set(portal, "--portal-light", ease((p - 0.79) / 0.21).toFixed(4));
        set(portal, "--portal-text-scale", (1 + ease(p / 0.38) * 5).toFixed(4));
        set(portal, "--portal-text-opacity", (1 - ease((p - 0.07) / 0.2)).toFixed(4));
        set(portal, "--portal-next-opacity", ease((p - 0.67) / 0.17).toFixed(4));
        set(portal, "--portal-next-scale", (0.66 + 0.34 * ease((p - 0.64) / 0.2)).toFixed(4));
        rings.forEach((ring) => {
          const i = Number(ring.dataset.ring || 0);
          const distance = 0.85 + i * 1.1 - p * 3.7;
          const scale = Math.min(9, 0.92 / Math.max(0.1, distance));
          const opacity = distance <= 0 ? 0 : ease(distance / 0.2) * clamp((4 - distance) / 1.5);
          set(ring, "--ring-scale", scale.toFixed(4));
          set(ring, "--ring-turn", `${(i * 57 + p * (i % 2 ? -125 : 155)).toFixed(2)}deg`);
          set(ring, "--ring-opacity", opacity.toFixed(4));
          set(ring, "--ring-tilt", `${(Math.sin(p * Math.PI) * 18 * (i % 2 ? -1 : 1)).toFixed(2)}deg`);
          set(ring, "--ring-shift", `${(Math.sin(p * 6 + i) * p * 35).toFixed(2)}px`);
        });
      }
      if (workspace) {
        const r = workspace.getBoundingClientRect();
        const p = ease((height - r.top) / (height * 0.85));
        set(workspace, "--workspace-inset", `${((1 - p) * 12).toFixed(3)}%`);
        set(workspace, "--workspace-scale", (0.91 + p * 0.09).toFixed(4));
        set(workspace, "--workspace-radius", `${(70 - p * 46).toFixed(2)}px`);
      }
      if (bridge) {
        const r = bridge.getBoundingClientRect();
        const p = clamp((height - r.top) / (height + r.height));
        set(bridge, "--bridge-scale", (0.72 + p * 0.6).toFixed(4));
        set(bridge, "--bridge-turn", `${(12 - p * 24).toFixed(3)}deg`);
      }
    }
    function schedule() {
      if (!frame && !paused && !document.hidden) frame = requestAnimationFrame(paint);
    }
    function measure() {
      if (disposed) return;
      top = (root!.querySelector<HTMLElement>(".r-header")?.offsetHeight || 114) + 16;
      set(root, "--experience-top", `${top}px`);
      const enabled = wide.matches && !paused && !media.matches;
      if (rail) rail.dataset.scrollRail = String(enabled);
      if (portal) portal.dataset.cinematic = String(enabled);
      root!.dataset.scrollExperience = paused ? "paused" : "playing";
      if (track && viewport && rail && stage) {
        travel = enabled ? Math.max(0, track.scrollWidth - viewport.clientWidth) : 0;
        set(rail, "--rail-distance", `${Math.round(travel * 1.15)}px`);
        set(rail, "--rail-stage-height", `${stage.offsetHeight}px`);
      }
      schedule();
    }
    function motion(event: Event) {
      // Keep the content being viewed in place when switching to a static layout.
      const middle = (top + window.innerHeight) / 2;
      let anchor: HTMLElement | undefined;
      if (rail && stage && rail.getBoundingClientRect().top < middle && rail.getBoundingClientRect().bottom > middle) {
        anchor = cards.reduce<HTMLElement | undefined>((best, card) => {
          const r = card.getBoundingClientRect(),
            b = best?.getBoundingClientRect();
          const score =
            Math.abs(r.left + r.width / 2 - window.innerWidth / 2) + Math.abs(r.top + r.height / 2 - middle);
          const oldScore = b
            ? Math.abs(b.left + b.width / 2 - window.innerWidth / 2) + Math.abs(b.top + b.height / 2 - middle)
            : Infinity;
          return score < oldScore ? card : best;
        }, undefined);
      } else if (
        portal &&
        portalStage &&
        portal.getBoundingClientRect().top < middle &&
        portal.getBoundingClientRect().bottom > middle
      ) {
        anchor = portalStage;
      }
      const anchorTop = anchor?.getBoundingClientRect().top;
      paused = (event as CustomEvent<{ paused: boolean }>).detail.paused || media.matches;
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) {
        measure();
        if (anchor && anchorTop !== undefined) {
          if (!paused && rail?.dataset.scrollRail === "true" && anchor.matches(".l-category-link")) {
            const article = anchor.parentElement!;
            const target = Math.max(
              0,
              Math.min(travel, article.offsetLeft - (viewport!.clientWidth - article.offsetWidth) / 2),
            );
            const start = window.scrollY + rail.getBoundingClientRect().top - top;
            window.scrollTo({
              top: start + (target / Math.max(1, travel)) * (rail.offsetHeight - stage!.offsetHeight),
              behavior: "instant",
            });
          } else {
            window.scrollTo({
              top: window.scrollY + anchor.getBoundingClientRect().top - anchorTop,
              behavior: "instant",
            });
          }
        }
      }
    }
    function preference() {
      paused = media.matches || root!.dataset.motion === "paused";
      measure();
    }
    function focus(event: FocusEvent) {
      if (!rail || !stage || !track || rail.dataset.scrollRail !== "true" || !(event.target instanceof Element)) return;
      const card = event.target.closest<HTMLElement>(".l-featured-category");
      if (!card || !track.contains(card)) return;
      const target = Math.max(0, Math.min(travel, card.offsetLeft - (viewport!.clientWidth - card.offsetWidth) / 2));
      const railStart = window.scrollY + rail.getBoundingClientRect().top - top;
      window.scrollTo({
        top: railStart + (target / Math.max(1, travel)) * (rail.offsetHeight - stage.offsetHeight),
        behavior: "instant",
      });
      schedule();
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("cj-motion-change", motion);
    media.addEventListener("change", preference);
    root.addEventListener("focusin", focus);
    measure();
    document.fonts?.ready.then(() => {
      if (!disposed) measure();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("cj-motion-change", motion);
      media.removeEventListener("change", preference);
      root.removeEventListener("focusin", focus);
      delete rail?.dataset.scrollRail;
      delete portal?.dataset.cinematic;
      if (oldEnhanced === undefined) delete root.dataset.scrollExperience;
      else root.dataset.scrollExperience = oldEnhanced;
      saved.forEach((values, el) =>
        values.forEach((value, key) => (value ? el.style.setProperty(key, value) : el.style.removeProperty(key))),
      );
    };
  }, []);
  return null;
}

/** A decorative transition, using the same ingredient artwork as the hero. */
export function IngredientPortal({ count = 1103 }: { count?: number }) {
  return (
    <div className="x-portal-journey" aria-hidden="true">
      <div className="x-portal-stage">
        <div className="x-portal-depth">
          {[2, 1, 0].map((i) => (
            <div
              className={"x-portal-ring x-portal-ring-" + i}
              key={i}
              data-ring={i}
              style={
                {
                  "--ring-scale": String(0.92 / (0.85 + i * 1.1)),
                  "--ring-turn": `${i * 57}deg`,
                } as React.CSSProperties
              }
            >
              <img
                src="/assets/gel-sculpture.webp"
                alt=""
                width={1254}
                height={1254}
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
        <div className="x-portal-light" />
        <div className="x-portal-first">
          <span>For the curious formulator</span>
          <strong>
            One
            <br />
            library.
          </strong>
        </div>
        <div className="x-portal-next">
          <strong>{count.toLocaleString("en-US")}</strong>
          <span>starting points.</span>
        </div>
        <div className="x-portal-bottom">
          <span>KEEP EXPLORING</span>
          <div>
            <i />
          </div>
          <span>SCROLL TO DISCOVER</span>
        </div>
      </div>
    </div>
  );
}
