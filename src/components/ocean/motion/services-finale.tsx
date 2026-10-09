"use client";
import { useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import BrandLogo from "./brand-logo";
import { createServicesFinaleMotion } from "./services-finale-motion";

const chapters = ["Discover", "Formulate", "Blend & test", "Look closer", "Create"];
export default function ServicesFinale() {
  const track = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!track.current || !canvas.current) return;
    return createServicesFinaleMotion(track.current, canvas.current);
  }, []);
  return (
    <section
      className="svcx-journey"
      id="services-possibilities"
      ref={track}
      aria-label="Five scenes from ingredients to your next formula"
    >
      <div className="svcx-stage">
        <div className="svcx-atmosphere" aria-hidden="true" />
        <div className="svcx-molecule-layer" aria-hidden="true">
          <canvas ref={canvas} />
        </div>
        <div className="svcx-top">
          <span>COCOJOJO / THE POSSIBILITIES</span>
          <div>
            <span className="svcx-scroll-hint">Scroll to explore</span>
            <button type="button" className="svcx-pause" aria-label="Pause services scene motion" aria-pressed="false">
              <Pause size={15} className="svcx-pause-icon" />
              <Play size={15} className="svcx-play-icon" />
            </button>
            <a href="#site-footer">Skip to footer</a>
          </div>
        </div>
        <div className="svcx-scenes">
          <article className="svcx-scene svcx-discover" id="services-scene-1" aria-labelledby="services-scene-title-1">
            <div className="svcx-copy">
              <p className="svcx-kicker">01 / A world of possibilities</p>
              <h2 id="services-scene-title-1">
                Your next
                <br />
                formula
                <br />
                <em>starts here.</em>
              </h2>
              <p>Find the right ingredient, compare the details and plan your next batch.</p>
            </div>
            <figure className="svcx-art">
              <img
                src="/assets/services-sculpture.webp"
                alt="Glossy blue glass, flowing liquid and molecular forms"
                width={1536}
                height={1024}
                loading="lazy"
              />
            </figure>
            <span className="svcx-ghost" aria-hidden="true">
              Possibility.
            </span>
          </article>
          <article className="svcx-scene svcx-formulate" id="services-scene-2" aria-labelledby="services-scene-title-2">
            <div className="svcx-copy">
              <p className="svcx-kicker">02 / Bring the idea into focus</p>
              <h2 id="services-scene-title-2">
                Find your
                <br />
                <em>perfect balance.</em>
              </h2>
              <p>Explore custom formulation, from your ingredient choices to your next development brief.</p>
              <a className="svcx-text-link" href="/services/formulation">
                Explore custom formulation
              </a>
            </div>
            <figure className="svcx-art">
              <img
                src="/assets/gel-sculpture.webp"
                alt="A glossy blue and gold liquid ring"
                width={1254}
                height={1254}
                loading="lazy"
              />
            </figure>
            <span className="svcx-ghost" aria-hidden="true">
              Formulate.
            </span>
          </article>
          <article className="svcx-scene svcx-connect" id="services-scene-3" aria-labelledby="services-scene-title-3">
            <h2 className="svcx-accessible" id="services-scene-title-3">
              Blending and testing, connected.
            </h2>
            <div className="svcx-column svcx-column-up">
              <div>
                <p className="svcx-kicker">03 / Bring it together</p>
                <h3>
                  Blend.
                  <br />
                  <em>Refine.</em>
                </h3>
                <a className="svcx-text-link" href="/services/custom-blending">
                  Custom blending
                </a>
              </div>
              <img
                src="/assets/gel-sculpture.webp"
                alt="Flowing blue and gold material"
                width={1254}
                height={1254}
                loading="lazy"
              />
            </div>
            <div className="svcx-column svcx-column-down">
              <img
                src="/assets/services-sculpture.webp"
                alt="Blue laboratory glass and molecules"
                width={1536}
                height={1024}
                loading="lazy"
              />
              <div>
                <p className="svcx-kicker">The details that matter</p>
                <h3>
                  Test.
                  <br />
                  <em>Understand.</em>
                </h3>
                <a className="svcx-text-link" href="/services/testing-analysis">
                  Testing & analysis
                </a>
              </div>
            </div>
          </article>
          <article className="svcx-scene svcx-closer" id="services-scene-4" aria-labelledby="services-scene-title-4">
            <img
              className="svcx-fallback-molecule"
              src="/assets/footer-blue-molecules.webp"
              alt="Glossy blue molecular structure"
              width={1564}
              height={1006}
              loading="lazy"
            />
            <div className="svcx-copy">
              <p className="svcx-kicker">04 / A closer look</p>
              <h2 id="services-scene-title-4">
                Small details.
                <br />
                <em>Big possibilities.</em>
              </h2>
              <p>Ingredients. Connections. Your next creation.</p>
            </div>
          </article>
          <article className="svcx-scene svcx-create" id="services-scene-5" aria-labelledby="services-scene-title-5">
            <figure className="svcx-art">
              <img src="/assets/footer-blue-molecules.webp" alt="" width={1564} height={1006} loading="lazy" />
            </figure>
            <div className="svcx-copy">
              <div className="svcx-brand">
                <BrandLogo />
              </div>
              <p className="svcx-kicker">05 / Make it yours</p>
              <h2 id="services-scene-title-5">
                Let’s create
                <br />
                <em>together.</em>
              </h2>
              <p>Find the right ingredient, compare the details and plan your next batch.</p>
              <div className="svcx-actions">
                <a href="/shop">Explore the shop</a>
                <a href="/contact">Ask an ingredient question</a>
              </div>
            </div>
          </article>
        </div>
        <nav className="svcx-chapters" aria-label="Services animation scenes">
          {chapters.map((name, i) => (
            <button
              key={name}
              type="button"
              data-services-scene={i}
              aria-controls={"services-scene-" + (i + 1)}
              aria-label={"Show scene " + (i + 1) + ": " + name}
            >
              <span>0{i + 1}</span>
              <strong>{name}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
