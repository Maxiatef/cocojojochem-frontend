export type FinaleFrame = {
  time: number;
  progress: number;
  gather: number;
  beam: number;
  release: number;
  width: number;
  height: number;
  dpr: number;
  px: number;
  py: number;
  impulse: number;
  trail: Float32Array;
};
export const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** One scroll timeline and pointer controller, shared by both renderers. */
export function runFinaleMotion(
  el: HTMLElement,
  canvas: HTMLCanvasElement,
  draw: (state: FinaleFrame) => void,
  resize: (state: FinaleFrame) => void,
) {
  const wordLink = el.querySelector<HTMLAnchorElement>("#finale-title a");
  const track = el.closest<HTMLElement>(".f-finale-sequence")!,
    root = el.closest<HTMLElement>(".lusion-home-shell"),
    reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const state: FinaleFrame = {
    time: 2,
    progress: 0,
    gather: 0,
    beam: 0,
    release: 0,
    width: 1,
    height: 1,
    dpr: 1,
    px: 0,
    py: 0.24,
    impulse: 0,
    trail: new Float32Array(24),
  };
  let frame = 0,
    last = 0,
    visible = false,
    paused = false,
    disposed = false,
    inside = false,
    tx = 0,
    ty = 0.24,
    energy = 0,
    targetProgress = 0,
    scrollKick = 0,
    headerHeight = 140;
  const wake = Array.from({ length: 8 }, () => ({ x: 0, y: 0.24, power: 0 }));
  function timeline() {
    state.gather = smooth(0, 0.62, state.progress);
    state.beam = smooth(0.3, 0.76, state.progress);
    state.release = smooth(0.78, 1, state.progress);
    const fold = smooth(0.01, 0.33, state.progress),
      reveal = smooth(0.56, 0.86, state.progress);
    el.style.setProperty("--word-fold", String(fold));
    el.style.setProperty("--word-interactive", state.progress < 0.28 ? "auto" : "none");
    if (wordLink) wordLink.tabIndex = state.progress < 0.28 ? 0 : -1;
    el.style.setProperty("--word-opacity", String(1 - smooth(0.12, 0.32, state.progress)));
    el.style.setProperty("--invitation-scale", String(1 + reveal * (state.width < 600 ? 0.48 : 1.25)));
    el.style.setProperty("--invitation-y", `${reveal * state.height * 0.24}px`);
    el.style.setProperty("--beam-opacity", String(state.beam * (1 - state.release)));
    el.style.setProperty("--beam-spread", String(1 + state.release * 3));
    el.style.setProperty("--hint-opacity", String(1 - smooth(0.16, 0.35, state.progress)));
    el.dataset.scrollProgress = state.progress.toFixed(3);
    el.dataset.scrollPhase =
      state.progress < 0.22
        ? "cloud"
        : state.progress < 0.56
          ? "collapse"
          : state.progress < 0.8
            ? "light-column"
            : "reveal";
  }
  function render(now: number) {
    frame = 0;
    if (disposed || !visible || paused || document.hidden) return;
    const dt = Math.min(0.1, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    state.progress += (targetProgress - state.progress) * (1 - Math.exp(-dt * 16));
    state.time += dt * (1.55 + state.impulse * 1.8 + scrollKick * 2);
    scrollKick *= Math.exp(-dt * 7);
    state.impulse *= Math.exp(-dt * 3.8);
    const ease = 1 - Math.exp(-dt * 23);
    state.px += (tx - state.px) * ease;
    state.py += (ty - state.py) * ease;
    energy += ((inside ? 1 : 0) - energy) * (1 - Math.exp(-dt * 13));
    for (let i = 7; i > 0; i--) {
      const k = 1 - Math.exp(-dt * (22 - i * 1.4));
      wake[i].x += (wake[i - 1].x - wake[i].x) * k;
      wake[i].y += (wake[i - 1].y - wake[i].y) * k;
      wake[i].power += (wake[i - 1].power - wake[i].power) * k;
    }
    wake[0] = { x: state.px, y: state.py, power: energy };
    wake.forEach((w, i) => {
      state.trail[i * 3] = w.x;
      state.trail[i * 3 + 1] = w.y;
      state.trail[i * 3 + 2] = w.power * (1 - i / 8) * 0.55 * (1 - state.beam * 0.85);
    });
    el.style.setProperty("--finale-light-x", `${(state.px * 0.5 + 0.5) * 100}%`);
    el.style.setProperty("--finale-light-y", `${(0.5 - state.py * 0.5) * 100}%`);
    timeline();
    draw(state);
    frame = requestAnimationFrame(render);
  }
  function start() {
    if (!frame && !disposed && visible && !paused && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(render);
    }
  }
  function scroll() {
    if (paused) return;
    const r = track.getBoundingClientRect(),
      next = Math.max(0, Math.min(1, (headerHeight - r.top) / Math.max(1, r.height - state.height)));
    scrollKick = Math.min(1, scrollKick + Math.abs(next - targetProgress) * 12);
    targetProgress = next;
    start();
  }
  function measure() {
    headerHeight = root?.querySelector("header")?.getBoundingClientRect().height || 140;
    track.style.setProperty("--finale-header", `${headerHeight}px`);
    const r = el.getBoundingClientRect();
    state.width = Math.max(1, r.width);
    state.height = Math.max(1, r.height);
    state.dpr = Math.min(devicePixelRatio || 1, 1.6, Math.sqrt(1_500_000 / (state.width * state.height)));
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    resize(state);
    scroll();
    timeline();
    draw(state);
  }
  function motion() {
    paused = reduce.matches || root?.dataset.motion === "paused";
    track.dataset.motion = paused ? "paused" : "playing";
    track.dataset.reduced = String(reduce.matches);
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (paused) {
      inside = false;
      energy = 0;
      state.impulse = 0;
      if (reduce.matches) state.progress = 0;
      state.trail.fill(0);
      wake.forEach((w) => (w.power = 0));
      tx = state.px = 0;
      ty = state.py = 0.24;
    }
    el.dataset.particleMotion = paused ? "paused" : "playing";
    measure();
    start();
  }
  function point(e: PointerEvent) {
    if (paused || !visible || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect(),
      x = ((e.clientX - r.left) / r.width) * 2 - 1,
      y = 1 - ((e.clientY - r.top) / r.height) * 2;
    state.impulse = Math.min(1.4, state.impulse + Math.hypot(x - tx, y - ty) * 2.8);
    tx = x;
    ty = y;
    inside = true;
    el.dataset.pointerActive = "true";
    start();
  }
  function leave() {
    inside = false;
    tx = 0;
    ty = 0.24;
    el.dataset.pointerActive = "false";
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    } else start();
  }
  const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        el.dataset.particleVisible = String(visible);
        if (visible) {
          scroll();
          start();
        } else {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
        }
      },
      { rootMargin: "100px" },
    ),
    sizer = new ResizeObserver(measure);
  observer.observe(el);
  sizer.observe(el);
  el.addEventListener("pointermove", point, { passive: true });
  el.addEventListener("pointerleave", leave);
  el.addEventListener("pointercancel", leave);
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("cj-motion-change", motion);
  document.addEventListener("visibilitychange", visibility);
  reduce.addEventListener("change", motion);
  track.dataset.enhanced = "true";
  el.dataset.particleState = "ready";
  motion();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    sizer.disconnect();
    el.removeEventListener("pointermove", point);
    el.removeEventListener("pointerleave", leave);
    el.removeEventListener("pointercancel", leave);
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("resize", measure);
    window.removeEventListener("cj-motion-change", motion);
    document.removeEventListener("visibilitychange", visibility);
    reduce.removeEventListener("change", motion);
    delete track.dataset.enhanced;
  };
}
