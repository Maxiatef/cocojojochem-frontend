"use client";

import { useLayoutEffect, useRef } from "react";
import { CATEGORY_MOTIONS, clamp, moleculeFrame, type Atom, type Vec } from "./category-molecule-model";

type Props = { category: string; active: boolean; duration: number; className: string };
const palettes = [
  ["#f6ffff", "#abdff5", "#3798cb", "#10507c", "#061d35"],
  ["#fffef0", "#ffe7a8", "#dda544", "#865315", "#2f220f"],
  ["#ffffff", "#e0f8ff", "#93c9e7", "#467fa5", "#142e49"],
  ["#fffef8", "#f5efd9", "#cfdfdf", "#749bb0", "#2a465c"],
];

/** Perspective-projected, reflective molecular sculptures. No WebGL requirement. */
export default function CategoryMolecularScene({ category, active, duration, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current,
      ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    let width = 0,
      height = 0,
      ratio = 1,
      frame = 0,
      start = 0,
      disposed = false;
    const sprites = palettes.map((colors) => {
      const sprite = document.createElement("canvas");
      sprite.width = 192;
      sprite.height = 192;
      const c = sprite.getContext("2d")!;
      const glass = c.createRadialGradient(65, 51, 3, 98, 101, 91);
      [0, 0.17, 0.49, 0.79, 1].forEach((stop, i) => glass.addColorStop(stop, colors[i]));
      c.fillStyle = glass;
      c.beginPath();
      c.arc(96, 96, 89, 0, Math.PI * 2);
      c.fill();
      const rim = c.createLinearGradient(15, 14, 168, 178);
      rim.addColorStop(0, "#ffffffed");
      rim.addColorStop(0.38, "#e5f7ff33");
      rim.addColorStop(0.66, "#d3f2ff04");
      rim.addColorStop(1, colors[1]);
      c.strokeStyle = rim;
      c.lineWidth = 2.5;
      c.stroke();
      c.save();
      c.translate(65, 46);
      c.rotate(-0.55);
      const shine = c.createRadialGradient(0, 0, 0, 0, 0, 31);
      shine.addColorStop(0, "#ffffffff");
      shine.addColorStop(0.35, "#ffffffbc");
      shine.addColorStop(1, "#ffffff00");
      c.scale(1.25, 0.45);
      c.fillStyle = shine;
      c.beginPath();
      c.arc(0, 0, 31, 0, Math.PI * 2);
      c.fill();
      c.restore();
      c.beginPath();
      c.ellipse(119, 135, 35, 10, -0.7, 0, Math.PI);
      c.strokeStyle = colors[1] + "99";
      c.lineWidth = 4;
      c.stroke();
      return sprite;
    });
    const seed = Math.max(0, Object.keys(CATEGORY_MOTIONS).indexOf(category));
    function draw(p: number) {
      if (!width || !height) return;
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      const exit = clamp((p - 0.76) / 0.24),
        zoom = 1 + exit * exit * 3.8;
      const unit = Math.min(width * 0.4, height * 0.42) * zoom;
      const yaw = ((seed % 3) - 0.8) * 0.22 + p * 0.58,
        pitch = -0.16 + Math.sin(p * 2.3 + seed) * 0.14;
      const cy = Math.cos(yaw),
        sy = Math.sin(yaw),
        cx = Math.cos(pitch),
        sx = Math.sin(pitch);
      const project = (v: Vec) => {
        const x = v.x * cy + v.z * sy,
          z = -v.x * sy + v.z * cy,
          y = v.y * cx - z * sx,
          depth = v.y * sx + z * cx;
        const perspective = 4.6 / (4.6 - depth);
        return {
          x: width * 0.5 + x * unit * perspective,
          y: height * 0.5 + y * unit * perspective,
          z: depth,
          scale: unit * perspective,
        };
      };
      // A sparse depth field supports the sculpture without obscuring its shape.
      for (let i = 0; i < 27; i++) {
        const a = i * 2.39996 + seed * 0.7 + p * 0.18,
          r = 1.4 + (i % 7) * 0.12;
        const v = project({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.78, z: Math.sin(i * 2.1) * 0.9 });
        ctx!.globalAlpha = (0.08 + (i % 4) * 0.035) * (1 - exit);
        ctx!.fillStyle = i % 5 ? "#a8e5ff" : "#ffdb8d";
        ctx!.beginPath();
        ctx!.arc(v.x, v.y, Math.max(0.5, v.scale * 0.004), 0, Math.PI * 2);
        ctx!.fill();
      }
      const sculpture = moleculeFrame(category, p),
        points = sculpture.atoms.map(project);
      type DrawItem = { z: number; paint: () => void };
      const items: DrawItem[] = [];
      sculpture.bonds.forEach((b) => {
        const a = points[b.a],
          end = points[b.b];
        if (!a || !end || b.alpha <= 0) return;
        items.push({
          z: (a.z + end.z) * 0.5 - 0.002,
          paint: () => {
            const dx = end.x - a.x,
              dy = end.y - a.y,
              len = Math.max(1, Math.hypot(dx, dy)),
              w = b.width * (a.scale + end.scale) * 0.5;
            const mx = (a.x + end.x) * 0.5,
              my = (a.y + end.y) * 0.5,
              nx = (-dy / len) * w * 0.5,
              ny = (dx / len) * w * 0.5,
              colors = palettes[b.tone];
            const light = ctx!.createLinearGradient(mx - nx, my - ny, mx + nx, my + ny);
            light.addColorStop(0, colors[4]);
            light.addColorStop(0.18, colors[2]);
            light.addColorStop(0.35, colors[0]);
            light.addColorStop(0.5, colors[1]);
            light.addColorStop(0.8, colors[2]);
            light.addColorStop(1, colors[3]);
            ctx!.globalAlpha = b.alpha * (0.78 + (a.z + end.z + 3) * 0.035);
            ctx!.strokeStyle = light;
            ctx!.lineWidth = Math.max(0.7, w);
            ctx!.lineCap = "round";
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(end.x, end.y);
            ctx!.stroke();
          },
        });
      });
      sculpture.facets.forEach((f) => {
        const verts = f.vertices.map((id) => points[id]);
        items.push({
          z: verts.reduce((n, v) => n + v.z, 0) / verts.length,
          paint: () => {
            const colors = palettes[f.tone],
              light = ctx!.createLinearGradient(verts[0].x, verts[0].y, verts[2].x + 1, verts[2].y + 1);
            light.addColorStop(0, colors[0]);
            light.addColorStop(0.25, colors[1]);
            light.addColorStop(0.55, colors[2]);
            light.addColorStop(1, colors[4]);
            ctx!.globalAlpha = f.alpha;
            ctx!.fillStyle = light;
            ctx!.beginPath();
            verts.forEach((v, i) => (i ? ctx!.lineTo(v.x, v.y) : ctx!.moveTo(v.x, v.y)));
            ctx!.closePath();
            ctx!.fill();
          },
        });
      });
      sculpture.atoms.forEach((a: Atom, i) => {
        const v = points[i];
        if (a.alpha <= 0) return;
        items.push({
          z: v.z,
          paint: () => {
            const radius = a.radius * v.scale;
            if (radius < 0.2) return;
            ctx!.globalAlpha = clamp(a.alpha * (0.86 + (v.z + 1) * 0.07));
            ctx!.drawImage(sprites[a.tone], v.x - radius, v.y - radius, radius * 2, radius * 2);
          },
        });
      });
      items.sort((a, b) => a.z - b.z).forEach((item) => item.paint());
      ctx!.globalAlpha = 1;
    }
    function measure() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1_700_000 / Math.max(1, width * height)));
      canvas!.width = Math.max(1, Math.round(width * ratio));
      canvas!.height = Math.max(1, Math.round(height * ratio));
      draw(active && start ? clamp((performance.now() - start) / duration) : 0);
    }
    function tick(time: number) {
      if (disposed) return;
      if (!start) start = time;
      const p = clamp((time - start) / duration);
      draw(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    if (active) frame = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [category, active, duration]);
  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      data-molecular-scene={category}
      data-motion={CATEGORY_MOTIONS[category as keyof typeof CATEGORY_MOTIONS] || CATEGORY_MOTIONS["formulation-aids"]}
    />
  );
}
