import type { CSSProperties } from "react";
import BrandLogo from "./brand-logo";

// Windows into the supplied artwork. Each part lands in its original position.
const pieces = [
  { x: 0, y: 0, w: 27, h: 39, dx: -290, dy: -100, turn: -14, delay: 110 },
  { x: 27, y: 0, w: 26, h: 39, dx: -100, dy: 150, turn: 11, delay: 195 },
  { x: 53, y: 0, w: 23, h: 39, dx: 110, dy: -150, turn: -11, delay: 280 },
  { x: 76, y: 0, w: 24, h: 39, dx: 290, dy: 100, turn: 14, delay: 365 },
  { x: 0, y: 39, w: 100, h: 20, dx: 0, dy: 150, turn: 0, delay: 430 },
  { x: 0, y: 59, w: 100, h: 14, dx: 0, dy: 95, turn: 0, delay: 550 },
  ...[0, 38, 43.5, 49, 54.5, 60, 65.5].map((x, i) => ({
    x,
    y: 73,
    w: [38, 43.5, 49, 54.5, 60, 65.5, 100][i] - x,
    h: 27,
    dx: (3 - i) * 95,
    dy: -170 - i * 12,
    turn: (i % 2 ? 1 : -1) * 24,
    delay: 420 + i * 55,
  })),
];

export default function LogoAssembly({ variant = "entry" }: { variant?: "entry" | "footer" }) {
  const prefix = "cj-" + variant;
  return (
    <div className={prefix + "-assembly"}>
      <BrandLogo
        className={prefix + "-assembled"}
        decorative
        {...({ fetchpriority: variant === "entry" ? "high" : "auto" } as object)}
        decoding="async"
      />
      <div className={prefix + "-logo-pieces"}>
        {pieces.map((piece, i) => (
          <span
            key={i}
            className={prefix + "-piece"}
            style={
              {
                left: piece.x + "%",
                top: piece.y + "%",
                width: piece.w + "%",
                height: piece.h + "%",
                "--piece-x": variant === "footer" ? `calc(var(--footer-piece-unit) * ${piece.dx})` : piece.dx + "px",
                "--piece-y": variant === "footer" ? `calc(var(--footer-piece-unit) * ${piece.dy})` : piece.dy + "px",
                "--piece-turn": piece.turn + "deg",
                "--piece-delay": piece.delay + "ms",
              } as CSSProperties
            }
          >
            <span className={prefix + "-piece-window"}>
              <BrandLogo
                decorative
                decoding="async"
                style={{
                  width: 10000 / piece.w + "%",
                  maxWidth: "none",
                  height: "auto",
                  left: (-100 * piece.x) / piece.w + "%",
                  top: (-100 * piece.y) / piece.h + "%",
                }}
              />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
