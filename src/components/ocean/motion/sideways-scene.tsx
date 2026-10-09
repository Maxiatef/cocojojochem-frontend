"use client";
import BrandLogo from "./brand-logo";

import { useEffect, useRef } from "react";
import { createSidewaysMotion } from "./sideways-motion";

const scenes = [
  {
    id: "discover",
    label: "Discover",
    eyebrow: "The right ingredients",
    title: (
      <>
        Every idea
        <br />
        starts here.
      </>
    ),
    copy: "Explore oils, actives and the ingredients for your next creation.",
    link: "/categories",
    action: "Browse ingredients",
    image: "/assets/ingredient-world.webp",
    alt: "Glossy blue and gold ingredient droplets flowing together",
  },
  {
    id: "formulate",
    label: "Formulate",
    eyebrow: "From ingredient to formula",
    title: (
      <>
        Find your
        <br />
        perfect balance.
      </>
    ),
    copy: "Plan your formula, calculate your batch and bring the details together.",
    link: "/formulation-tools",
    action: "Open formulation tools",
    image: "/assets/gel-sculpture.webp",
    alt: "A sculptural blue and gold liquid ribbon",
  },
  {
    id: "create",
    label: "Create",
    eyebrow: "Your next possibility",
    title: (
      <>
        Make it
        <br />
        your own.
      </>
    ),
    copy: "Explore custom formulation, blending, testing and private label services.",
    link: "/services",
    action: "Explore services",
    image: "/assets/services-sculpture.webp",
    alt: "Glossy blue laboratory glass, flowing liquid and molecules",
  },
];

export default function SidewaysScene() {
  const track = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!track.current || !canvas.current) return;
    return createSidewaysMotion(track.current, canvas.current);
  }, []);
  return (
    <section
      ref={track}
      className="s-journey"
      id="cocojojo-sideways"
      aria-label="From ingredients to your next creation"
    >
      <div className="s-stage">
        <div className="s-atmosphere" aria-hidden="true" />
        <canvas ref={canvas} className="s-particle-stream" aria-hidden="true" />
        <div className="s-topline">
          <span className="cj-brand-surface">
            <BrandLogo />
          </span>
          <p>Keep scrolling. Keep creating.</p>
        </div>
        <div className="s-panels">
          {scenes.map((scene, i) => (
            <article
              className={`s-panel s-panel-${scene.id}`}
              key={scene.id}
              id={`scene-${scene.id}`}
              aria-labelledby={`scene-title-${scene.id}`}
            >
              <figure className="s-art">
                <img
                  src={scene.image}
                  alt={scene.alt}
                  width={i === 1 ? 1280 : 1672}
                  height={i === 1 ? 1280 : 1000}
                  loading="lazy"
                />
              </figure>
              <div className="s-copy">
                <p className="s-eyebrow">
                  <span>0{i + 1}</span>
                  {scene.eyebrow}
                </p>
                <h2 id={`scene-title-${scene.id}`}>{scene.title}</h2>
                <p className="s-description">{scene.copy}</p>
                <a className="s-action" href={scene.link}>
                  {scene.action}
                </a>
              </div>
              <span className="s-oversize" aria-hidden="true">
                {scene.label}
              </span>
            </article>
          ))}
        </div>
        <div className="s-controls" aria-label="Explore the three scenes">
          {scenes.map((scene, i) => (
            <button
              type="button"
              key={scene.id}
              data-scene={i}
              aria-controls={`scene-${scene.id}`}
              aria-label={`Show ${scene.label.toLowerCase()} scene`}
            >
              <span>0{i + 1}</span>
              {scene.label}
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
