"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./packaging-visual.module.css";
import { usePackagingMotion } from "./packaging-scroll";

export function PackagingVisual() {
  const scene = useRef<HTMLElement>(null);
  const { playing, toggle } = usePackagingMotion();
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const syncVisibility = () => setVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    if (scene.current) observer.observe(scene.current);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  const running = playing && inView && visible;
  return (
    <figure
      ref={scene}
      className={styles.scene}
      aria-label="Animated cosmetic packaging concept"
      style={{ "--pk-play-state": running ? "running" : "paused" } as CSSProperties}
    >
      <div className={styles.artwork}>
        <div className={styles.camera}>
          <img
            className={styles.image}
            src="/assets/packaging/packaging-motion-hero.png"
            alt="Glass cosmetic jars and an airless pump bottle with glossy ocean-blue and chrome details"
            width={1254}
            height={1254}
            draggable={false}
          />
        </div>
        <div className={styles.light} aria-hidden="true" />
      </div>
      <div className={styles.topline}>
        <span className={styles.kicker}>Form. Finish. Possibility.</span>
        <button
          className={styles.control}
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause packaging animation" : "Play packaging animation"}
          title={playing ? "Pause animation" : "Play animation"}
        >
          {playing ? (
            <Pause size={17} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={17} fill="currentColor" aria-hidden="true" />
          )}
        </button>
      </div>
      <figcaption className={styles.caption}>
        <div>
          <span className={styles.brand}>Packaging / COCOJOJO</span>
          <span className={styles.note}>A closer look at possibility.</span>
        </div>
        <span className={styles.concept}>Packaging concept</span>
      </figcaption>
    </figure>
  );
}
