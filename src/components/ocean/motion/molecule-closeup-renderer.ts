export type CloseupFrame = {
  width: number;
  height: number;
  time: number;
  progress: number;
  leftY: number;
  rightY: number;
  zoom: number;
  px: number;
  py: number;
};
const ease = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Project actual 3D atom and bond positions, with glossy environment reflections. */
export function createMoleculePainter(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true });
  const nodes = [
    { x: 0, y: 0, z: 0, r: 0.43 },
    { x: 1.03, y: 0.56, z: 0.42, r: 0.25 },
    { x: -0.93, y: 0.72, z: -0.3, r: 0.3 },
    { x: -0.78, y: -0.83, z: 0.3, r: 0.28 },
    { x: 0.87, y: -0.76, z: -0.45, r: 0.26 },
    { x: 0.1, y: 0.12, z: 1.12, r: 0.2 },
    { x: -0.14, y: 0.17, z: -1.2, r: 0.26 },
  ];
  function sphere(x: number, y: number, r: number, tint: number) {
    if (!ctx || r < 0.1) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(r, r);
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.clip();
    const skin = ctx.createRadialGradient(-0.42, -0.43, 0.03, 0.06, 0.12, 1.18);
    skin.addColorStop(0, "#f4feff");
    skin.addColorStop(0.14, "#bdeaff");
    skin.addColorStop(0.29, tint ? "#68b4dc" : "#4699d1");
    skin.addColorStop(0.54, tint ? "#287cae" : "#135c99");
    skin.addColorStop(0.78, "#03294f");
    skin.addColorStop(0.92, "#62b8ef");
    skin.addColorStop(1, "#d1f7ff");
    ctx.fillStyle = skin;
    ctx.fillRect(-1, -1, 2, 2);
    const shine = ctx.createLinearGradient(0, -1, 0, 0.45);
    shine.addColorStop(0, "#ffffffbd");
    shine.addColorStop(0.35, "#e4f8ff61");
    shine.addColorStop(1, "#abdfff00");
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.moveTo(-0.91, -0.35);
    ctx.bezierCurveTo(-0.63, -1.06, 0.66, -0.91, 0.86, -0.44);
    ctx.bezierCurveTo(0.45, -0.61, -0.17, -0.17, -0.91, -0.35);
    ctx.fill();
    ctx.strokeStyle = "#dcf5ffbb";
    ctx.lineWidth = 0.025;
    ctx.beginPath();
    ctx.ellipse(-0.21, -0.3, 0.58, 0.32, -0.55, 3.1, 5.5);
    ctx.stroke();
    ctx.strokeStyle = "#a2dcff70";
    ctx.lineWidth = 0.04;
    ctx.beginPath();
    ctx.arc(0.04, 0.02, 0.88, 0.14, 1.12);
    ctx.stroke();
    const pin = ctx.createRadialGradient(-0.42, -0.48, 0, -0.42, -0.48, 0.16);
    pin.addColorStop(0, "#fff");
    pin.addColorStop(1, "#ffffff00");
    ctx.fillStyle = pin;
    ctx.fillRect(-0.65, -0.7, 0.5, 0.5);
    ctx.restore();
  }
  function molecule(cx: number, cy: number, size: number, yaw: number, pitch: number, alpha: number) {
    if (!ctx || alpha < 0.003) return;
    const co = Math.cos(yaw),
      si = Math.sin(yaw),
      cp = Math.cos(pitch),
      sp = Math.sin(pitch);
    const projected = nodes.map((n) => {
      const x = n.x * co + n.z * si,
        zz = -n.x * si + n.z * co,
        y = n.y * cp - zz * sp,
        z = n.y * sp + zz * cp,
        p = 6.5 / (6.5 - z);
      return { x: cx + x * size * p, y: cy + y * size * p, z, x3: x, y3: y, r: n.r * size * p, p };
    });
    const objects = [
      ...projected.map((n, i) => ({ kind: "atom", i, z: n.z })),
      ...projected.slice(1).map((n, i) => ({ kind: "bond", i: i + 1, z: (n.z + projected[0].z) / 2 })),
    ].sort((a, b) => a.z - b.z);
    ctx.globalAlpha = alpha;
    for (const o of objects) {
      const n = projected[o.i];
      if (o.kind === "atom") {
        sphere(n.x, n.y, n.r, o.i % 2);
        continue;
      }
      const len = Math.hypot(n.x3, n.y3, n.z),
        near = 0.43 / len,
        far = 1 - nodes[o.i].r / len,
        ap = 6.5 / (6.5 - n.z * near),
        bp = 6.5 / (6.5 - n.z * far),
        a = { x: cx + n.x3 * near * size * ap, y: cy + n.y3 * near * size * ap, p: ap },
        b = { x: cx + n.x3 * far * size * bp, y: cy + n.y3 * far * size * bp, p: bp },
        dx = b.x - a.x,
        dy = b.y - a.y,
        length = Math.max(0.01, Math.hypot(dx, dy)),
        nx = -dy / length,
        ny = dx / length,
        w = (size * 0.062 * (a.p + b.p)) / 2,
        mx = (a.x + b.x) / 2,
        my = (a.y + b.y) / 2;
      const metal = ctx.createLinearGradient(mx - nx * w, my - ny * w, mx + nx * w, my + ny * w);
      metal.addColorStop(0, "#073159");
      metal.addColorStop(0.24, "#50a9dc");
      metal.addColorStop(0.45, "#e7faff");
      metal.addColorStop(0.59, "#b0e3fc");
      metal.addColorStop(0.8, "#408abe");
      metal.addColorStop(1, "#042b53");
      ctx.strokeStyle = metal;
      ctx.lineWidth = w * 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  return {
    resize(dpr: number) {
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    draw(s: CloseupFrame) {
      if (!ctx) return;
      const { width: w, height: h, time: t, progress: p } = s;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 95; i++) {
        const a = i * 2.39996,
          x = ((Math.sin(a) * 0.5 + 0.5) * w + t * (4 + (i % 5))) % w,
          y = ((Math.cos(a * 1.7) * 0.5 + 0.5) * h - t * (3 + (i % 7)) + h * 20) % h,
          r = i % 17 === 0 ? 3 : 1;
        ctx.globalAlpha = 0.13 + Math.sin(t * 0.9 + i) * 0.07;
        ctx.fillStyle = "#9fdaff";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const mobile = w < 600,
        small = Math.min(h * 0.168, w * 0.175),
        yaw = t * 0.52 + s.px * 0.28;
      molecule(
        w * 0.25 + s.px * 12,
        s.leftY + h * 0.28 + s.py * 12,
        small,
        yaw,
        0.25 + Math.sin(t * 0.33) * 0.24,
        1 - ease(0.43, 0.53, p),
      );
      molecule(
        w * 0.75 + s.px * 12,
        s.rightY + h * 0.28 + s.py * 12,
        small,
        yaw * -1.1 + 1.8,
        -0.28 + Math.sin(t * 0.4) * 0.25,
        ease(0.2, 0.3, p) * (1 - ease(0.66, 0.73, p)),
      );
      const alpha = ease(0.58, 0.68, p) * (1 - ease(0.945, 1, p)),
        base = Math.min(h * 0.16, w * (mobile ? 0.2 : 0.16)),
        size = base * s.zoom;
      molecule(
        w * (0.54 + ease(0.7, 0.95, p) * 0.07) + s.px * 20,
        h * 0.49 + s.py * 15,
        size,
        t * 0.22 + p * 3.1,
        0.22 + Math.sin(t * 0.21) * 0.2,
        alpha,
      );
    },
  };
}
