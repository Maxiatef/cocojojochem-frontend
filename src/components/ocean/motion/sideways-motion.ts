const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
/** Native vertical scrolling drives the sideways stage. No wheel or touch interception. */
export function createSidewaysMotion(track: HTMLElement, canvas: HTMLCanvasElement) {
  const stage = track.querySelector<HTMLElement>(".s-stage")!,
    panels = [...track.querySelectorAll<HTMLElement>(".s-panel")],
    buttons = [...track.querySelectorAll<HTMLButtonElement>(".s-controls button")],
    root = track.closest<HTMLElement>(".lusion-home-shell"),
    reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const ctx = canvas.getContext("2d", { alpha: true });
  const bead = document.createElement("canvas");
  bead.width = bead.height = 40;
  const g = bead.getContext("2d")!,
    shine = g.createRadialGradient(13, 11, 0, 20, 20, 19);
  shine.addColorStop(0, "#fff");
  shine.addColorStop(0.17, "#d3f4ff");
  shine.addColorStop(0.47, "#549cd0");
  shine.addColorStop(0.77, "#1c4a80");
  shine.addColorStop(1, "#051c3a");
  g.fillStyle = shine;
  g.beginPath();
  g.arc(20, 20, 18, 0, Math.PI * 2);
  g.fill();
  let seed = 3265;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const dots = Array.from({ length: innerWidth < 600 ? 360 : 820 }, () => ({ a: random(), b: random(), c: random() }));
  let width = 1,
    height = 1,
    header = 140,
    progress = 0,
    target = 0,
    time = 0,
    kick = 0,
    px = 0,
    py = 0,
    tx = 0,
    ty = 0,
    last = 0,
    frame = 0,
    visible = false,
    paused = false,
    disposed = false;
  function draw() {
    if (!ctx || reduce.matches) return;
    ctx.clearRect(0, 0, width, height);
    for (let strand = 0; strand < 3; strand++) {
      ctx.beginPath();
      for (let j = 0; j <= 75; j++) {
        const u = j / 75,
          x = u * width,
          y = height * (0.52 + Math.sin(u * 7 + time * 0.55 + strand * 0.4 + progress * 4) * 0.16) + py * 15;
        if (!j) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(126,204,255,${0.04 + strand * 0.015})`;
      ctx.lineWidth = 0.6 + strand * 0.25;
      ctx.stroke();
    }
    for (const dot of dots) {
      const theta = dot.a * Math.PI * 2 + time * 0.64 + progress * 5,
        radius = 0.15 + dot.b * 0.27,
        z = Math.sin(theta + dot.b * 6),
        perspective = 1 + z * 0.32;
      let x = (0.66 + Math.cos(theta) * radius) * width,
        y = (0.49 + Math.sin(theta * 2 + dot.b * 3 + progress * 4) * (0.16 + dot.c * 0.1)) * height;
      x += Math.sin(time * 0.8 + dot.c * 8) * 24 + px * 25 * perspective - kick * 80;
      y += py * 23 * perspective;
      const dx = x / width - (tx * 0.5 + 0.5),
        dy = y / height - (ty * 0.5 + 0.5),
        force = Math.exp(-(dx * dx + dy * dy) * 38);
      x += (dx - dy * 0.8) * force * 110;
      y += (dy + dx * 0.8) * force * 80;
      const size = (dot.c > 0.985 ? 12 + dot.b * 7 : 1 + dot.c * 3) * perspective;
      ctx.globalAlpha = dot.c > 0.985 ? 0.8 : 0.25 + dot.b * 0.28;
      ctx.drawImage(bead, x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }
  function paint() {
    const travel = progress * 2;
    stage.style.setProperty("--s-track", `${-width * travel}px`);
    track.style.setProperty("--s-x", `${px * 20}px`);
    track.style.setProperty("--s-y", `${py * 15}px`);
    panels.forEach((panel, i) => {
      const offset = reduce.matches ? 0 : travel - i;
      panel.style.setProperty("--s-copy-shift", `${offset * width * 0.09}px`);
      panel.style.setProperty("--s-art-x", `${offset * width * 0.16 + px * 28}px`);
      panel.style.setProperty("--s-art-y", `${py * 22}px`);
      panel.style.setProperty("--s-art-turn", `${offset * -9 + px * 2.5}deg`);
      const current = reduce.matches || Math.round(travel) === i;
      panel.inert = !current;
      if (current) panel.removeAttribute("aria-hidden");
      else panel.setAttribute("aria-hidden", "true");
    });
    buttons.forEach((button, i) => {
      button.setAttribute("aria-current", String(Math.round(travel) === i));
      button.style.setProperty("--scene-fill", String(i === 2 && progress > 0.995 ? 1 : clamp(travel - i + 0.35)));
    });
    track.dataset.scene = String(Math.round(travel) + 1);
    track.dataset.progress = progress.toFixed(3);
    draw();
  }
  function render(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min(0.08, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    if (!paused) {
      time += dt * (1.2 + kick * 2);
      progress += (target - progress) * (1 - Math.exp(-dt * 15));
      kick *= Math.exp(-dt * 6);
      px += (tx - px) * (1 - Math.exp(-dt * 16));
      py += (ty - py) * (1 - Math.exp(-dt * 16));
    } else progress = target;
    paint();
    if (!paused) frame = requestAnimationFrame(render);
  }
  function request() {
    if (!frame && !disposed && visible && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(render);
    }
  }
  function scroll() {
    if (reduce.matches) return;
    const r = track.getBoundingClientRect(),
      next = clamp((header - r.top) / Math.max(1, r.height - height));
    kick = Math.min(1, kick + Math.abs(next - target) * 9);
    target = next;
    request();
  }
  function measure() {
    header = root?.querySelector("header")?.getBoundingClientRect().height || 140;
    track.style.setProperty("--s-header", `${header}px`);
    width = stage.clientWidth;
    height = stage.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_200_000 / Math.max(1, width * height)));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    scroll();
    paint();
  }
  function motion() {
    paused = reduce.matches || root?.dataset.motion === "paused";
    track.dataset.reduced = String(reduce.matches);
    track.dataset.active = String(!paused && visible && !document.hidden);
    track.dataset.motion = paused ? "paused" : "playing";
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (reduce.matches) {
      target = progress = 0;
      tx = ty = px = py = 0;
    }
    measure();
    request();
  }
  function pointer(e: PointerEvent) {
    if (paused || e.pointerType === "touch") return;
    const r = stage.getBoundingClientRect();
    tx = ((e.clientX - r.left) / width) * 2 - 1;
    ty = ((e.clientY - r.top) / height) * 2 - 1;
    request();
  }
  function leave() {
    tx = ty = 0;
  }
  function choose(i: number) {
    const r = track.getBoundingClientRect(),
      top = scrollY + r.top - header + (r.height - height) * (i / 2);
    window.scrollTo({ top, behavior: paused || reduce.matches ? "instant" : "smooth" });
  }
  const clickHandlers = buttons.map((button, i) => {
    const fn = () => choose(i);
    button.addEventListener("click", fn);
    return fn;
  });
  const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        track.dataset.active = String(!paused && visible && !document.hidden);
        if (visible) {
          scroll();
          request();
        } else {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
        }
      },
      { rootMargin: "80px" },
    ),
    ro = new ResizeObserver(measure);
  track.dataset.enhanced = "true";
  io.observe(stage);
  ro.observe(stage);
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("cj-motion-change", motion);
  document.addEventListener("visibilitychange", motion);
  reduce.addEventListener("change", motion);
  stage.addEventListener("pointermove", pointer, { passive: true });
  stage.addEventListener("pointerleave", leave);
  stage.addEventListener("pointercancel", leave);
  motion();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("resize", measure);
    window.removeEventListener("cj-motion-change", motion);
    document.removeEventListener("visibilitychange", motion);
    reduce.removeEventListener("change", motion);
    stage.removeEventListener("pointermove", pointer);
    stage.removeEventListener("pointerleave", leave);
    stage.removeEventListener("pointercancel", leave);
    buttons.forEach((button, i) => button.removeEventListener("click", clickHandlers[i]));
    panels.forEach((panel) => {
      panel.inert = false;
      panel.removeAttribute("aria-hidden");
    });
    delete track.dataset.enhanced;
  };
}
