"use client";

import { useEffect, useRef } from "react";

type Dye = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  duration: number;
  tone: number;
  phase: number;
  stroke: number;
};
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/** Decorative glass currents and a dissipating cursor wake, without WebGL. */
export default function CategoryAtmosphere({ paused, className }: { paused: boolean; className: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pause = useRef(paused);
  const syncRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    pause.current = paused;
    syncRef.current?.();
  }, [paused]);
  useEffect(() => {
    const surface = canvas.current,
      root = surface?.closest<HTMLElement>("[data-cg-root]");
    if (!surface || !root) return;
    const context = surface.getContext("2d", { alpha: true });
    if (!context) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover:hover) and (pointer:fine)");
    let width = 0,
      height = 0,
      pixelRatio = 1,
      frame = 0,
      last = 0,
      visible = false,
      time = 0;
    let lastY = window.scrollY,
      lastScrollPaint = 0,
      stroke = 0;
    let pointer = { x: 0, y: 0, time: 0 },
      aim = { x: 0, y: 0 },
      drift = { x: 0, y: 0 };
    let dyes: Dye[] = [];
    const colors = ["57,111,205", "54,172,207", "111,139,225"];

    // Cache small reflective smoke sprites. No canvas filters or shadow blurs
    // are applied in the animation loop.
    const sprites = colors.map((color, index) => {
      const sprite = document.createElement("canvas");
      sprite.width = 256;
      sprite.height = 256;
      const ctx = sprite.getContext("2d");
      if (!ctx) return sprite;
      const cloud = ctx.createRadialGradient(110, 111, 6, 128, 128, 122);
      cloud.addColorStop(0, `rgba(${color},.42)`);
      cloud.addColorStop(0.38, `rgba(${color},.3)`);
      cloud.addColorStop(0.7, `rgba(${color},.11)`);
      cloud.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = cloud;
      ctx.fillRect(0, 0, 256, 256);
      const fold = new Path2D();
      fold.moveTo(24, 160);
      fold.bezierCurveTo(44, 48, 202, 37, 204, 119);
      fold.bezierCurveTo(206, 188, 92, 205, 81, 147);
      fold.bezierCurveTo(77, 117, 127, 91, 160, 119);
      const gloss = ctx.createLinearGradient(50, 45, 201, 196);
      gloss.addColorStop(0, `rgba(${color},0)`);
      gloss.addColorStop(0.3, `rgba(${color},.42)`);
      gloss.addColorStop(0.6, "rgba(219,248,255,.44)");
      gloss.addColorStop(1, `rgba(${color},0)`);
      ctx.lineCap = "round";
      ctx.strokeStyle = gloss;
      ctx.lineWidth = 27;
      ctx.stroke(fold);
      ctx.lineWidth = 9;
      ctx.globalAlpha = 0.6;
      ctx.stroke(fold);
      ctx.translate(-3, -5);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = index === 1 ? "rgba(247,255,255,.76)" : "rgba(220,244,255,.72)";
      ctx.globalAlpha = 0.64;
      ctx.stroke(fold);
      return sprite;
    });

    function capacity() {
      return width < 700 || !fine.matches ? 30 : 52;
    }
    function blocked() {
      return pause.current || reduce.matches || document.hidden || !visible || !width || !height;
    }
    function currentPath(index: number, offset = 0) {
      const path = new Path2D();
      const wave = reduce.matches ? 0 : Math.sin(time * 0.34 + index * 1.9);
      const x = drift.x * width * 0.075,
        y = drift.y * height * 0.075;
      if (index === 0) {
        path.moveTo(-width * 0.13, height * 0.29 + offset);
        path.bezierCurveTo(
          width * 0.22 + x,
          height * (-0.04 + wave * 0.055) + y + offset,
          width * 0.55 - x,
          height * (0.93 - wave * 0.045) + offset,
          width * 1.13,
          height * 0.42 + offset,
        );
      } else if (index === 1) {
        path.moveTo(-width * 0.12, height * 0.86 + offset);
        path.bezierCurveTo(
          width * 0.32 - x,
          height * (1.13 - wave * 0.05) + offset,
          width * 0.49 + x,
          height * (0.05 + wave * 0.06) + y + offset,
          width * 1.12,
          height * 0.63 + offset,
        );
      } else {
        path.moveTo(width * 0.57, -height * 0.14 + offset);
        path.bezierCurveTo(
          width * (1.02 + wave * 0.04) + x,
          height * 0.23 + offset,
          width * 0.3 - x,
          height * 0.59 + y + offset,
          width * 0.84,
          height * 1.12 + offset,
        );
      }
      return path;
    }
    function drawCurrents() {
      const thickness = clamp(Math.min(width, height) * 0.115, 58, 112);
      for (let i = 0; i < 3; i++) {
        const path = currentPath(i),
          color = colors[i];
        const glass = context!.createLinearGradient(0, height * 0.1, width, height * 0.8);
        glass.addColorStop(0, `rgba(${color},0)`);
        glass.addColorStop(0.18, `rgba(${color},.14)`);
        glass.addColorStop(0.45, `rgba(${color},.29)`);
        glass.addColorStop(0.68, "rgba(111,211,236,.2)");
        glass.addColorStop(1, `rgba(${color},0)`);
        context!.strokeStyle = glass;
        context!.lineCap = "round";
        context!.globalAlpha = i === 2 ? 0.64 : 1;
        context!.lineWidth = thickness;
        context!.stroke(path);
        context!.lineWidth = thickness * 0.62;
        context!.globalAlpha = i === 2 ? 0.34 : 0.5;
        context!.stroke(path);
        // Pale cores and offset rims give each broad current a glass cross-section.
        context!.strokeStyle = "rgba(233,253,255,.3)";
        context!.lineWidth = thickness * 0.3;
        context!.globalAlpha = 0.75;
        context!.stroke(currentPath(i, -thickness * 0.12));
        context!.strokeStyle = "rgba(255,255,255,.7)";
        context!.lineWidth = 1.5;
        context!.globalAlpha = i === 2 ? 0.3 : 0.65;
        context!.stroke(currentPath(i, -thickness * 0.32));
        context!.strokeStyle = `rgba(${color},.22)`;
        context!.lineWidth = 1;
        context!.globalAlpha = 0.6;
        context!.stroke(currentPath(i, thickness * 0.35));
      }
      context!.globalAlpha = 1;
    }
    function drawWakes() {
      // Adjacent samples form a continuous liquid stroke instead of a line of dots.
      for (let i = 1; i < dyes.length; i++) {
        const a = dyes[i - 1],
          b = dyes[i];
        if (a.stroke !== b.stroke || Math.hypot(b.x - a.x, b.y - a.y) > 170) continue;
        const life = Math.min(a.life, b.life),
          radius = (a.radius + b.radius) * 0.5;
        const bend = Math.sin(time * 1.3 + b.phase) * (1 - life) * radius * 0.8;
        const dx = b.x - a.x,
          dy = b.y - a.y,
          length = Math.max(1, Math.hypot(dx, dy));
        const path = new Path2D();
        path.moveTo(a.x, a.y);
        path.quadraticCurveTo(
          (a.x + b.x) * 0.5 - (dy / length) * bend,
          (a.y + b.y) * 0.5 + (dx / length) * bend,
          b.x,
          b.y,
        );
        context!.lineCap = "round";
        context!.globalAlpha = life * 0.16;
        context!.strokeStyle = `rgb(${colors[b.tone]})`;
        context!.lineWidth = radius * 0.83;
        context!.stroke(path);
        context!.globalAlpha = life * 0.24;
        context!.strokeStyle = "rgb(206,243,253)";
        context!.lineWidth = radius * 0.28;
        context!.stroke(path);
      }
      for (const d of dyes) {
        const speed = Math.hypot(d.vx, d.vy);
        context!.save();
        context!.globalAlpha = Math.pow(Math.max(0, d.life), 0.8) * 0.68;
        context!.translate(d.x, d.y);
        context!.rotate(Math.atan2(d.vy, d.vx) + Math.sin(time * 0.7 + d.phase) * 0.55 + (1 - d.life) * 1.3);
        context!.scale(1 + Math.min(0.7, speed / 250), 0.83);
        context!.drawImage(sprites[d.tone], -d.radius, -d.radius, d.radius * 2, d.radius * 2);
        context!.restore();
      }
      context!.globalAlpha = 1;
    }
    function draw(dt = 0) {
      if (!width || !height) return;
      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context!.clearRect(0, 0, width, height);
      time += dt;
      const follow = 1 - Math.exp(-dt * 3.5);
      drift.x += (aim.x - drift.x) * follow;
      drift.y += (aim.y - drift.y) * follow;
      for (const d of dyes) {
        if (!dt) continue;
        const curl = Math.sin(d.x * 0.008 + d.y * 0.004 + time * 0.95 + d.phase) * 1.15;
        const vx = d.vx;
        d.vx += (d.vy * curl - vx * 0.46) * dt;
        d.vy += (-vx * curl - d.vy * 0.46 - 4) * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.radius += dt * 13;
        d.life -= dt / d.duration;
      }
      dyes = dyes.filter((d) => d.life > 0 && d.x > -280 && d.x < width + 280 && d.y > -280 && d.y < height + 280);
      drawCurrents();
      drawWakes();
    }
    function render(stamp: number) {
      frame = 0;
      if (blocked()) return;
      const interval = 1000 / (width < 700 || !fine.matches ? 24 : 36);
      if (last && stamp - last < interval) {
        frame = requestAnimationFrame(render);
        return;
      }
      const dt = Math.min(0.065, last ? (stamp - last) / 1000 : interval / 1000);
      last = stamp;
      draw(dt);
      frame = requestAnimationFrame(render);
    }
    function start() {
      if (!frame && !blocked()) {
        last = 0;
        frame = requestAnimationFrame(render);
      }
    }
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      pointer.time = 0;
      stroke++;
      lastY = window.scrollY;
      lastScrollPaint = performance.now();
      aim = { x: 0, y: 0 };
      if (reduce.matches) {
        dyes = [];
        drift = { x: 0, y: 0 };
        draw();
      }
      if (!blocked()) start();
    }
    function measure() {
      const nextWidth = surface!.clientWidth,
        nextHeight = surface!.clientHeight;
      if (!nextWidth || !nextHeight) {
        width = 0;
        height = 0;
        sync();
        return;
      }
      // Cap the backing store at 1.5M pixels even on large or retina displays.
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(1_500_000 / (nextWidth * nextHeight)));
      const pixelsWide = Math.max(1, Math.round(nextWidth * ratio)),
        pixelsHigh = Math.max(1, Math.round(nextHeight * ratio));
      if (
        width === nextWidth &&
        height === nextHeight &&
        surface!.width === pixelsWide &&
        surface!.height === pixelsHigh
      )
        return;
      width = nextWidth;
      height = nextHeight;
      pixelRatio = ratio;
      surface!.width = pixelsWide;
      surface!.height = pixelsHigh;
      dyes = [];
      pointer.time = 0;
      stroke++;
      lastY = window.scrollY;
      draw();
      start();
    }
    function addDye(x: number, y: number, vx: number, vy: number, radius: number, tone: number, id: number) {
      dyes.push({
        x,
        y,
        vx,
        vy,
        radius,
        life: 1,
        duration: 2.15 + radius * 0.007,
        tone,
        phase: time * 1.7 + x * 0.004,
        stroke: id,
      });
      if (dyes.length > capacity()) dyes.splice(0, dyes.length - capacity());
    }
    function point(event: PointerEvent) {
      if (blocked() || !fine.matches || event.pointerType !== "mouse") return;
      const rect = surface!.getBoundingClientRect();
      if (
        !rect.width ||
        !rect.height ||
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        leave();
        return;
      }
      const now = performance.now();
      const x = ((event.clientX - rect.left) * width) / rect.width,
        y = ((event.clientY - rect.top) * height) / rect.height;
      aim = { x: (x / width) * 2 - 1, y: (y / height) * 2 - 1 };
      if (pointer.time && now - pointer.time < 22) return;
      if (now - pointer.time > 140) pointer.time = 0;
      const elapsed = Math.max(16, now - pointer.time),
        dx = pointer.time ? x - pointer.x : 0,
        dy = pointer.time ? y - pointer.y : 0;
      const speed = Math.hypot(dx, dy) / elapsed;
      if (!pointer.time) stroke++;
      const radius = clamp(42 + speed * 29, 42, 103);
      const vx = clamp((dx / elapsed) * 145, -200, 200),
        vy = clamp((dy / elapsed) * 145, -200, 200);
      const samples = pointer.time ? Math.min(3, Math.max(1, Math.ceil(Math.hypot(dx, dy) / 45))) : 1;
      const tone = Math.floor(stroke / 2) % 3;
      for (let i = 1; i <= samples; i++)
        addDye(x - dx * (1 - i / samples), y - dy * (1 - i / samples), vx, vy, radius, tone, stroke);
      pointer = { x, y, time: now };
      start();
    }
    function leave() {
      pointer.time = 0;
      aim = { x: 0, y: 0 };
    }
    function scroll() {
      const delta = window.scrollY - lastY;
      lastY = window.scrollY;
      const now = performance.now();
      if (blocked() || Math.abs(delta) < 5 || now - lastScrollPaint < 110 || now - pointer.time < 140) return;
      lastScrollPaint = now;
      const x = width * (0.5 + Math.sin(time * 0.64) * 0.35),
        y = height * (delta > 0 ? 0.8 : 0.25);
      addDye(x, y, Math.cos(time * 0.8) * 46, clamp(-delta * 1.8, -130, 130), clamp(width * 0.075, 65, 110), 1, -1);
      start();
    }
    // The canvas may be sticky across a long gallery: observe the surface itself.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(surface);
    const resize = new ResizeObserver(measure);
    resize.observe(surface);
    root.addEventListener("pointermove", point, { passive: true });
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    syncRef.current = sync;
    measure();
    return () => {
      syncRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      root.removeEventListener("pointermove", point);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointercancel", leave);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
