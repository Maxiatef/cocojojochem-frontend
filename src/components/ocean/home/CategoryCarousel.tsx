"use client";

import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Pause, Play } from "lucide-react";

type Category = { id: string; label: string; image: string; href?: string };

export default function CategoryCarousel({ categories }: { categories: Category[] }) {
  const [viewport, carousel] = useEmblaCarousel({ loop: true, align: "start", duration: 48, watchFocus: true });
  const [playing, setPlaying] = useState(false);
  const [globalPaused, setGlobalPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [position, setPosition] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      setPlaying(!media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = (e: Event) => setGlobalPaused((e as CustomEvent<{ paused: boolean }>).detail.paused);
    setGlobalPaused(document.querySelector(".lusion-home-shell")?.getAttribute("data-motion") === "paused");
    window.addEventListener("cj-motion-change", update);
    return () => window.removeEventListener("cj-motion-change", update);
  }, []);

  useEffect(() => {
    if (!section.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!carousel) return;
    const select = () => setPosition(carousel.selectedScrollSnap());
    const stop = () => setPlaying(false);
    select();
    carousel.on("select", select).on("reInit", select).on("pointerDown", stop);
    return () => {
      carousel.off("select", select).off("reInit", select).off("pointerDown", stop);
    };
  }, [carousel]);

  useEffect(() => {
    if (!carousel || !playing || hovered || !visible || reducedMotion || globalPaused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) carousel.scrollNext();
    }, 2800);
    return () => window.clearInterval(timer);
  }, [carousel, playing, hovered, visible, reducedMotion, globalPaused]);

  function move(direction: "previous" | "next") {
    if (!carousel) return;
    setPlaying(false);
    direction === "next" ? carousel.scrollNext(reducedMotion) : carousel.scrollPrev(reducedMotion);
    const index = carousel.selectedScrollSnap();
    setAnnouncement(`${categories[index].label}, category ${index + 1} of ${categories.length}`);
  }

  return (
    <section
      className="r-wrap r-category-carousel"
      ref={section}
      aria-label="Shop ingredient categories"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={(e) => {
        if (!(e.target as HTMLElement).closest("[data-rotation-control]")) setPlaying(false);
      }}
    >
      <div className="r-category-carousel-controls">
        <a className="r-text-link" href="/categories">
          Explore all {categories.length} categories
        </a>
        <div className="r-category-carousel-buttons">
          <span className="r-category-position" aria-hidden="true">
            {String(position + 1).padStart(2, "0")} <span>/ {categories.length}</span>
          </span>
          {!reducedMotion && (
            <button
              type="button"
              data-rotation-control
              aria-controls="ingredient-category-slides"
              aria-label={playing ? "Pause category rotation" : "Start category rotation"}
              onClick={() => setPlaying((value) => !value)}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
              <span>{playing ? "Pause" : "Play"}</span>
            </button>
          )}
          <button
            type="button"
            aria-label="Previous categories"
            aria-controls="ingredient-category-slides"
            onClick={() => move("previous")}
          >
            Previous
          </button>
          <button
            type="button"
            aria-label="Next categories"
            aria-controls="ingredient-category-slides"
            onClick={() => move("next")}
          >
            Next
          </button>
        </div>
      </div>
      <div className="r-category-carousel-viewport" ref={viewport} id="ingredient-category-slides">
        <div className="r-category-carousel-track">
          {categories.map((category, index) => (
            <div
              className="r-category-carousel-slide"
              key={category.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${categories.length}`}
            >
              <a className="r-category-card" href={category.href || "/products?category=" + category.id}>
                <img
                  src={category.image}
                  alt={category.label + " representative image"}
                  width={430}
                  height={420}
                  loading="lazy"
                  draggable={false}
                />
                <div>
                  <h2>{category.label}</h2>
                  <span>Discover the collection</span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
      <p className="r-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
