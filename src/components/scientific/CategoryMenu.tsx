'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { Category } from '@/lib/types';
import { ImagePlaceholderIcon } from '@/components/icons';

/**
 * The Categories drop-down in the header.
 *
 * Two panes: the top-level categories down the left, the selected one's
 * subcategories as tiles on the right. Hovering a row on the left swaps the
 * right pane — no click needed to look around, a click to commit.
 *
 * Loads `/wholesale/categories/tree` once, on first open, and keeps it — the
 * list changes when someone edits the catalogue, not while a visitor is
 * browsing, so re-fetching on every hover would be the same rows down the
 * wire to render the same menu again.
 */

type CategoryNode = Category & { children?: Category[] };

/** A subcategory tile: image over name, the whole card clickable. */
function CategoryTile({ category, onNavigate }: { category: Category; onNavigate: () => void }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      onClick={onNavigate}
      className="group flex flex-col gap-4 rounded-lg border border-sci-border bg-white p-4 transition hover:border-sci-blue hover:shadow-sm"
    >
      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-sci-pale">
        {category.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholderIcon className="h-5 w-5 text-sci-border" />
        )}
      </span>

      <span className="font-sci-body text-sci-label font-medium leading-5 text-sci-navy group-hover:text-sci-blue">
        {category.name}
      </span>
    </Link>
  );
}

export function CategoryMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[] | null>(null);
  const [failed, setFailed] = useState(false);
  /** Which top-level category the right pane is showing. */
  const [activeRoot, setActiveRoot] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  // A pointer leaving the trigger on its way to the panel crosses a few pixels
  // of nothing between them; closing instantly there makes the menu feel like
  // it is dodging the cursor.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!open || categories || failed) return;
    let cancelled = false;

    customerApi
      .get<CategoryNode[]>('/wholesale/categories/tree')
      .then((data) => {
        if (cancelled) return;
        setCategories(data);
        // Open on the first category that actually has subcategories, so the
        // right pane is not empty on the first frame if it needn't be.
        setActiveRoot((data.find((c) => (c.children?.length ?? 0) > 0) ?? data[0])?.id ?? null);
      })
      // The menu is an enhancement over a link that already works. If the
      // fetch fails, fall back to that link rather than parking an error
      // message in the header.
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [open, categories, failed]);

  // Escape closes and returns focus to the trigger; a click outside closes.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        wrapRef.current?.querySelector('button')?.focus();
      }
    }
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  if (failed) {
    return (
      <Link
        href="/categories"
        className={`font-sci-body text-sci-label font-medium leading-5 transition ${
          active ? 'text-sci-blue' : 'text-sci-navy hover:text-sci-blue'
        }`}
      >
        Categories
      </Link>
    );
  }

  const roots = categories || [];
  const panelRoot = roots.find((c) => c.id === activeRoot) || roots[0];
  const children = panelRoot?.children || [];

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        // The teal rule marks "you are on this page", the same as every other
        // nav item — opening the panel is not being on the page, so it only
        // changes the label colour.
        className={`flex items-center gap-1.5 font-sci-body text-sci-label font-medium leading-5 transition ${
          active
            ? 'text-sci-blue md:border-b-2 md:border-sci-accent md:pb-1'
            : 'text-sci-navy hover:text-sci-blue'
        }`}
      >
        Categories
        <span
          aria-hidden
          className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-3 w-[min(94vw,940px)] overflow-hidden rounded-xl border border-sci-border bg-white shadow-[0_24px_60px_-24px_rgba(5,28,48,0.35)]">
          {!categories ? (
            <p className="px-6 py-10 font-sci-body text-sci-label text-sci-muted">
              Loading categories…
            </p>
          ) : (
            <div className="grid grid-cols-[260px_1fr]">
              {/* Left — the top-level categories */}
              <div className="flex flex-col border-r border-sci-border bg-sci-pale">
                <p className="px-6 pb-3 pt-5 font-sci-body text-sci-eyebrow font-semibold uppercase tracking-wide text-sci-muted">
                  Main categories
                </p>

                <ul className="scrollbar-slim-light max-h-[440px] flex-1 overflow-y-auto pb-3">
                  {roots.map((root) => {
                    const isActive = root.id === panelRoot?.id;
                    return (
                      <li key={root.id}>
                        {/* A link, not a button: these are real destinations,
                            and a category with no subcategories has nothing
                            for the right pane to reveal. Hover and focus still
                            swap the pane without navigating. */}
                        <Link
                          href={`/categories/${root.slug}`}
                          onClick={() => setOpen(false)}
                          onMouseEnter={() => setActiveRoot(root.id)}
                          onFocus={() => setActiveRoot(root.id)}
                          className={`flex items-center justify-between gap-3 px-6 py-2.5 font-sci-body text-sci-label transition ${
                            isActive
                              ? 'bg-white font-semibold text-sci-navy'
                              : 'text-sci-muted hover:text-sci-navy'
                          }`}
                        >
                          {root.name}
                          <span
                            aria-hidden
                            className={`shrink-0 transition ${
                              isActive ? 'text-sci-blue' : 'text-sci-border'
                            }`}
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Always here, and always /categories — the "View all" button
                    on the right follows whichever root is selected, so it can
                    never be the way to reach the full index. Pinned below the
                    scrolling list so a long catalogue cannot push it out of
                    sight. */}
                <Link
                  href="/categories"
                  onClick={() => setOpen(false)}
                  className="mt-auto flex items-center justify-between gap-3 border-t border-sci-border px-6 py-3.5 font-sci-body text-sci-label font-semibold text-sci-blue transition hover:bg-white"
                >
                  All categories
                  <span aria-hidden className="shrink-0">
                    →
                  </span>
                </Link>
              </div>

              {/* Right — that category's subcategories */}
              <div className="flex max-h-[520px] flex-col">
                <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sci-body text-sci-eyebrow font-semibold uppercase tracking-wide text-sci-muted">
                      Browse
                    </span>
                    <span className="font-sci-heading text-[20px] font-semibold leading-7 text-sci-navy">
                      {panelRoot?.name || 'Ingredient categories'}
                    </span>
                  </div>

                  <Link
                    href={panelRoot ? `/categories/${panelRoot.slug}` : '/categories'}
                    onClick={() => setOpen(false)}
                    className="shrink-0 rounded-full border border-sci-border px-4 py-2 font-sci-body text-sci-label font-medium text-sci-navy transition hover:border-sci-blue hover:text-sci-blue"
                  >
                    View all →
                  </Link>
                </div>

                <div className="scrollbar-slim-light flex-1 overflow-y-auto px-6 pb-6">
                  {children.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                      {children.map((child) => (
                        <CategoryTile
                          key={child.id}
                          category={child}
                          onNavigate={() => setOpen(false)}
                        />
                      ))}
                    </div>
                  ) : (
                    // Not every category is subdivided. Rather than leave the
                    // pane blank, send people to the products — which is what
                    // they opened the menu for.
                    <Link
                      href={panelRoot ? `/categories/${panelRoot.slug}` : '/categories'}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-4 rounded-lg border border-sci-border bg-white p-4 transition hover:border-sci-blue hover:shadow-sm"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sci-pale">
                        {panelRoot?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={panelRoot.imageUrl}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImagePlaceholderIcon className="h-5 w-5 text-sci-border" />
                        )}
                      </span>

                      <span className="flex flex-col gap-0.5">
                        <span className="font-sci-body text-sci-label font-medium text-sci-navy group-hover:text-sci-blue">
                          Browse {panelRoot?.name}
                        </span>
                        <span className="font-sci-body text-sci-eyebrow text-sci-muted">
                          No subcategories — every record in one list
                        </span>
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
