"use client";
import BrandLogo from "./brand-logo";

import { useEffect, useRef } from "react";
import { createFinaleParticles } from "./finale-particles";
import SidewaysScene from "./sideways-scene";
import MoleculeCloseup from "./molecule-closeup";

export default function InteractiveFinale() {
  const section = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!section.current || !canvas.current) return;
    return createFinaleParticles(section.current, canvas.current);
  }, []);
  return (
    <>
      <div className="f-finale-sequence">
        <section
          className="f-finale f-particle-finale"
          id="cocojojo-particle-studio"
          ref={section}
          aria-labelledby="finale-title"
        >
          <div className="f-scene-fallback" aria-hidden="true">
            <img src="/assets/footer-blue-molecules.webp" alt="" width={1564} height={1006} loading="lazy" />
          </div>
          <canvas className="f-particle-field" ref={canvas} aria-hidden="true" />
          <div className="f-scene-energy" aria-hidden="true">
            <i />
            <b />
          </div>
          <div className="f-finale-top">
            <div>
              <p className="f-finale-eyebrow">Your next formula starts here.</p>
              <p className="f-finale-invitation">Let’s create together.</p>
            </div>
            <span className="f-pointer-hint">
              <i aria-hidden="true" />
              Move your cursor.
              <br />
              Scroll to transform.
            </span>
          </div>
          <div className="f-scene-guides" aria-hidden="true">
            <span>+</span>
            <span>+</span>
            <span>+</span>
            <span>+</span>
            <span>+</span>
          </div>
          <div className="f-finale-copy">
            <h2 id="finale-title">
              <a href="/contact">
                <BrandLogo />
              </a>
            </h2>
            <div className="f-finale-bottom">
              <p className="f-finale-description">
                Find the right ingredient, compare the details and plan your next batch.
              </p>
              <div className="f-finale-actions">
                <a className="r-btn r-primary" href="/shop">
                  Explore the shop
                </a>
                <a className="r-btn r-outline" href="/contact">
                  Ask an ingredient question
                </a>
              </div>
            </div>
          </div>
          <a className="f-continue" href="#cocojojo-sideways">
            <span aria-hidden="true" />
            Continue to scroll
          </a>
        </section>
      </div>
      <SidewaysScene />
      <MoleculeCloseup />
    </>
  );
}
