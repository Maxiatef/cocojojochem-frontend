import { createMoleculePainter, type CloseupFrame } from "./molecule-closeup-renderer";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export function createCloseupMotion(track: HTMLElement, canvas: HTMLCanvasElement) {
  const stage = track.querySelector<HTMLElement>(".v-stage")!,
    root = track.closest<HTMLElement>(".lusion-home-shell"),
    panels = [...track.querySelectorAll<HTMLElement>(".v-panel")],
    lastCopy = track.querySelector<HTMLElement>(".v-last-copy")!,
    buttons = [...track.querySelectorAll<HTMLButtonElement>(".v-scene-nav button")],
    reduce = matchMedia("(prefers-reduced-motion: reduce)"),
    painter = createMoleculePainter(canvas);
  const state: CloseupFrame = { width: 1, height: 1, time: 0, progress: 0, leftY: 0, rightY: 0, zoom: 1, px: 0, py: 0 };
  let header = 140,
    target = 0,
    frame = 0,
    previous = 0,
    visible = false,
    paused = false,
    disposed = false,
    tx = 0,
    ty = 0,
    kick = 0;
  function paint() {
    const p = state.progress,
      h = state.height;
    state.leftY = -h * 0.28 * (1 - smooth(0, 0.17, p)) + h * 1.2 * smooth(0.27, 0.53, p);
    state.rightY = h * 1.1 * (1 - smooth(0.26, 0.48, p)) - h * 1.2 * smooth(0.53, 0.72, p);
    state.zoom = 1 + 9.5 * smooth(0.65, 0.96, p);
    stage.style.setProperty("--v-down", `${state.leftY}px`);
    stage.style.setProperty("--v-up", `${state.rightY}px`);
    stage.style.setProperty("--v-depth-x", `${state.px * 15}px`);
    stage.style.setProperty("--v-depth-y", `${state.py * 12}px`);
    stage.style.setProperty("--v-caption-opacity", String(smooth(0.61, 0.7, p) * (1 - smooth(0.79, 0.88, p))));
    const last = smooth(0.91, 0.995, p);
    stage.style.setProperty("--v-last-opacity", String(last));
    stage.style.setProperty("--v-last-y", `${(1 - last) * 40}px`);
    panels.forEach((panel, i) => {
      const hidden = !reduce.matches && (i === 0 ? p > 0.52 : p < 0.26 || p > 0.73);
      if (hidden) panel.setAttribute("aria-hidden", "true");
      else panel.removeAttribute("aria-hidden");
    });
    lastCopy.inert = !reduce.matches && last < 0.65;
    if (lastCopy.inert) lastCopy.setAttribute("aria-hidden", "true");
    else lastCopy.removeAttribute("aria-hidden");
    const chapter = p < 0.32 ? 0 : p < 0.64 ? 1 : 2;
    buttons.forEach((button, i) => button.setAttribute("aria-current", String(i === chapter)));
    track.dataset.progress = p.toFixed(3);
    track.dataset.chapter = String(chapter + 1);
    track.dataset.moleculeZoom = state.zoom.toFixed(2);
    if (!reduce.matches) painter.draw(state);
  }
  function render(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min(0.08, previous ? (now - previous) / 1000 : 1 / 60);
    previous = now;
    if (!paused) {
      state.time += dt * (1.25 + kick * 1.7);
      state.progress += (target - state.progress) * (1 - Math.exp(-dt * 16));
      state.px += (tx - state.px) * (1 - Math.exp(-dt * 18));
      state.py += (ty - state.py) * (1 - Math.exp(-dt * 18));
      kick *= Math.exp(-dt * 6);
    } else state.progress = target;
    paint();
    if (!paused) frame = requestAnimationFrame(render);
  }
  function request() {
    if (!frame && !disposed && visible && !document.hidden) {
      previous = 0;
      frame = requestAnimationFrame(render);
    }
  }
  function scroll() {
    if (reduce.matches) return;
    const r = track.getBoundingClientRect(),
      next = clamp((header - r.top) / Math.max(1, r.height - state.height));
    kick = Math.min(1, kick + Math.abs(next - target) * 10);
    target = next;
    request();
  }
  function measure() {
    header = root?.querySelector("header")?.getBoundingClientRect().height || 140;
    track.style.setProperty("--v-header", `${header}px`);
    state.width = stage.clientWidth;
    state.height = stage.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.6, Math.sqrt(1_500_000 / Math.max(1, state.width * state.height)));
    canvas.width = Math.round(state.width * dpr);
    canvas.height = Math.round(state.height * dpr);
    painter.resize(dpr);
    scroll();
    paint();
  }
  function motion() {
    paused = reduce.matches || root?.dataset.motion === "paused";
    track.dataset.reduced = String(reduce.matches);
    track.dataset.motion = paused ? "paused" : "playing";
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (reduce.matches) {
      state.progress = target = 0;
    }
    measure();
    request();
  }
  function point(e: PointerEvent) {
    if (paused || e.pointerType === "touch") return;
    const r = stage.getBoundingClientRect();
    tx = ((e.clientX - r.left) / state.width) * 2 - 1;
    ty = ((e.clientY - r.top) / state.height) * 2 - 1;
    request();
  }
  function leave() {
    tx = ty = 0;
  }
  function choose(i: number) {
    const fraction = [0.14, 0.46, 0.88][i],
      r = track.getBoundingClientRect();
    window.scrollTo({
      top: scrollY + r.top - header + (r.height - state.height) * fraction,
      behavior: paused || reduce.matches ? "instant" : "smooth",
    });
  }
  const handlers = buttons.map((button, i) => {
    const fn = () => choose(i);
    button.addEventListener("click", fn);
    return fn;
  });
  const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        track.dataset.visible = String(visible);
        if (visible) {
          scroll();
          request();
        } else {
          cancelAnimationFrame(frame);
          frame = 0;
          previous = 0;
        }
      },
      { rootMargin: "80px" },
    ),
    ro = new ResizeObserver(measure);
  track.dataset.enhanced = "true";
  io.observe(stage);
  ro.observe(stage);
  stage.addEventListener("pointermove", point, { passive: true });
  stage.addEventListener("pointerleave", leave);
  stage.addEventListener("pointercancel", leave);
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("cj-motion-change", motion);
  document.addEventListener("visibilitychange", motion);
  reduce.addEventListener("change", motion);
  motion();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    io.disconnect();
    ro.disconnect();
    stage.removeEventListener("pointermove", point);
    stage.removeEventListener("pointerleave", leave);
    stage.removeEventListener("pointercancel", leave);
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("resize", measure);
    window.removeEventListener("cj-motion-change", motion);
    document.removeEventListener("visibilitychange", motion);
    reduce.removeEventListener("change", motion);
    buttons.forEach((button, i) => button.removeEventListener("click", handlers[i]));
    delete track.dataset.enhanced;
  };
}
