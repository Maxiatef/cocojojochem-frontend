"use client";
import BrandLogo from "./brand-logo";

import { useEffect, useRef, useState } from "react";
import { BookOpen, FlaskConical, Layers3 } from "lucide-react";

const edits = [
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

export function GlossHero({ price, pack }: { price: string; pack: string }) {
  const [selected, setSelected] = useState(0);
  const active = edits[selected];
  const hero = useRef<HTMLElement>(null);
  function point(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--shine-x", ((e.clientX - bounds.left) / bounds.width) * 100 + "%");
    e.currentTarget.style.setProperty("--shine-y", ((e.clientY - bounds.top) / bounds.height) * 100 + "%");
  }
  return (
    <section className="g-hero" ref={hero} onPointerMove={point}>
      <div className="g-hero-sheen" aria-hidden="true" />
      <div className="r-wrap g-hero-layout">
        <div className="g-hero-copy">
          <span className="g-kicker">
            <BrandLogo />
          </span>
          <h1>
            Great formulas.
            <br />
            Start with
            <br />
            <em>great ingredients.</em>
          </h1>
          <p>
            Bring your next idea to life. Explore oils, actives and cosmetic ingredients with the information you need
            to create.
          </p>
          <div className="g-hero-actions">
            <a className="r-btn r-primary" href="/shop">
              Shop ingredients
            </a>
            <a className="r-btn r-glass" href="/ingredients-a-z">
              Explore A–Z
            </a>
          </div>
          <div className="g-hero-links">
            <a href="/documents">
              <BookOpen size={18} />
              Technical library
            </a>
            <a href="/formulation-tools">
              <FlaskConical size={18} />
              Formulation tools
            </a>
          </div>
        </div>
        <div className="g-hero-visual">
          <div className="g-image-border">
            <div className="g-ingredient-image" key={active.id}>
              <img
                src={"/assets/ingredients/" + active.image + ".webp"}
                alt={active.label + " representative ingredient photograph"}
                width={700}
                height={760}
                {...({ fetchpriority: "high" } as object)}
              />
              <span className="g-photo-label">
                THE INGREDIENT EDIT <span>0{selected + 1} / 03</span>
              </span>
              <div className="g-image-caption">
                <span>{active.label}</span>
                <h2>{active.title}</h2>
                <a href={"/products?category=" + active.id}>Explore this collection</a>
              </div>
            </div>
          </div>
          <a className="g-glass-note" href="/products/jojoba-golden-retail">
            <span className="g-note-icon">
              <Layers3 size={22} />
            </span>
            <span>
              <small>Ingredient spotlight</small>
              <strong>Golden Jojoba Oil</strong>
              <span>
                {pack} · {price}
              </span>
            </span>
          </a>
          <div className="g-hero-tabs" role="group" aria-label="Choose an ingredient collection">
            {edits.map((edit, i) => (
              <button type="button" key={edit.id} aria-pressed={selected === i} onClick={() => setSelected(i)}>
                <span className="g-tab-number">0{i + 1}</span>
                {edit.label}
              </button>
            ))}
          </div>
          <p className="r-visually-hidden" aria-live="polite">
            {active.copy}
          </p>
        </div>
      </div>
    </section>
  );
}

export function GlossMotion() {
  useEffect(() => {
    if (document.querySelector(".lusion-home-shell")) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".r-section-heading,.r-editorial,.r-library-band>.r-wrap,.r-help-band,.r-category-directory>a,.r-product-card,.r-page-intro",
      ),
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("g-revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.07, rootMargin: "0px 0px 30px 0px" },
    );
    elements.forEach((el, i) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("g-reveal");
        el.style.setProperty("--reveal-delay", `${Math.min(i % 4, 3) * 65}ms`);
        observer.observe(el);
      }
    });
    const show = () => elements.forEach((el) => el.classList.add("g-revealed"));
    media.addEventListener("change", show);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", show);
      elements.forEach((el) => el.classList.remove("g-reveal", "g-revealed"));
    };
  }, []);
  return null;
}
