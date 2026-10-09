"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import CategoryTransition, { type CategorySelection } from "./category-transition";

type Navigation = { selection: CategorySelection | null; start: (selection: CategorySelection) => boolean };
const Context = createContext<Navigation | null>(null);

/** The overlay survives the category route, so the catalog can appear beneath it. */
export function CategoryNavigation({ children }: { children: ReactNode }) {
  const router = useRouter(),
    pathname = usePathname();
  const returnPosition = useRef<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<CategorySelection | null>(null);
  const active = useRef(false);
  const start = useCallback(
    (next: CategorySelection) => {
      if (active.current) return false;
      active.current = true;
      setSelection(next);
      try {
        router.prefetch(next.href);
      } catch {
        /* Navigation remains available without prefetch. */
      }
      return true;
    },
    [router],
  );
  const clear = useCallback(() => {
    active.current = false;
    setSelection(null);
  }, []);
  const navigate = useCallback(
    (href: string, position: { x: number; y: number }) => {
      returnPosition.current = position;
      router.push(href, { scroll: false });
    },
    [router],
  );
  useLayoutEffect(() => {
    if (pathname !== "/categories" || selection || !returnPosition.current) return;
    const position = returnPosition.current;
    returnPosition.current = null;
    let frame = 0,
      settle = 0;
    const restore = () => {
      const html = document.documentElement,
        old = html.style.getPropertyValue("scroll-behavior"),
        priority = html.style.getPropertyPriority("scroll-behavior");
      html.style.setProperty("scroll-behavior", "auto", "important");
      window.scrollTo(position.x, position.y);
      if (old) html.style.setProperty("scroll-behavior", old, priority);
      else html.style.removeProperty("scroll-behavior");
    };
    // Restore after the route has mounted and the router's own scroll pass settles.
    const ready = () => {
      if (!document.querySelector("[data-cg-root]")) return;
      observer.disconnect();
      frame = requestAnimationFrame(() => {
        restore();
        settle = requestAnimationFrame(restore);
      });
    };
    const observer = new MutationObserver(ready);
    observer.observe(document.body, { childList: true, subtree: true });
    ready();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settle);
    };
  }, [pathname, selection]);
  const value = useMemo(() => ({ selection, start }), [selection, start]);
  return (
    <Context.Provider value={value}>
      {children}
      <CategoryTransition selection={selection} onCancel={clear} onNavigate={navigate} />
    </Context.Provider>
  );
}

export function useCategoryNavigation() {
  const value = useContext(Context);
  if (!value) throw new Error("Category navigation requires its provider.");
  return value;
}
