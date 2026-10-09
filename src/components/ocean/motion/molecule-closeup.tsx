"use client";
import BrandLogo from "./brand-logo";
import { useEffect, useRef } from "react";
import { createCloseupMotion } from "./molecule-closeup-motion";

export default function MoleculeCloseup() {
  const section = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!section.current || !canvas.current) return;
    return createCloseupMotion(section.current, canvas.current);
  }, []);
  return (
    <section ref={section} className="v-journey" id="cocojojo-closer" aria-label="A closer look at the possibilities">
      <div className="v-stage">
        <div className="v-depth" aria-hidden="true" />
        <canvas ref={canvas} className="v-molecules" aria-hidden="true" />
        <div className="v-topline">
          <span className="cj-brand-surface">
            <BrandLogo />
          </span>
          <p>A little closer. A new possibility.</p>
        </div>
        <article className="v-panel v-descend" aria-labelledby="v-detail-title">
          <div className="v-panel-grain" aria-hidden="true" />
          <img
            className="v-static-art"
            src="/assets/gel-sculpture.webp"
            alt=""
            width={1280}
            height={1280}
            loading="lazy"
          />
          <div className="v-panel-copy">
            <p>01 / The ingredients</p>
            <h2 id="v-detail-title">
              Look
              <br />
              closer.
            </h2>
            <span>Oils. Actives. Possibilities.</span>
          </div>
        </article>
        <article className="v-panel v-rise" aria-labelledby="v-connect-title">
          <img
            className="v-static-art"
            src="/assets/services-sculpture.webp"
            alt=""
            width={1536}
            height={1024}
            loading="lazy"
          />
          <div className="v-panel-copy">
            <p>02 / The connections</p>
            <h2 id="v-connect-title">
              Bring it
              <br />
              together.
            </h2>
            <span>Discover what your next formula can be.</span>
          </div>
        </article>
        <div className="v-closeup-caption" aria-hidden="true">
          <span>03 / The possibilities</span>
          <strong>
            Small beginnings.
            <br />
            Big possibilities.
          </strong>
        </div>
        <div className="v-last-copy">
          <span className="cj-brand-surface">
            <BrandLogo />
          </span>
          <h2>
            Your next formula
            <br />
            starts here.
          </h2>
          <a href="/shop">Explore the shop</a>
        </div>
        <div className="v-scene-nav" aria-label="Explore the molecular sequence">
          <button type="button" data-chapter="0">
            01 <span>Explore</span>
          </button>
          <button type="button" data-chapter="1">
            02 <span>Connect</span>
          </button>
          <button type="button" data-chapter="2">
            03 <span>Closer</span>
          </button>
        </div>
        <a className="v-skip" href="#site-footer">
          Continue to footer
        </a>
      </div>
    </section>
  );
}
