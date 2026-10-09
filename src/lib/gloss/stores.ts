'use client';

import { useEffect, useState } from 'react';

/**
 * Browser-side stores for the Gloss Studio workspace features: ingredient
 * comparison and formulation projects.
 *
 * Same pattern as cartStore / wishlistStore: localStorage plus a window event,
 * so every component on the page (header badge, card button, compare page)
 * updates together. localStorage stays the live copy for everyone; for a
 * signed-in customer each change is also saved to their account (see
 * workspaceSync.ts), so the lists follow them to other devices.
 */

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Set by workspaceSync.ts; called after a user-made change to a synced key. */
let onLocalChange: ((key: string) => void) | null = null;
export function setWorkspaceChangeListener(fn: ((key: string) => void) | null) {
  onLocalChange = fn;
}

/** `silent` skips the server push — used when applying the server's own copy. */
export function write(key: string, event: string, value: unknown, silent = false) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the in-memory event still updates the page */
  }
  window.dispatchEvent(new Event(event));
  if (!silent) onLocalChange?.(key);
}

function useStore<T>(key: string, event: string, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    window.addEventListener(event, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(event, sync);
      window.removeEventListener('storage', sync);
    };
    // fallback is a constant literal at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, event]);
  return value;
}

/* ---------------------------------------------------------------- toasts */

const TOAST_EVENT = 'gloss-toast';

/** Show the storefront's toast ("Added to comparison", …). */
export function notify(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}

export function useToastMessage(): string {
  const [message, setMessage] = useState('');
  useEffect(() => {
    let timer: number | undefined;
    const on = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(''), 4200);
    };
    window.addEventListener(TOAST_EVENT, on);
    return () => {
      window.removeEventListener(TOAST_EVENT, on);
      window.clearTimeout(timer);
    };
  }, []);
  return message;
}

/* ------------------------------------------------------------ cart drawer */

const DRAWER_EVENT = 'gloss-open-cart';

export function openCartDrawer() {
  window.dispatchEvent(new Event(DRAWER_EVENT));
}

export function useCartDrawerOpener(onOpen: () => void) {
  useEffect(() => {
    window.addEventListener(DRAWER_EVENT, onOpen);
    return () => window.removeEventListener(DRAWER_EVENT, onOpen);
  }, [onOpen]);
}

/* -------------------------------------------------------------- compare */

/** Enough of a product to render a comparison column without refetching. */
export interface CompareItem {
  slug: string;
  name: string;
}

export const COMPARE_KEY = 'cocojojochem_compare';
export const COMPARE_EVENT = 'cocojojochem-compare-changed';
export const COMPARE_LIMIT = 4;

export function getCompare(): CompareItem[] {
  return read<CompareItem[]>(COMPARE_KEY, []);
}

export function useCompare(): CompareItem[] {
  return useStore<CompareItem[]>(COMPARE_KEY, COMPARE_EVENT, []);
}

/** Add or remove; returns whether the item is now in the comparison. */
export function toggleCompare(item: CompareItem): boolean {
  const list = getCompare();
  if (list.some((i) => i.slug === item.slug)) {
    write(COMPARE_KEY, COMPARE_EVENT, list.filter((i) => i.slug !== item.slug));
    notify('Removed from comparison');
    return false;
  }
  if (list.length >= COMPARE_LIMIT) {
    notify('Compare up to four ingredients. Remove one to add another.');
    return false;
  }
  write(COMPARE_KEY, COMPARE_EVENT, [...list, item]);
  notify('Added to comparison');
  return true;
}

export function removeFromCompare(slug: string) {
  write(COMPARE_KEY, COMPARE_EVENT, getCompare().filter((i) => i.slug !== slug));
}

export function clearCompare() {
  write(COMPARE_KEY, COMPARE_EVENT, []);
}

/* ------------------------------------------------------------- projects */

export interface ProjectItem {
  slug: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  notes: string;
  items: ProjectItem[];
  createdAt: string;
  updatedAt: string;
}

export const PROJECTS_KEY = 'cocojojochem_projects';
export const PROJECTS_EVENT = 'cocojojochem-projects-changed';

export function getProjects(): Project[] {
  return read<Project[]>(PROJECTS_KEY, []);
}

export function useProjects(): Project[] {
  return useStore<Project[]>(PROJECTS_KEY, PROJECTS_EVENT, []);
}

function saveProjects(list: Project[]) {
  write(PROJECTS_KEY, PROJECTS_EVENT, list);
}

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

export function createProject(name: string, notes = ''): Project {
  const now = new Date().toISOString();
  const project: Project = { id: newId(), name: name.trim() || 'Untitled project', notes, items: [], createdAt: now, updatedAt: now };
  saveProjects([project, ...getProjects()]);
  notify('Project created');
  return project;
}

export function updateProject(id: string, patch: Partial<Pick<Project, 'name' | 'notes' | 'items'>>) {
  saveProjects(
    getProjects().map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
  );
}

export function deleteProject(id: string) {
  saveProjects(getProjects().filter((p) => p.id !== id));
  notify('Project deleted');
}

export function addToProject(id: string, item: ProjectItem) {
  const p = getProjects().find((x) => x.id === id);
  if (!p) return;
  if (p.items.some((i) => i.slug === item.slug)) {
    notify(`Already in ${p.name}`);
    return;
  }
  updateProject(id, { items: [...p.items, item] });
  notify(`Added to ${p.name}`);
}

export function removeFromProject(id: string, slug: string) {
  const p = getProjects().find((x) => x.id === id);
  if (!p) return;
  updateProject(id, { items: p.items.filter((i) => i.slug !== slug) });
}

/* ------------------------------------------------- saved supplier references */

/**
 * Wishlist entries for supplier-reference materials. Our account wishlist is
 * keyed by catalog product id, which references don't have, so they are kept
 * here (same localStorage + event pattern as compare) and shown alongside it.
 */
export interface SavedReference {
  slug: string;
  name: string;
}

export const SAVED_REFS_KEY = 'cocojojochem_saved_references';
export const SAVED_REFS_EVENT = 'cocojojochem-saved-references-changed';

export function getSavedReferences(): SavedReference[] {
  return read<SavedReference[]>(SAVED_REFS_KEY, []);
}

export function useSavedReferences(): SavedReference[] {
  return useStore<SavedReference[]>(SAVED_REFS_KEY, SAVED_REFS_EVENT, []);
}

/** Add or remove; returns whether it is now saved. */
export function toggleSavedReference(item: SavedReference): boolean {
  const list = getSavedReferences();
  if (list.some((i) => i.slug === item.slug)) {
    write(SAVED_REFS_KEY, SAVED_REFS_EVENT, list.filter((i) => i.slug !== item.slug));
    notify('Removed from wishlist');
    return false;
  }
  write(SAVED_REFS_KEY, SAVED_REFS_EVENT, [item, ...list].slice(0, 200));
  notify('Saved to your wishlist');
  return true;
}
