"use client";
import BrandLogo from "./brand-logo";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, BookOpen, FlaskConical, Rotate3D } from "lucide-react";

const collections = [
  {
    label: "Carrier oils",
    id: "carrier-oils",
    image: "oils",
    title: "A beautiful beginning.",
    copy: "Explore the oil phase. Discover carrier oils, textures and possibilities.",
  },
  {
    label: "Actives & vitamins",
    id: "actives-vitamins",
    image: "actives",
    title: "Every detail matters.",
    copy: "Get to know the ingredients at the heart of your next formulation.",
  },
  {
    label: "Botanical extracts",
    id: "botanicals",
    image: "botanicals",
    title: "Inspired by nature.",
    copy: "Discover botanical extracts and waters, with technical details at hand.",
  },
];

export default function LusionHero({
  price,
  pack,
  href = "/products/jojoba-golden-retail",
  name = "Golden Jojoba Oil",
}: {
  price: string;
  pack: string;
  href?: string;
  name?: string;
}) {
  const [selected, setSelected] = useState(0);
  const [shifted, setShifted] = useState(false);
  const [paused, setPaused] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const journey = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const active = collections[selected];
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setPaused(
        media.matches || document.querySelector(".lusion-home-shell")?.getAttribute("data-motion") === "paused",
      );
    const motion = (e: Event) => setPaused((e as CustomEvent<{ paused: boolean }>).detail.paused);
    update();
    media.addEventListener("change", update);
    window.addEventListener("cj-motion-change", motion);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("cj-motion-change", motion);
    };
  }, []);
  useEffect(() => {
    const el = stage.current,
      track = journey.current;
    if (!el || !track || paused) return;
    let frame = 0,
      visible = true,
      last = 0;
    let x = 0,
      y = 0,
      vx = 0,
      vy = 0,
      progress = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(render);
      },
      { rootMargin: "150px" },
    );
    const render = (time: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min((time - last) / 16.67 || 1, 2);
      last = time;
      vx = (vx + (pointer.current.x - x) * 0.035 * dt) * Math.pow(0.8, dt);
      vy = (vy + (pointer.current.y - y) * 0.035 * dt) * Math.pow(0.8, dt);
      x += vx * dt;
      y += vy * dt;
      const rect = track.getBoundingClientRect(),
        desktop = window.innerWidth > 850;
      const top = parseFloat(getComputedStyle(el).top) || 0;
      const distance = track.offsetHeight - el.offsetHeight;
      const target = desktop ? Math.max(0, Math.min(1, (top - rect.top) / Math.max(1, distance))) : 0;
      progress += (target - progress) * 0.13 * dt;
      el.style.setProperty("--pointer-x", x.toFixed(2) + "px");
      el.style.setProperty("--pointer-y", y.toFixed(2) + "px");
      el.style.setProperty("--pointer-rx", (-y * 0.14).toFixed(2) + "deg");
      el.style.setProperty("--pointer-ry", (x * 0.14).toFixed(2) + "deg");
      el.style.setProperty("--journey", progress.toFixed(4));
      frame = requestAnimationFrame(render);
    };
    observer.observe(track);
    frame = requestAnimationFrame(render);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [paused]);
  function point(e: React.PointerEvent<HTMLDivElement>) {
    if (paused || e.pointerType !== "mouse") return;
    const b = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((e.clientX - b.left) / b.width - 0.5) * 130,
      y: ((e.clientY - b.top) / b.height - 0.5) * 95,
    };
  }
  return (
    <section className="l-hero" aria-labelledby="home-title">
      <div className="l-hero-journey" ref={journey}>
        <div
          className="l-hero-stage"
          ref={stage}
          data-scene={shifted ? "amber" : "blue"}
          data-motion={paused ? "paused" : "playing"}
          onPointerMove={point}
          onPointerLeave={() => {
            pointer.current = { x: 0, y: 0 };
          }}
        >
          <div className="l-scene-atmosphere" aria-hidden="true" />
          <div className="l-orbit l-orbit-one" aria-hidden="true">
            <i />
          </div>
          <div className="l-orbit l-orbit-two" aria-hidden="true">
            <i />
          </div>
          <div className="l-sculpture-journey" aria-hidden="true">
            <div className="l-sculpture-pointer">
              <div className="l-sculpture-spin">
                <img
                  className="l-sculpture"
                  src="/assets/gel-sculpture.webp"
                  width={1254}
                  height={1254}
                  alt=""
                  {...({ fetchpriority: "high" } as object)}
                  draggable={false}
                />
              </div>
            </div>
          </div>
          <div className="l-hero-shade" aria-hidden="true" />
          <div className="l-hero-copy">
            <span className="l-label">
              <i className="l-live-dot" aria-hidden="true" />
              <span className="cj-brand-surface">
                <BrandLogo />
              </span>
            </span>
            <h1 id="home-title" aria-label="Great formulas. Start with great ingredients.">
              <span className="l-title-line">
                <span>Great formulas.</span>
              </span>
              <span className="l-title-line l-title-muted">
                <span>Start with great</span>
              </span>
              <span className="l-title-line l-title-muted">
                <span>ingredients.</span>
              </span>
            </h1>
            <p>
              Bring your next idea to life. Explore oils, actives and cosmetic ingredients with the information you need
              to create.
            </p>
            <div className="l-hero-actions">
              <a href="/shop" className="r-btn r-primary">
                Shop ingredients
              </a>
              <a href="/ingredients-a-z" className="r-btn r-outline">
                Explore A–Z
              </a>
            </div>
          </div>
          <button
            className="l-scene-control"
            aria-label="Change the ingredient scene"
            aria-pressed={shifted}
            onClick={() => setShifted(!shifted)}
          >
            <Rotate3D size={19} />
            <span>{shifted ? "Explore another angle" : "Play with the scene"}</span>
          </button>
          <div className="l-hero-foot">
            <div className="l-hero-links">
              <a href="/documents">
                <BookOpen size={17} />
                Technical library
              </a>
              <a href="/formulation-tools">
                <FlaskConical size={17} />
                Formulation tools
              </a>
            </div>
            <a className="l-scroll-cue" href="#ingredient-collections">
              <span>Scroll to explore</span>
              <ArrowDown size={17} />
            </a>
          </div>
        </div>
      </div>
      <div className="l-ingredient-edit" id="ingredient-collections">
        <div className="l-edit-selector">
          <span className="l-label">
            THE INGREDIENT EDIT <b>0{selected + 1} / 03</b>
          </span>
          <div className="l-edit-tabs" role="group" aria-label="Choose an ingredient collection">
            {collections.map((item, i) => (
              <button key={item.id} aria-pressed={selected === i} onClick={() => setSelected(i)}>
                <span>0{i + 1}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <a className="l-edit-feature" href={"/products?category=" + active.id} key={active.id}>
          <img
            src={"/assets/ingredients/" + active.image + ".webp"}
            width={136}
            height={136}
            alt={active.label + " representative ingredient photograph"}
          />
          <div>
            <span>{active.label}</span>
            <h2>{active.title}</h2>
            <span className="l-underlined">Explore this collection</span>
          </div>
        </a>
        <a className="l-spotlight" href={href}>
          <span className="l-label">Ingredient spotlight</span>
          <strong>{name}</strong>
          <span>
            {pack} · {price}
          </span>
          <span className="l-spotlight-mark" aria-hidden="true">
            +
          </span>
        </a>
        <p className="r-visually-hidden" aria-live="polite">
          {active.copy}
        </p>
      </div>
    </section>
  );
}
