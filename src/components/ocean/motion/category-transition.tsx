"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import styles from "./category-transition.module.css";
import CategoryMolecularScene from "./category-molecular-scene";

type TransitionRect = { left: number; top: number; width: number; height: number };
export type CategorySelection = {
  id: string;
  label: string;
  image: string;
  count: number;
  href: string;
  rect: TransitionRect;
  imageRect: TransitionRect;
  trigger?: HTMLAnchorElement;
};
type Props = {
  selection: CategorySelection | null;
  onCancel: () => void;
  onNavigate: (href: string, position: { x: number; y: number }) => void;
};
type Phase = "expanding" | "bridge" | "navigating" | "arriving";
const EXPAND_DURATION = 1500;
const bridgeDuration = (category: string) => (category === "emulsifiers" ? 2200 : 1850);
const EXPAND_EASING = "cubic-bezier(.76,0,.24,1)";

function saveStyles(element: HTMLElement, properties: string[]) {
  const saved = properties.map((property) => ({
    property,
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  }));
  return () =>
    saved.forEach(({ property, value, priority }) =>
      value ? element.style.setProperty(property, value, priority) : element.style.removeProperty(property),
    );
}

export default function CategoryTransition({ selection, onCancel, onNavigate }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null),
    surfaceRef = useRef<HTMLDivElement>(null),
    imageRef = useRef<HTMLImageElement>(null);
  const fogRef = useRef<HTMLDivElement>(null),
    captionRef = useRef<HTMLDivElement>(null),
    closeRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null),
    portalCopyRef = useRef<HTMLDivElement>(null),
    washRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<(() => void) | null>(null),
    callbacks = useRef({ onCancel, onNavigate });
  const [stage, setStage] = useState<Phase>("expanding");
  const titleId = useId(),
    descriptionId = useId();
  useLayoutEffect(() => {
    callbacks.current = { onCancel, onNavigate };
  }, [onCancel, onNavigate]);

  useLayoutEffect(() => {
    if (!selection) return;
    const dialog = dialogRef.current!,
      surface = surfaceRef.current!,
      image = imageRef.current!;
    const fog = fogRef.current!,
      caption = captionRef.current!,
      portal = portalRef.current!,
      wash = washRef.current!,
      portalCopy = portalCopyRef.current!;
    const origin = selection,
      target = new URL(origin.href, window.location.href);
    const trigger = origin.trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const scrollX = window.scrollX,
      scrollY = window.scrollY,
      body = document.body,
      html = document.documentElement;
    const restoreBody = saveStyles(body, ["position", "top", "left", "width", "overflow", "padding-right"]);
    const restoreHtml = saveStyles(html, ["overflow", "scroll-behavior"]);
    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth),
      bodyPadding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = origin.imageRect;
    let phase: Phase = "expanding",
      active = true,
      released = false,
      finished = false,
      generation = 0,
      resizeFrame = 0,
      arrivalFrame = 0,
      fallbackTimer = 0;
    let navigationRequested = false,
      animations: Animation[] = [],
      observer: MutationObserver | null = null;
    let deadline = performance.now() + EXPAND_DURATION;
    const validRect = (r: TransitionRect) =>
      [r.left, r.top, r.width, r.height].every(Number.isFinite) && r.width > 0 && r.height > 0;
    setStage("expanding");
    dialog.dataset.phase = "expanding";

    function stopAnimations() {
      generation++;
      animations.forEach((a) => a.cancel());
      animations = [];
      cancelAnimationFrame(resizeFrame);
      resizeFrame = 0;
    }
    function stopPending() {
      clearTimeout(fallbackTimer);
      fallbackTimer = 0;
      cancelAnimationFrame(arrivalFrame);
      arrivalFrame = 0;
      observer?.disconnect();
      observer = null;
    }
    function release(arrived: boolean | null) {
      if (!released) {
        released = true;
        restoreBody();
        restoreHtml();
      }
      if (arrived === null) return;
      const restoreBehavior = saveStyles(html, ["scroll-behavior"]);
      html.style.setProperty("scroll-behavior", "auto", "important");
      window.scrollTo(arrived ? 0 : scrollX, arrived ? 0 : scrollY);
      restoreBehavior();
    }
    function focusDestination() {
      const heading = document.querySelector<HTMLElement>("[data-category-catalog] h1");
      if (!heading) return;
      const old = heading.getAttribute("tabindex");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      heading.addEventListener(
        "blur",
        () => {
          if (old === null) heading.removeAttribute("tabindex");
          else heading.setAttribute("tabindex", old);
        },
        { once: true },
      );
    }
    function finish(arrived: boolean | null, notify = true, restoreFocus = true) {
      if (finished) return;
      finished = true;
      active = false;
      stopPending();
      stopAnimations();
      if (dialog.open) dialog.close();
      release(arrived);
      if (restoreFocus) {
        if (arrived === true) focusDestination();
        else if (arrived === false && trigger?.isConnected) trigger.focus({ preventScroll: true });
      }
      if (notify) callbacks.current.onCancel();
    }
    function cancel() {
      // Client navigation cannot be safely rolled back after router.push begins.
      if (!active || navigationRequested) return;
      finish(false);
    }
    cancelRef.current = cancel;
    function switchPhase(next: Phase) {
      phase = next;
      dialog.dataset.phase = next;
      setStage(next);
    }
    function run(list: Animation[], then: () => void) {
      animations.push(...list);
      const token = ++generation;
      Promise.all(list.map((a) => a.finished))
        .then(() => {
          if (active && token === generation) then();
        })
        .catch(() => {
          /* Deliberate cancellation, resize or navigation. */
        });
    }
    function nativeNavigation() {
      if (!active) return;
      stopPending();
      try {
        if (window.location.pathname === target.pathname) window.location.replace(target.href);
        else window.location.assign(target.href);
      } catch {
        navigationRequested = false;
        finish(false);
      }
    }
    function destinationReady() {
      return (
        window.location.pathname === target.pathname &&
        (origin.id === "packaging" || new URLSearchParams(window.location.search).get("category") === origin.id) &&
        document.querySelector<HTMLElement>("[data-category-catalog]")?.dataset.categoryCatalog === origin.id
      );
    }
    function reveal() {
      if (!active || phase !== "navigating" || !destinationReady()) return;
      stopPending();
      switchPhase("arriving");
      release(true);
      // The actual catalog is now rendered beneath the persistent overlay.
      const main = document.getElementById("main");
      if (reduce.matches) {
        finish(true);
        return;
      }
      const entered = main?.animate(
        [
          { opacity: 0.35, transform: "translate3d(0,24px,0)" },
          { opacity: 1, transform: "translate3d(0,0,0)" },
        ],
        { duration: 620, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" },
      );
      const curtain = dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 520,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "forwards",
      });
      run(entered ? [entered, curtain] : [curtain], () => finish(true));
    }
    function checkArrival() {
      if (!active || phase !== "navigating" || arrivalFrame) return;
      if (!destinationReady()) return;
      // A frame boundary ensures the route's first layout is ready for the reveal.
      arrivalFrame = requestAnimationFrame(() => {
        arrivalFrame = 0;
        reveal();
      });
    }
    function navigate() {
      if (!active || navigationRequested) return;
      navigationRequested = true;
      switchPhase("navigating");
      wash.style.opacity = "1";
      portal.style.opacity = "1";
      dialog.focus({ preventScroll: true });
      // Let the router save the gallery's real scroll position under the opaque wash.
      restoreBody();
      const restoreBehavior = saveStyles(html, ["scroll-behavior"]);
      html.style.setProperty("scroll-behavior", "auto", "important");
      window.scrollTo(scrollX, scrollY);
      restoreBehavior();
      observer = new MutationObserver(checkArrival);
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-category-catalog"],
      });
      // Prefetch is opportunistic. A slow or failed client route still has a native fallback.
      fallbackTimer = window.setTimeout(nativeNavigation, 7000);
      try {
        callbacks.current.onNavigate(target.pathname + target.search, { x: scrollX, y: scrollY });
        checkArrival();
      } catch {
        nativeNavigation();
      }
    }
    function bridge() {
      if (!active) return;
      switchPhase("bridge");
      if (reduce.matches) {
        portal.style.opacity = "1";
        wash.style.opacity = "1";
        navigate();
        return;
      }
      const options: KeyframeAnimationOptions = {
        duration: bridgeDuration(origin.id),
        fill: "forwards",
        easing: "linear",
      };
      const list: Animation[] = [
        portal.animate(
          [
            { opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.19 },
            { opacity: 1, offset: 1 },
          ],
          options,
        ),
        caption.animate(
          [
            { opacity: 1, transform: "translate3d(0,0,0)" },
            { opacity: 0, transform: "translate3d(0,-28px,0)" },
          ],
          { duration: 320, fill: "forwards", easing: "ease-in" },
        ),
        portalCopy.animate(
          [
            { opacity: 0, transform: "translate3d(0,22px,0) scale(.92)", offset: 0 },
            { opacity: 1, transform: "translate3d(0,0,0) scale(1)", offset: 0.24 },
            { opacity: 1, transform: "translate3d(0,0,0) scale(1.02)", offset: 0.46 },
            { opacity: 0, transform: "translate3d(0,-20px,0) scale(1.2)", offset: 0.76 },
            { opacity: 0, transform: "translate3d(0,-20px,0) scale(1.2)", offset: 1 },
          ],
          options,
        ),
        wash.animate(
          [
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: 0.72 },
            { opacity: 0.55, offset: 0.87 },
            { opacity: 1, offset: 1 },
          ],
          options,
        ),
      ];
      run(list, navigate);
    }
    function finalImageTransform() {
      const width = window.innerWidth,
        height = window.innerHeight,
        scale = Math.max((width * 1.2) / start.width, (height * 1.2) / start.height);
      return `translate3d(${(width - start.width * scale) / 2 - start.left}px,${(height - start.height * scale) / 2 - start.top}px,0) scale(${scale})`;
    }
    function expand(duration: number, initial: boolean) {
      if (!active || phase !== "expanding") return;
      const from = getComputedStyle(image).transform,
        mask = getComputedStyle(surface).clipPath,
        fogFrom = getComputedStyle(fog).opacity;
      const copy = getComputedStyle(caption),
        copyFrom = { opacity: copy.opacity, transform: copy.transform };
      stopAnimations();
      const options: KeyframeAnimationOptions = { duration, easing: EXPAND_EASING, fill: "forwards" };
      run(
        [
          surface.animate([{ clipPath: mask }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], options),
          image.animate(
            [
              { transform: from === "none" ? "translate3d(0,0,0) scale(1)" : from },
              { transform: finalImageTransform() },
            ],
            options,
          ),
          fog.animate(
            initial
              ? [
                  { opacity: 0, offset: 0 },
                  { opacity: 0, offset: 0.42 },
                  { opacity: 0.76, offset: 0.8 },
                  { opacity: 1, offset: 1 },
                ]
              : [{ opacity: fogFrom }, { opacity: 1 }],
            { duration, easing: "linear", fill: "forwards" },
          ),
          caption.animate(
            initial
              ? [
                  { opacity: 0, transform: "translate3d(0,38px,0)", offset: 0 },
                  { opacity: 0, transform: "translate3d(0,38px,0)", offset: 0.56 },
                  { opacity: 1, transform: "translate3d(0,0,0)", offset: 0.94 },
                  { opacity: 1, transform: "translate3d(0,0,0)", offset: 1 },
                ]
              : [copyFrom, { opacity: 1, transform: "translate3d(0,0,0)" }],
            { duration, easing: "linear", fill: "forwards" },
          ),
        ],
        bridge,
      );
    }
    function resize() {
      if (!active || phase !== "expanding" || resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        const left = Math.max(0, deadline - performance.now());
        if (left) expand(left, false);
        else bridge();
      });
    }
    function preference() {
      if (!reduce.matches || !active) return;
      stopAnimations();
      if (phase === "arriving") {
        finish(true);
        return;
      }
      if (!navigationRequested) {
        portal.style.opacity = "1";
        wash.style.opacity = "1";
        navigate();
      }
    }
    function historyChange() {
      if (!active) return;
      // Browser Back/Forward wins over any queued animation or fallback.
      finish(null, true, false);
    }
    function pagehide() {
      finish(destinationReady(), false, false);
    }
    function pageshow(event: PageTransitionEvent) {
      if (event.persisted) callbacks.current.onCancel();
    }
    function nativeClose() {
      if (active && !navigationRequested) cancel();
    }

    if (!validRect(origin.rect) || !validRect(start)) {
      nativeNavigation();
      return () => {
        active = false;
        stopPending();
        stopAnimations();
      };
    }
    const width = window.innerWidth,
      height = window.innerHeight,
      radius = Math.min(23, origin.rect.width / 2, origin.rect.height / 2);
    surface.style.clipPath = `inset(${origin.rect.top}px ${width - origin.rect.left - origin.rect.width}px ${height - origin.rect.top - origin.rect.height}px ${origin.rect.left}px round ${radius}px)`;
    Object.assign(image.style, {
      left: `${start.left}px`,
      top: `${start.top}px`,
      width: `${start.width}px`,
      height: `${start.height}px`,
      transform: "translate3d(0,0,0) scale(1)",
    });
    fog.style.opacity = "0";
    caption.style.opacity = "0";
    caption.style.transform = "translate3d(0,38px,0)";
    portal.style.opacity = "0";
    wash.style.opacity = "0";
    portalCopy.style.opacity = "0";
    dialog.style.opacity = "1";
    html.style.setProperty("overflow", "hidden", "important");
    body.style.setProperty("position", "fixed", "important");
    body.style.setProperty("top", `${-scrollY}px`, "important");
    body.style.setProperty("left", `${-scrollX}px`, "important");
    body.style.setProperty("width", "100%", "important");
    body.style.setProperty("overflow", "hidden", "important");
    body.style.setProperty("padding-right", `${bodyPadding + scrollbarWidth}px`, "important");
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pagehide", pagehide);
    window.addEventListener("pageshow", pageshow);
    window.addEventListener("popstate", historyChange);
    reduce.addEventListener("change", preference);
    dialog.addEventListener("close", nativeClose);
    try {
      dialog.showModal();
      closeRef.current?.focus({ preventScroll: true });
      deadline = performance.now() + EXPAND_DURATION;
      expand(EXPAND_DURATION, true);
    } catch {
      nativeNavigation();
    }
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pagehide", pagehide);
      window.removeEventListener("pageshow", pageshow);
      window.removeEventListener("popstate", historyChange);
      reduce.removeEventListener("change", preference);
      dialog.removeEventListener("close", nativeClose);
      cancelRef.current = null;
      finish(destinationReady(), false, false);
    };
  }, [selection]);

  if (!selection) return null;
  const committed = stage === "navigating" || stage === "arriving";
  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        cancelRef.current?.();
      }}
    >
      <div ref={surfaceRef} className={styles.surface}>
        <img
          ref={imageRef}
          className={styles.image}
          src={selection.image}
          alt=""
          decoding="sync"
        />
        <div ref={fogRef} className={styles.fog} aria-hidden="true" />
        <div ref={captionRef} className={styles.caption}>
          <p className={styles.eyebrow}>
            {selection.id === "packaging" ? "Packaging collection" : "Ingredient family"}
          </p>
          <h2 id={titleId}>{selection.label}</h2>
          <p id={descriptionId} className={styles.count}>
            {selection.count.toLocaleString("en-US")}{" "}
            {selection.id === "packaging" ? "packaging references" : "ingredients"} to explore
          </p>
        </div>
      </div>
      <div ref={portalRef} className={styles.portal} aria-hidden="true">
        <CategoryMolecularScene
          category={selection.id}
          active={stage === "bridge"}
          duration={bridgeDuration(selection.id)}
          className={styles.molecularScene}
        />
        <div className={styles.portalShade} />
        <div ref={portalCopyRef} className={styles.portalCopy}>
          <span>{selection.id === "packaging" ? "Explore packaging" : "Explore the ingredients"}</span>
          <strong>{selection.label}</strong>
          <small>{selection.count.toLocaleString("en-US")} starting points</small>
        </div>
        <div ref={washRef} className={styles.wash} />
      </div>
      {stage === "navigating" && (
        <span className={styles.loading} role="status">
          {selection.id === "packaging" ? "Opening packaging…" : "Opening ingredients…"}
        </span>
      )}
      <button
        ref={closeRef}
        className={styles.cancel}
        type="button"
        disabled={committed}
        aria-hidden={committed || undefined}
        onClick={() => cancelRef.current?.()}
        aria-label="Cancel category navigation"
      >
        <span>Cancel</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </dialog>
  );
}
