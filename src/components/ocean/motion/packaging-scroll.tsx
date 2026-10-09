"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./packaging-scroll.module.css";

const MotionContext = createContext({ playing: false, toggle: () => {} });
export const usePackagingMotion = () => useContext(MotionContext);
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const p = clamp(n);
  return p * p * (3 - 2 * p);
};
type Pose = [number, number, number, number];

// Decorative packaging concepts. Actual catalog items keep their supplier photos.
const formats = [
  { src: "/assets/packaging/motion-pump-bottle.png", kind: "pump", size: "large" },
  { src: "/assets/packaging/motion-cream-jar.png", kind: "jar", size: "large" },
  { src: "/assets/packaging/motion-squeeze-tube.png", kind: "tube", size: "large" },
  { src: "/assets/packaging/motion-cream-jar.png", kind: "jar", size: "small" },
  { src: "/assets/packaging/motion-pump-bottle.png", kind: "pump", size: "small" },
  { src: "/assets/packaging/motion-squeeze-tube.png", kind: "tube", size: "small" },
];
const poses: Pose[][] = [
  [
    [80, 500, 1.1, -22],
    [250, 240, 1.25, 18],
    [1320, 530, 1.55, 45],
    [1150, 140, 1.05, -14],
    [1070, 820, 1.7, -38],
    [110, 510, 1.85, 24],
  ],
  [
    [1370, 810, 1.1, 15],
    [1250, 530, 1.4, -18],
    [80, 270, 1.6, 24],
    [240, 790, 1.5, 42],
    [170, 320, 1.15, -22],
    [1300, 420, 1.9, 12],
  ],
  [
    [1260, 150, 0.95, 30],
    [65, 840, 1.2, -28],
    [640, 790, 1.1, -55],
    [1280, 580, 1.6, 18],
    [720, 130, 1.3, 54],
    [270, 870, 1.55, -18],
  ],
  [
    [450, 900, 0.7, -26],
    [750, 140, 0.85, 20],
    [1350, 880, 0.8, 45],
    [660, 400, 0.7, 8],
    [60, 830, 1.1, -40],
    [950, 130, 0.8, 20],
  ],
  [
    [780, 100, 0.6, 24],
    [1410, 180, 0.75, -24],
    [720, 250, 0.7, 45],
    [70, 420, 0.9, -12],
    [1310, 770, 0.85, 35],
    [520, 290, 0.65, -32],
  ],
  [
    [70, 920, 0.65, 45],
    [930, 870, 0.8, -45],
    [150, 660, 0.8, 25],
    [730, 120, 0.75, 42],
    [1380, 190, 0.9, -35],
    [700, 820, 0.7, 12],
  ],
];

export function PackagingScroll({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPlaying(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const packages = [...el.querySelectorAll<HTMLDivElement>("[data-package-form]")];
    const stage = el.querySelector<HTMLElement>("[data-package-stage]")!;
    let stageWidth = stage.clientWidth,
      stageHeight = stage.clientHeight;
    let frame = 0,
      last = 0,
      visible = false;
    let target = Number(el.dataset.progress || 0),
      current = target;
    let pointerX = 0,
      pointerY = 0,
      currentX = 0,
      currentY = 0;

    function paint(progress: number, staticScene = false) {
      el!.dataset.progress = progress.toFixed(4);
      el!.style.setProperty("--pack-wash-x", `${35 + Math.sin(progress * Math.PI * 2) * 30}%`);
      el!.style.setProperty("--pack-wash-y", `${30 + progress * 55}%`);
      const scene = Math.min(4, Math.floor(progress * 5));
      const mix = smooth(progress * 5 - scene);
      packages.forEach((pack, index) => {
        const a = poses[index][scene],
          b = poses[index][scene + 1];
        const pose = a.map((value, i) => value + (b[i] - value) * mix);
        const arc = Math.sin(mix * Math.PI);
        const depth = index < 3 ? 1 : 0.55;
        const px = staticScene ? 0 : currentX * (22 + index * 5);
        const py = staticScene ? 0 : currentY * (18 + index * 4);
        const x = ((pose[0] + arc * (index % 2 ? 95 : -95)) / 1440) * stageWidth + px;
        const y = ((pose[1] + arc * (index % 2 ? -100 : 100)) / 1000) * stageHeight + py;
        const tiltX = staticScene ? 0 : Math.cos(progress * 7 + index) * 8;
        const tiltY = staticScene ? 0 : Math.sin(progress * 8 + index) * 14;
        pack.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${pose[3].toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(${pose[2].toFixed(3)})`;
        pack.style.opacity = String((0.62 + 0.16 * Math.sin(progress * Math.PI * 2 + index)) * depth);
      });
    }

    function measure() {
      const rect = el!.getBoundingClientRect();
      stageWidth = stage.clientWidth;
      stageHeight = stage.clientHeight;
      target = clamp((window.innerHeight * 0.2 - rect.top) / Math.max(1, rect.height - window.innerHeight * 0.65));
    }
    function render(time: number) {
      frame = 0;
      if (!playing || reduced.matches || !visible || document.hidden) return;
      const dt = Math.min((time - last) / 16.67 || 1, 3);
      last = time;
      const ease = 1 - Math.pow(0.8, dt);
      current += (target - current) * ease;
      currentX += (pointerX - currentX) * ease;
      currentY += (pointerY - currentY) * ease;
      paint(current);
      if (Math.abs(target - current) > 0.00005 || Math.abs(pointerX - currentX) + Math.abs(pointerY - currentY) > 0.002)
        frame = requestAnimationFrame(render);
    }
    function schedule() {
      measure();
      if (playing && !reduced.matches && visible && !document.hidden && !frame) {
        last = 0;
        frame = requestAnimationFrame(render);
      }
    }
    function pointer(event: PointerEvent) {
      if (!fine.matches || !playing) return;
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    }
    function resetPointer() {
      pointerX = pointerY = 0;
      schedule();
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      el.dataset.motionVisible = String(visible);
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    const resize = new ResizeObserver(schedule);
    observer.observe(el);
    resize.observe(el);
    measure();
    if (!el.dataset.progress) {
      current = target;
      paint(current, reduced.matches);
    }
    if (reduced.matches) paint(current, true);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    el.addEventListener("pointermove", pointer, { passive: true });
    el.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      el.removeEventListener("pointermove", pointer);
      el.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [playing]);

  const toggle = () => setPlaying((value) => !value);
  return (
    <MotionContext.Provider value={{ playing, toggle }}>
      <div ref={root} className={styles.experience}>
        <div className={styles.background} aria-hidden="true">
          <div className={styles.stage} data-package-stage="">
            <div className={styles.wash} />
            <div className={styles.packages}>
              {formats.map((format, i) => (
                <div
                  key={i}
                  data-package-form={format.kind}
                  data-size={format.size}
                  className={styles.package}
                  style={{
                    transform: `translate3d(${poses[i][0][0] / 14.4}vw, ${poses[i][0][1] / 10}vh, 0) translate(-50%, -50%) rotate(${poses[i][0][3]}deg) scale(${poses[i][0][2]})`,
                  }}
                >
                  <img src={format.src} alt="" width={1254} height={1254} draggable={false} decoding="async" />
                </div>
              ))}
            </div>
            <div className={styles.readingLight} />
          </div>
        </div>
        <div className={styles.content}>{children}</div>
        <button
          className={styles.motionToggle}
          onClick={toggle}
          type="button"
          aria-label={playing ? "Pause all packaging motion" : "Play packaging motion"}
        >
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          <span>{playing ? "Pause motion" : "Play motion"}</span>
        </button>
      </div>
    </MotionContext.Provider>
  );
}
