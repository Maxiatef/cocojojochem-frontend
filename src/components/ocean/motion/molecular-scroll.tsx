"use client";

import { useEffect, useId, useRef } from "react";

type Variant = "bridge" | "thread" | "orbit";
type Atom = [number, number, number, number?];
type Graph = { x: number; y: number; scale: number; delay: number; atoms: Atom[]; bonds: [number, number][] };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const p = clamp(n);
  return p * p * (3 - 2 * p);
};

function GlossTube({ d, id, gold = false }: { d: string; id: string; gold?: boolean }) {
  const material = gold ? "gold" : "ice";
  return (
    <>
      <path className="molecular-tube-layer molecular-tube-shadow" d={d} pathLength={1} />
      <path
        className="molecular-tube-layer molecular-tube-edge"
        d={d}
        pathLength={1}
        stroke={"url(#" + id + "-" + material + "-edge)"}
      />
      <path
        className="molecular-tube-layer molecular-tube-body"
        data-centerline=""
        d={d}
        pathLength={1}
        stroke={"url(#" + id + "-" + material + "-tube)"}
      />
      <path
        className="molecular-tube-layer molecular-tube-reflection"
        d={d}
        pathLength={1}
        stroke={"url(#" + id + "-reflection)"}
      />
      <path className="molecular-tube-layer molecular-tube-glint" d={d} pathLength={1} />
    </>
  );
}

// Unlabeled molecular-inspired node-and-bond diagrams, not ingredient identities.
const graphs: Graph[] = [
  {
    x: 255,
    y: 183,
    scale: 0.9,
    delay: 0,
    atoms: [
      [-104, 20, 13],
      [-54, -25, 18],
      [8, 5, 25, 1],
      [66, -48, 15],
      [80, 68, 17],
      [-18, 82, 11],
      [-65, -88, 10],
    ],
    bonds: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [2, 5],
      [1, 6],
    ],
  },
  {
    x: 713,
    y: 151,
    scale: 1.05,
    delay: 0.1,
    atoms: [
      [0, -67, 17],
      [60, -33, 22],
      [60, 35, 16],
      [0, 69, 23, 1],
      [-60, 35, 16],
      [-60, -33, 21],
      [116, -70, 13],
      [172, -37, 18],
      [120, 71, 12],
      [-117, -70, 12],
    ],
    bonds: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [1, 6],
      [6, 7],
      [2, 8],
      [5, 9],
    ],
  },
  {
    x: 1195,
    y: 160,
    scale: 0.85,
    delay: 0.2,
    atoms: [
      [-86, 0, 14],
      [-36, -37, 21],
      [-36, 38, 17],
      [29, 74, 14],
      [88, 39, 22, 1],
      [87, -38, 16],
      [27, -73, 18],
      [-13, 118, 10],
      [145, 73, 12],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [1, 6],
      [6, 5],
      [5, 4],
      [4, 3],
      [3, 2],
      [2, 1],
      [3, 7],
      [4, 8],
    ],
  },
];
const configs = {
  bridge: {
    viewBox: "0 0 1440 330",
    paths: [
      "M -90 238 C 70 312 138 268 171 173 S 325 6 440 96 S 595 306 779 223 S 953 9 1129 84 S 1310 307 1520 149",
      "M -80 261 C 65 342 156 281 192 180 S 326 26 428 112 S 602 326 793 243 S 965 33 1120 103 S 1339 332 1532 174",
      "M -30 105 C 100 38 193 9 330 97 S 550 290 682 237 S 892 40 1038 98 S 1239 328 1480 229",
    ],
  },
  thread: {
    viewBox: "0 0 1440 1800",
    paths: [
      "M 1195 -70 C 1190 40 1219 193 1095 268 S 624 293 705 495 S 939 662 1005 800 S 941 975 777 976 S 570 1105 710 1267 S 1250 1315 1265 1525 S 983 1706 1173 1850",
      "M 1216 -70 C 1213 42 1238 202 1112 285 S 655 316 724 492 S 965 662 1030 806 S 956 1001 789 1001 S 597 1102 735 1255 S 1277 1313 1293 1529 S 1006 1716 1200 1860",
    ],
  },
  orbit: {
    viewBox: "0 0 900 720",
    paths: [
      "M 954 -50 C 728 32 189 65 80 285 S 502 637 748 489 S 636 130 344 242 S 72 640 632 754",
      "M 988 -40 C 747 56 220 84 112 288 S 509 609 733 472 S 626 160 361 265 S 122 630 666 774",
      "M 969 196 C 767 -27 394 -34 218 87 S 269 462 510 394 S 838 259 896 750",
    ],
  },
};

export default function MolecularScroll({ variant = "bridge" }: { variant?: Variant }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = "molecular-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const config = configs[variant];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = el.closest<HTMLElement>(".lusion-home-shell");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const groups = Array.from(el.querySelectorAll<SVGGElement>("[data-graph]")).map((group) => ({
      group,
      delay: Number(group.dataset.delay || 0),
      nodes: Array.from(group.querySelectorAll<SVGGElement>("[data-atom]")).map((node, index) => ({
        node,
        x: Number(node.dataset.x),
        y: Number(node.dataset.y),
        z: Math.sin((index + 1) * 1.9) * 24,
        dx: Math.cos(index * 2.399) * 95,
        dy: Math.sin(index * 2.399) * 85,
      })),
      bonds: Array.from(group.querySelectorAll<SVGGElement>("[data-bond]")).map((bond) => ({
        bond,
        layers: Array.from(bond.querySelectorAll<SVGPathElement>("path")),
      })),
    }));
    const paths = Array.from(el.querySelectorAll<SVGGElement>("[data-trail]")).map((group, index) => {
      const path = group.querySelector<SVGPathElement>("[data-centerline]")!;
      return {
        group,
        path,
        index,
        length: path.getTotalLength(),
        dot: el.querySelector<SVGCircleElement>(`[data-tracer="${index}"]`),
      };
    });
    let paused = root?.dataset.motion === "paused",
      visible = false,
      frame = 0,
      target = 1,
      current = 1,
      last = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      },
      { rootMargin: "120px" },
    );
    function paint(progress: number) {
      el!.style.setProperty("--formation", progress.toFixed(4));
      groups.forEach(({ group, delay, nodes, bonds }) => {
        const assembly = smooth((progress - delay) / 0.68);
        group.style.opacity = String(0.2 + 0.8 * smooth(progress * 3));
        const turn = (progress - 0.5) * 0.2;
        const positions = nodes.map(({ node, x, y, z, dx, dy }) => {
          const perspective = 440 / (440 - z);
          const px = (x * Math.cos(turn) + z * Math.sin(turn)) * perspective + dx * (1 - assembly);
          const py = (y * Math.cos(turn * 0.6) - z * Math.sin(turn * 0.6)) * perspective + dy * (1 - assembly);
          node.setAttribute(
            "transform",
            `translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${((0.6 + 0.4 * assembly) * perspective).toFixed(3)})`,
          );
          return [px, py];
        });
        bonds.forEach(({ bond, layers }, i) => {
          const a = positions[Number(bond.dataset.a)],
            b = positions[Number(bond.dataset.b)];
          layers.forEach((path) => path.setAttribute("d", `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`));
          const draw = smooth((progress - delay - 0.1 - i * 0.018) / 0.55);
          bond.style.setProperty("--tube-dash", (1 - draw).toFixed(4));
          bond.style.opacity = String(0.2 + 0.8 * draw);
        });
      });
      paths.forEach(({ group, path, index, length, dot }) => {
        const draw = clamp((progress - index * 0.06) / (0.95 - index * 0.05));
        group.style.setProperty("--tube-dash", (1 - draw).toFixed(4));
        if (dot) {
          const p = path.getPointAtLength(draw * length);
          dot.setAttribute("cx", String(p.x));
          dot.setAttribute("cy", String(p.y));
          dot.style.opacity = draw > 0.015 && draw < 0.995 ? "1" : "0";
        }
      });
    }
    function measure() {
      const b = el!.getBoundingClientRect(),
        vh = window.innerHeight;
      // Long trails follow the whole shelf; compact assemblies finish near mid-screen.
      const distance = variant === "thread" ? b.height + vh * 0.3 : vh * 0.62;
      target = clamp((vh * 0.92 - b.top) / Math.max(distance, 1));
    }
    function render(time: number) {
      frame = 0;
      if (paused || media.matches || document.hidden || !visible) return;
      const dt = Math.min((time - last) / 16.67 || 1, 3);
      last = time;
      current += (target - current) * (1 - Math.pow(0.79, dt));
      if (Math.abs(target - current) < 0.0004) current = target;
      paint(current);
      if (current !== target) frame = requestAnimationFrame(render);
    }
    function schedule() {
      if (paused || media.matches || document.hidden) return;
      measure();
      if (visible && !frame) {
        last = 0;
        frame = requestAnimationFrame(render);
      }
    }
    function preference() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (media.matches) {
        current = target = 1;
        paint(1);
      } else {
        paused = root?.dataset.motion === "paused";
        schedule();
      }
    }
    function motion(e: Event) {
      paused = (e as CustomEvent<{ paused: boolean }>).detail.paused;
      if (paused) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    }
    measure();
    current = media.matches || paused ? 1 : target;
    paint(current);
    observer.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("cj-motion-change", motion);
    media.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("cj-motion-change", motion);
      media.removeEventListener("change", preference);
    };
  }, [variant]);

  return (
    <div ref={ref} className={"molecular-scroll molecular-" + variant} aria-hidden="true">
      <svg
        viewBox={config.viewBox}
        preserveAspectRatio={variant === "thread" ? "none" : "xMidYMid meet"}
        focusable="false"
      >
        <defs>
          <linearGradient id={id + "-ice-edge"} gradientUnits="userSpaceOnUse" x1="-150" y1="-100" x2="1440" y2="720">
            <stop stopColor="#31556e" />
            <stop offset=".34" stopColor="#86b7d1" />
            <stop offset=".6" stopColor="#264e69" />
            <stop offset="1" stopColor="#abcfe0" />
          </linearGradient>
          <linearGradient id={id + "-ice-tube"} gradientUnits="userSpaceOnUse" x1="-150" y1="-100" x2="1440" y2="720">
            <stop stopColor="#c7e8f6" />
            <stop offset=".18" stopColor="#73a9c6" />
            <stop offset=".35" stopColor="#effcff" />
            <stop offset=".5" stopColor="#8bbbd2" />
            <stop offset=".69" stopColor="#e9f9ff" />
            <stop offset=".84" stopColor="#77abc8" />
            <stop offset="1" stopColor="#d8f0fa" />
          </linearGradient>
          <linearGradient id={id + "-gold-edge"} gradientUnits="userSpaceOnUse" x1="-150" y1="-100" x2="1440" y2="720">
            <stop stopColor="#95600e" />
            <stop offset=".4" stopColor="#d8ab42" />
            <stop offset=".7" stopColor="#9b6818" />
            <stop offset="1" stopColor="#d3aa52" />
          </linearGradient>
          <linearGradient id={id + "-gold-tube"} gradientUnits="userSpaceOnUse" x1="-150" y1="-100" x2="1440" y2="720">
            <stop stopColor="#e8ba55" />
            <stop offset=".25" stopColor="#fff3c5" />
            <stop offset=".42" stopColor="#d69f2c" />
            <stop offset=".6" stopColor="#ffe9a2" />
            <stop offset=".85" stopColor="#d5a242" />
            <stop offset="1" stopColor="#fff0b6" />
          </linearGradient>
          <linearGradient id={id + "-reflection"} gradientUnits="userSpaceOnUse" x1="-150" y1="-100" x2="1440" y2="720">
            <stop stopColor="#fff" />
            <stop offset=".2" stopColor="#fff" stopOpacity=".28" />
            <stop offset=".36" stopColor="#fff" />
            <stop offset=".55" stopColor="#fff" stopOpacity=".4" />
            <stop offset=".72" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity=".45" />
          </linearGradient>
          <radialGradient id={id + "-atom"} cx="31%" cy="23%" r="81%">
            <stop stopColor="#fff" />
            <stop offset=".15" stopColor="#e7f8ff" />
            <stop offset=".36" stopColor="#b9dcec" />
            <stop offset=".57" stopColor="#6394b2" />
            <stop offset=".73" stopColor="#315b78" />
            <stop offset=".86" stopColor="#9ccbdd" />
            <stop offset=".94" stopColor="#d9f4ff" />
            <stop offset="1" stopColor="#4d7793" />
          </radialGradient>
          <radialGradient id={id + "-gold"} cx="30%" cy="22%" r="81%">
            <stop stopColor="#fffde6" />
            <stop offset=".14" stopColor="#fff3bc" />
            <stop offset=".37" stopColor="#f3d269" />
            <stop offset=".6" stopColor="#bd8820" />
            <stop offset=".75" stopColor="#855414" />
            <stop offset=".86" stopColor="#edc65b" />
            <stop offset=".96" stopColor="#fff1b0" />
            <stop offset="1" stopColor="#bd9038" />
          </radialGradient>
          <linearGradient id={id + "-rim"} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff" />
            <stop offset=".48" stopColor="#fff" stopOpacity="0" />
            <stop offset=".76" stopColor="#c6edff" stopOpacity=".7" />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
          <radialGradient id={id + "-shadow"}>
            <stop stopColor="#16384b" stopOpacity=".3" />
            <stop offset="1" stopColor="#16384b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="molecular-trails" fill="none" strokeLinecap="round">
          {config.paths.map((d, i) => (
            <g key={i} data-trail={i} className={"molecular-trail molecular-trail-" + i}>
              <GlossTube d={d} id={id} gold={i === 1} />
            </g>
          ))}
        </g>
        {config.paths.slice(0, 1).map((_, i) => (
          <circle
            key={i}
            data-tracer={i}
            className="molecular-tracer"
            r={variant === "bridge" ? 6 : 4}
            fill={"url(#" + id + "-atom)"}
            opacity={0}
          />
        ))}
        {variant === "bridge" &&
          graphs.map((graph, i) => (
            <g
              key={i}
              className={"molecular-diagram molecular-diagram-" + i}
              transform={`translate(${graph.x} ${graph.y}) scale(${graph.scale})`}
            >
              <g data-graph={i} data-delay={graph.delay}>
                <g className="molecular-bonds" fill="none" strokeLinecap="round">
                  {graph.bonds.map(([a, b], j) => (
                    <g key={j} data-bond={j} data-a={a} data-b={b}>
                      <GlossTube
                        id={id}
                        d={`M ${graph.atoms[a][0]} ${graph.atoms[a][1]} L ${graph.atoms[b][0]} ${graph.atoms[b][1]}`}
                      />
                    </g>
                  ))}
                </g>
                {graph.atoms.map(([x, y, r, gold], j) => (
                  <g key={j} data-atom={j} data-x={x} data-y={y} transform={`translate(${x} ${y})`}>
                    <ellipse cx={r * 0.35} cy={r * 1.18} rx={r * 1.23} ry={r * 0.42} fill={"url(#" + id + "-shadow)"} />
                    <circle r={r} fill={"url(#" + id + (gold ? "-gold" : "-atom") + ")"} />
                    <circle r={r - 0.7} fill="none" stroke={"url(#" + id + "-rim)"} strokeWidth={1.4} />
                    <ellipse
                      cx={-r * 0.26}
                      cy={-r * 0.42}
                      rx={r * 0.5}
                      ry={r * 0.2}
                      transform="rotate(-24)"
                      fill="#fff"
                      opacity={0.8}
                    />
                    <ellipse
                      cx={r * 0.09}
                      cy={r * 0.63}
                      rx={r * 0.54}
                      ry={r * 0.105}
                      transform="rotate(-20)"
                      fill={gold ? "#fff0bc" : "#e5f9ff"}
                      opacity={0.68}
                    />
                    <circle cx={r * 0.42} cy={-r * 0.23} r={r * 0.105} fill="#fff" opacity={0.94} />
                    {!gold && j % 3 === 0 && (
                      <circle cx={r * 0.22} cy={r * 0.19} r={r * 0.19} fill={"url(#" + id + "-gold)"} />
                    )}
                  </g>
                ))}
              </g>
            </g>
          ))}
      </svg>
    </div>
  );
}
