import { createMoleculePainter, type CloseupFrame } from "./molecule-closeup-renderer";
const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const ease = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Services-only choreography. Native page scrolling remains untouched. */
export function createServicesFinaleMotion(track: HTMLElement, canvas: HTMLCanvasElement) {
  const stage = track.querySelector<HTMLElement>(".svcx-stage")!,
    root = track.closest<HTMLElement>(".lusion-home-shell");
  const panels = [...track.querySelectorAll<HTMLElement>(".svcx-scene")],
    buttons = [...track.querySelectorAll<HTMLButtonElement>("[data-services-scene]")];
  const pause = track.querySelector<HTMLButtonElement>(".svcx-pause")!,
    reduce = matchMedia("(prefers-reduced-motion: reduce)"),
    painter = createMoleculePainter(canvas);
  const state: CloseupFrame = {
    width: 1,
    height: 1,
    time: 0,
    progress: 0.78,
    leftY: 0,
    rightY: 0,
    zoom: 1,
    px: 0,
    py: 0,
  };
  let progress = 0,
    target = 0,
    tx = 0,
    ty = 0,
    header = 140,
    frame = 0,
    previous = 0,
    visible = false,
    disposed = false,
    localPause = false,
    paused = false,
    lastChapter = -1;
  function paint() {
    const q = progress * 4,
      w = state.width,
      h = state.height;
    track.style.setProperty("--svcx-px", `${state.px * 24}px`);
    track.style.setProperty("--svcx-py", `${state.py * 18}px`);
    track.style.setProperty("--svcx-wash", String(ease(2.25, 3.2, q) * (1 - ease(3.35, 3.95, q))));
    panels.forEach((panel, i) => {
      const offset = q - i,
        abs = Math.abs(offset),
        active = reduce.matches || Math.round(q) === i;
      panel.inert = !active;
      if (active) panel.removeAttribute("aria-hidden");
      else panel.setAttribute("aria-hidden", "true");
      let transform = "none";
      if (i === 0) transform = `translate3d(0,${-offset * h * 0.6}px,0) scale(${1 + Math.max(0, offset) * 0.75})`;
      if (i === 1) transform = `translate3d(${-offset * w * 1.05}px,0,0)`;
      if (i === 3) transform = `translate3d(0,${-offset * h * 0.65}px,0) scale(${1 + Math.max(0, offset) * 0.15})`;
      if (i === 4) transform = `translate3d(0,${-offset * h * 0.48}px,0) scale(${1 + Math.min(0, offset) * 0.3})`;
      panel.style.setProperty("--svcx-scene-transform", transform);
      panel.style.setProperty("--svcx-opacity", String(1 - ease(0.32, 0.85, abs)));
      panel.style.setProperty("--svcx-up", `${-offset * h * 1.5}px`);
      panel.style.setProperty("--svcx-down", `${offset * h * 1.5}px`);
      panel.style.setProperty("--svcx-art-x", `${offset * w * 0.18 + state.px * 22}px`);
      panel.style.setProperty("--svcx-art-y", `${state.py * 17 + Math.sin(state.time * 0.8 + i) * 14}px`);
      panel.style.setProperty(
        "--svcx-art-turn",
        `${offset * 38 + state.px * 4 + Math.sin(state.time * 0.36 + i) * 6}deg`,
      );
      panel.style.setProperty(
        "--svcx-art-scale",
        String(i === 0 ? 1 + Math.max(0, offset) * 1.9 : 1 + Math.abs(offset) * 0.24),
      );
    });
    const chapter = Math.min(4, Math.round(q));
    if (chapter !== lastChapter) {
      buttons.forEach((b, i) => b.setAttribute("aria-current", String(chapter === i)));
      lastChapter = chapter;
      track.dataset.scene = String(chapter + 1);
    }
    buttons.forEach((b, i) => b.style.setProperty("--svcx-fill", String(clamp(q - i + 0.5))));
    const approach = ease(2.45, 3.4, q),
      release = ease(3.42, 3.96, q);
    state.zoom = (1 + approach * 12) * (1 - release) + release * 0.82;
    track.style.setProperty("--svcx-molecule-opacity", String(ease(2.32, 2.72, q) * (1 - release * 0.76)));
    track.style.setProperty("--svcx-molecule-x", `${w * 0.12 * (1 - ease(2.7, 3.32, q)) + w * 0.2 * release}px`);
    track.style.setProperty("--svcx-molecule-y", `${-release * h * 0.04}px`);
    track.dataset.progress = progress.toFixed(3);
    track.dataset.zoom = state.zoom.toFixed(2);
    if (!reduce.matches) painter.draw(state);
  }
  function render(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min(0.05, previous ? (now - previous) / 1000 : 1 / 60);
    previous = now;
    if (!paused) {
      state.time += dt * 1.45;
      progress += (target - progress) * (1 - Math.exp(-dt * 17));
      state.px += (tx - state.px) * (1 - Math.exp(-dt * 18));
      state.py += (ty - state.py) * (1 - Math.exp(-dt * 18));
    } else progress = target;
    paint();
    if (!paused && !reduce.matches) frame = requestAnimationFrame(render);
  }
  function request() {
    if (!frame && !disposed && visible && !document.hidden) {
      previous = 0;
      frame = requestAnimationFrame(render);
    }
  }
  function scroll() {
    if (reduce.matches) return;
    const r = track.getBoundingClientRect();
    target = clamp((header - r.top) / Math.max(1, r.height - state.height));
    request();
  }
  function measure() {
    header = root?.querySelector("header")?.getBoundingClientRect().height || 140;
    track.style.setProperty("--svcx-header", `${header}px`);
    state.width = stage.clientWidth;
    state.height = reduce.matches ? Math.min(innerHeight, 850) : stage.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_300_000 / Math.max(1, state.width * state.height)));
    canvas.width = Math.round(state.width * dpr);
    canvas.height = Math.round(state.height * dpr);
    painter.resize(dpr);
    scroll();
    paint();
    request();
  }
  function motion() {
    paused = localPause || reduce.matches || root?.dataset.motion === "paused";
    track.dataset.reduced = String(reduce.matches);
    track.dataset.motion = paused ? "paused" : "playing";
    pause.setAttribute("aria-pressed", String(paused));
    pause.setAttribute("aria-label", paused ? "Resume services scene motion" : "Pause services scene motion");
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (reduce.matches) {
      progress = target = 0;
      state.px = state.py = tx = ty = 0;
    }
    measure();
    request();
  }
  function point(e: PointerEvent) {
    if (paused || e.pointerType === "touch") return;
    const r = stage.getBoundingClientRect();
    tx = clamp(((e.clientX - r.left) / state.width) * 2 - 1, -1, 1);
    ty = clamp(((e.clientY - r.top) / state.height) * 2 - 1, -1, 1);
    request();
  }
  function leave() {
    tx = ty = 0;
    request();
  }
  function choose(i: number) {
    const r = track.getBoundingClientRect();
    window.scrollTo({
      top: scrollY + r.top - header + (r.height - state.height) * (i / 4),
      behavior: paused ? "instant" : "smooth",
    });
  }
  function toggle() {
    if (root?.dataset.motion === "paused") {
      localPause = false;
      root.querySelector<HTMLButtonElement>(".l-global-motion")?.click();
    } else localPause = !localPause;
    motion();
  }
  const handlers = buttons.map((b, i) => {
    const fn = () => choose(i);
    b.addEventListener("click", fn);
    return fn;
  });
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
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
  );
  const resize = new ResizeObserver(measure);
  track.dataset.enhanced = "true";
  observer.observe(stage);
  resize.observe(stage);
  stage.addEventListener("pointermove", point, { passive: true });
  stage.addEventListener("pointerleave", leave);
  stage.addEventListener("pointercancel", leave);
  pause.addEventListener("click", toggle);
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("cj-motion-change", motion);
  document.addEventListener("visibilitychange", motion);
  reduce.addEventListener("change", motion);
  motion();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resize.disconnect();
    stage.removeEventListener("pointermove", point);
    stage.removeEventListener("pointerleave", leave);
    stage.removeEventListener("pointercancel", leave);
    pause.removeEventListener("click", toggle);
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("resize", measure);
    window.removeEventListener("cj-motion-change", motion);
    document.removeEventListener("visibilitychange", motion);
    reduce.removeEventListener("change", motion);
    buttons.forEach((b, i) => b.removeEventListener("click", handlers[i]));
    panels.forEach((p) => {
      p.inert = false;
      p.removeAttribute("aria-hidden");
    });
    delete track.dataset.enhanced;
  };
}
