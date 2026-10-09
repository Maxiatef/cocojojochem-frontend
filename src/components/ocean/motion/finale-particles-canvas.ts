import { runFinaleMotion } from "./finale-motion";

// Moving, cursor-responsive fallback for devices without WebGL.
export function createCanvasParticles(el: HTMLElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    el.dataset.particleState = "fallback";
    return () => {};
  }
  const count = innerWidth < 700 ? 2800 : 7200;
  let rng = 4517;
  const random = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng / 4294967296;
  };
  const points = Array.from({ length: count }, () => ({
    a: random() * Math.PI * 2,
    b: random() * Math.PI * 2,
    r: random(),
    tone: random(),
    x: 0,
    y: 0,
    z: 0,
    size: 0,
    alpha: 1,
  }));
  const sprites = [0, 1, 2, 3].map((t) => {
    const c = document.createElement("canvas");
    c.width = c.height = 40;
    const g = c.getContext("2d")!;
    const gradient = g.createRadialGradient(14, 12, 0, 20, 20, 19);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.16, ["#d9f5ff", "#c1eaff", "#b5e5ff", "#8ac9ef"][t]);
    gradient.addColorStop(0.43, ["#98cfe7", "#73b3db", "#549cc9", "#367eae"][t]);
    gradient.addColorStop(0.78, "#21517b");
    gradient.addColorStop(1, "#09233d");
    g.fillStyle = gradient;
    g.beginPath();
    g.arc(20, 20, 18, 0, Math.PI * 2);
    g.fill();
    return c;
  });
  const glow = document.createElement("canvas");
  glow.width = glow.height = 100;
  const gc = glow.getContext("2d")!,
    gg = gc.createRadialGradient(50, 50, 0, 50, 50, 50);
  gg.addColorStop(0, "#e6fbffb0");
  gg.addColorStop(0.2, "#9adfff69");
  gg.addColorStop(0.55, "#7acfff12");
  gg.addColorStop(1, "#65caff00");
  gc.fillStyle = gg;
  gc.fillRect(0, 0, 100, 100);
  el.dataset.particleRenderer = "canvas";
  el.dataset.particleCount = String(count);
  return runFinaleMotion(
    el,
    canvas,
    (state) => {
      const { time: t, width, height, px, py, gather, beam, release, trail } = state;
      ctx.clearRect(0, 0, width, height);
      const aspect = width / height,
        yaw = 0.6 * Math.sin(t * 0.8) + px * 0.42 + gather * 2.5,
        pitch = 0.3 * Math.sin(t * 0.55) + py * 0.22,
        cy = Math.cos(yaw),
        sy = Math.sin(yaw),
        cp = Math.cos(pitch),
        sp = Math.sin(pitch),
        scale = 1 - gather * 0.68,
        fit = Math.min(1, aspect * 1.35);
      for (const p of points) {
        const angle = p.a + t * 0.38,
          around = p.b + t * 0.24,
          bend = angle + 0.31 * Math.sin(angle * 3 + t * 0.43),
          ring = 0.76 + 0.19 * Math.sin(angle * 3 - t * 0.39),
          thickness = (0.24 + 0.12 * Math.sin(angle * 2 + t * 0.6)) * Math.pow(p.r, 0.4);
        let x = Math.cos(bend) * (ring * 1.42 + Math.cos(around) * thickness),
          y = Math.sin(bend) * (ring * 0.78 + Math.cos(around) * thickness) + 0.2 * Math.sin(angle * 2 + t * 0.53),
          z = Math.sin(angle * 3 + t * 0.31) * 0.5 + Math.sin(around) * thickness;
        x += Math.sin(y * 4 + z * 3 + t * 0.12) * 0.11;
        y += Math.sin(x * 3 - z * 4 - t * 0.09) * 0.13;
        z += Math.sin(x * 4 + y * 3 + t * 0.1) * 0.1;
        if (p.tone < 0.2) {
          x *= 0.72;
          y += Math.sin(angle * 2 - t * 0.32) * 0.36;
          z += Math.cos(angle * 2 + t * 0.24) * 0.32;
        }
        if (p.r > 0.89) {
          const halo = 1 + (p.r - 0.89) * 11;
          x *= halo;
          y = y * halo + Math.sin(t * 0.25 + p.tone * 40) * 0.19;
          z *= halo;
        }
        const rx = cy * x - sy * z;
        z = sy * x + cy * z;
        x = rx;
        const ry = cp * y - sp * z;
        z = sp * y + cp * z;
        y = ry;
        x *= scale;
        y = y * scale + gather * 0.2;
        z *= scale;
        const spiral = p.b + t * 3.2 + (p.a / Math.PI) * 5,
          beamY = ((p.a / (Math.PI * 2) + t * 0.16) % 1) * 2 - 1,
          radius = 0.018 + p.r * p.r * 0.11;
        x = x * (1 - beam) + Math.cos(spiral) * radius * beam;
        y = y * (1 - beam) + beamY * 1.15 * beam;
        z = z * (1 - beam) + Math.sin(spiral) * radius * beam;
        x = x * (1 - release) + Math.cos(spiral) * (1 + p.r) * 1.8 * release;
        y = y * (1 - release) + Math.sin(p.a) * (1 + p.r) * 0.85 * release;
        z = z * (1 - release) + Math.sin(spiral) * (1 + p.r) * release;
        x *= fit;
        y *= fit;
        z *= fit;
        const perspective = 3.25 / (4.8 - z);
        let sx = (x / aspect) * perspective,
          sy2 = y * perspective + 0.24;
        for (let i = 0; i < 24; i += 3) {
          if (trail[i + 2] < 0.002) continue;
          const dx = (sx - trail[i]) * aspect,
            dy = sy2 - trail[i + 1],
            distance = Math.sqrt(dx * dx + dy * dy),
            influence = Math.exp(-distance * distance * 9) * trail[i + 2],
            divisor = Math.max(distance, 0.045);
          sx += (((dx * 0.2 - dy * 0.24) / divisor) * influence) / aspect;
          sy2 += ((dy * 0.2 + dx * 0.24) / divisor) * influence;
        }
        const depth = Math.max(0, Math.min(1, (z + 1.8) / 3.6));
        p.x = (sx * 0.5 + 0.5) * width;
        p.y = (0.5 - sy2 * 0.5) * height;
        p.z = z;
        p.size =
          (p.tone > 0.998 ? 18 + p.r * 12 : 3.6 + Math.pow(p.tone, 3) * 4.5) *
          perspective *
          Math.max(0.72, Math.min(1.35, height / 780));
        p.alpha = (0.6 + depth * 0.4) * (p.r > 0.89 ? 0.62 : 1) * (1 - release * 0.95);
      }
      points.sort((a, b) => a.z - b.z);
      for (const p of points) {
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(
          sprites[Math.min(3, Math.floor(p.tone * 4))],
          p.x - p.size * 0.5,
          p.y - p.size * 0.5,
          p.size,
          p.size,
        );
      }
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.65 * (1 - release * 0.95);
      for (const p of points)
        if (p.tone > 0.998) {
          const s = p.size * 3.8;
          ctx.drawImage(glow, p.x - s * 0.5, p.y - s * 0.5, s, s);
        }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    },
    (state) => ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0),
  );
}
