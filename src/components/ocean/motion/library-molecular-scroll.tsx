"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./library-molecular-scroll.module.css";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const p = clamp(n);
  return p * p * (3 - 2 * p);
};
type Atom = [number, number, number];
type Pose = [number, number, number, number];

// Abstract node-and-bond diagrams, not representations of a specific ingredient.
const atoms: Atom[] = [
  [0, 0, 29],
  [79, -55, 22],
  [148, -5, 17],
  [108, 88, 26],
  [13, 115, 17],
  [-81, 72, 23],
  [-119, -25, 17],
  [-40, -98, 23],
  [34, -165, 14],
];
const bonds = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [7, 8],
  [0, 3],
  [0, 5],
];
const poses: Pose[][] = [
  [
    [80, 480, 1.05, -25],
    [210, 220, 1.45, 25],
    [1220, 590, 1.9, 95],
    [1260, 210, 1.25, 175],
    [1060, 840, 2.3, 260],
    [160, 510, 2.7, 335],
  ],
  [
    [1390, 830, 1.1, 30],
    [1290, 560, 1.7, 80],
    [80, 290, 1.6, 150],
    [270, 760, 2, 215],
    [180, 340, 1.5, 280],
    [1310, 310, 2.4, 350],
  ],
  [
    [640, 1100, 0.65, 0],
    [700, 800, 0.9, -55],
    [620, 150, 1, -110],
    [1050, 710, 0.8, -170],
    [510, 250, 1.1, -235],
    [800, 780, 1.2, -300],
  ],
];
const trails = [
  "M -160 250 C 140 40 395 590 685 355 S 1125 40 1580 580",
  "M -100 870 C 270 1100 180 120 540 420 S 1190 1090 1520 680",
  "M 1080 -120 C 1660 290 630 285 925 640 S 430 1000 90 1120",
];

function Tube({ d, id, gold = false }: { d: string; id: string; gold?: boolean }) {
  return (
    <>
      <path d={d} className={styles.shadow} pathLength={1} />
      <path d={d} className={styles.edge} pathLength={1} stroke={gold ? "#b49650" : "#4382a3"} />
      <path d={d} className={styles.tube} pathLength={1} stroke={`url(#${id}-${gold ? "goldTube" : "blueTube"})`} />
      <path d={d} className={styles.shine} pathLength={1} />
    </>
  );
}

export function LibraryMolecularScroll({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const id = "library-molecule-" + useId().replace(/[^a-zA-Z0-9]/g, "");

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
    const narrow = window.matchMedia("(max-width: 850px)");
    const graphs = [...el.querySelectorAll<SVGGElement>("[data-library-graph]")].map((group) => ({
      group,
      nodes: [...group.querySelectorAll<SVGGElement>("[data-library-atom]")],
      bonds: [...group.querySelectorAll<SVGGElement>("[data-library-bond]")].map((bond) => [
        ...bond.querySelectorAll("path"),
      ]),
    }));
    const paths = [...el.querySelectorAll<SVGGElement>("[data-library-trail]")];
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
      el!.style.setProperty("--library-wash-x", `${35 + Math.sin(progress * Math.PI * 2) * 30}%`);
      el!.style.setProperty("--library-wash-y", `${30 + progress * 55}%`);
      const scene = Math.min(4, Math.floor(progress * 5));
      const mix = smooth(progress * 5 - scene);
      graphs.forEach(({ group, nodes, bonds: links }, index) => {
        const a = poses[index][scene],
          b = poses[index][scene + 1];
        const pose = a.map((value, i) => value + (b[i] - value) * mix);
        const assembly = staticScene
          ? 1
          : 0.12 + 0.88 * smooth(0.5 + 0.5 * Math.sin(progress * Math.PI * 6 - index * 0.9));
        const sceneX = narrow.matches ? 720 + (pose[0] - 720) * 0.42 : pose[0];
        const x = sceneX + currentX * (18 + index * 12);
        const y = pose[1] + currentY * (14 + index * 8);
        group.setAttribute(
          "transform",
          `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${pose[3].toFixed(2)}) scale(${pose[2].toFixed(3)})`,
        );
        const points = nodes.map((node, n) => {
          const [ax, ay] = atoms[n];
          const scatter = (1 - assembly) * 145;
          const depth = Math.sin(n * 1.8 + progress * 7) * 35;
          const perspective = 420 / (420 - depth);
          const px = ax * perspective + Math.cos(n * 2.4) * scatter;
          const py = ay * perspective + Math.sin(n * 2.4) * scatter;
          node.setAttribute(
            "transform",
            `translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${perspective.toFixed(3)})`,
          );
          return [px, py];
        });
        links.forEach((layers, n) => {
          const [a, b] = bonds[n];
          layers.forEach((path) =>
            path.setAttribute("d", `M ${points[a][0]} ${points[a][1]} L ${points[b][0]} ${points[b][1]}`),
          );
        });
        group.style.setProperty("--draw", String(1 - smooth((assembly - 0.1) / 0.7)));
      });
      paths.forEach((path, n) => {
        const draw = staticScene ? 1 : smooth(0.5 + 0.5 * Math.sin(progress * Math.PI * 4 - n * 0.85));
        path.style.setProperty("--draw", (1 - draw).toFixed(4));
        path.setAttribute(
          "transform",
          `translate(${(Math.sin(progress * 8 + n) * 115 + currentX * 20).toFixed(2)} ${(Math.cos(progress * 6 + n) * 110 + currentY * 16).toFixed(2)}) rotate(${(progress * (n % 2 ? -48 : 42)).toFixed(2)} 720 500)`,
        );
      });
    }

    function measure() {
      const rect = el!.getBoundingClientRect();
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
    <div ref={root} className={styles.experience} data-library-molecular-scroll="">
      <div className={styles.background} aria-hidden="true">
        <div className={styles.stage}>
          <div className={styles.wash} />
          <svg
            className={styles.diagram}
            viewBox="0 0 1440 1000"
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
          >
            <defs>
              <radialGradient id={id + "-blue"} cx="30%" cy="23%" r="80%">
                <stop stopColor="#fff" />
                <stop offset=".16" stopColor="#e3f8ff" />
                <stop offset=".38" stopColor="#8dceee" />
                <stop offset=".64" stopColor="#2d729d" />
                <stop offset=".79" stopColor="#0c466e" />
                <stop offset=".9" stopColor="#98ddf7" />
                <stop offset="1" stopColor="#407b9c" />
              </radialGradient>
              <radialGradient id={id + "-gold"} cx="30%" cy="22%" r="82%">
                <stop stopColor="#fffef0" />
                <stop offset=".25" stopColor="#fff1ba" />
                <stop offset=".55" stopColor="#d6ae58" />
                <stop offset=".75" stopColor="#926d31" />
                <stop offset=".9" stopColor="#ffe8a0" />
                <stop offset="1" stopColor="#c09d53" />
              </radialGradient>
              <linearGradient id={id + "-blueTube"} x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#225d7e" />
                <stop offset=".25" stopColor="#a8e2fc" />
                <stop offset=".4" stopColor="#f5ffff" />
                <stop offset=".58" stopColor="#4e98bf" />
                <stop offset=".8" stopColor="#c9f3ff" />
                <stop offset="1" stopColor="#1c5e86" />
              </linearGradient>
              <linearGradient id={id + "-goldTube"} x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#a58140" />
                <stop offset=".3" stopColor="#fff4cb" />
                <stop offset=".5" stopColor="#d8b45f" />
                <stop offset=".78" stopColor="#fff0bd" />
                <stop offset="1" stopColor="#b8924a" />
              </linearGradient>
            </defs>
            <g className={styles.trails}>
              {trails.map((d, i) => (
                <g key={d} data-library-trail={i}>
                  <Tube d={d} id={id} gold={i === 1} />
                </g>
              ))}
            </g>
            {poses.map((frames, i) => (
              <g
                key={i}
                className={styles.molecule}
                data-library-graph={i}
                transform={`translate(${frames[0][0]} ${frames[0][1]}) scale(${frames[0][2]})`}
              >
                <g className={styles.bonds}>
                  {bonds.map(([a, b], n) => (
                    <g key={n} data-library-bond={n}>
                      <Tube
                        id={id}
                        d={`M ${atoms[a][0]} ${atoms[a][1]} L ${atoms[b][0]} ${atoms[b][1]}`}
                        gold={i === 2}
                      />
                    </g>
                  ))}
                </g>
                {atoms.map(([x, y, r], n) => (
                  <g key={n} data-library-atom={n} transform={`translate(${x} ${y})`}>
                    <circle r={r} fill={`url(#${id}-${n === 0 || i === 2 ? "gold" : "blue"})`} />
                    <circle r={r - 0.8} fill="none" stroke="#dcf7ff" strokeWidth=".9" opacity=".65" />
                    <ellipse
                      cx={-r * 0.27}
                      cy={-r * 0.4}
                      rx={r * 0.44}
                      ry={r * 0.16}
                      transform="rotate(-24)"
                      fill="#fff"
                      opacity=".85"
                    />
                    <ellipse cx={r * 0.13} cy={r * 0.64} rx={r * 0.46} ry={r * 0.08} fill="#e1faff" opacity=".7" />
                  </g>
                ))}
              </g>
            ))}
          </svg>
          <div className={styles.readingLight} />
        </div>
      </div>
      <div className={styles.content}>{children}</div>
      <button
        className={styles.motionToggle}
        onClick={toggle}
        type="button"
        aria-label={playing ? "Pause library molecular motion" : "Play library molecular motion"}
      >
        {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
        <span>{playing ? "Pause motion" : "Play motion"}</span>
      </button>
    </div>
  );
}
