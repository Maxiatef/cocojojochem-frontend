'use client';

import { useEffect, useState } from 'react';

// A guest's saved products, held client-side until they sign in — the same
// arrangement cartStore.ts and quoteListStore.ts already use, and merged into
// the account via POST /wishlist/merge at sign-in.
//
// Stores bare product ids rather than product snapshots. A wishlist points at
// whatever a product is *now*, so the page resolves names, prices and stock
// from the API when it renders; caching them here would show a stale price on
// a list people revisit weeks later.
const WISHLIST_KEY = 'cocojojochem_wishlist';
const WISHLIST_EVENT = 'cocojojochem-wishlist-changed';

function readWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    // Defensive: this key is user-writable and survives deploys, so anything
    // that is not a list of ids is treated as an empty list rather than
    // thrown at the render.
    //
    // The string check also quietly clears lists saved before ids became
    // uuids. Those numbers no longer name any product, so dropping them shows
    // an empty wishlist rather than a row of "product not found".
    return Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function addToWishlist(productId: string) {
  const ids = readWishlist();
  if (ids.includes(productId)) return;
  // Newest first, matching the server's `createdAt DESC`.
  writeWishlist([productId, ...ids]);
}

export function removeFromWishlist(productId: string) {
  writeWishlist(readWishlist().filter((id) => id !== productId));
}

export function clearWishlist() {
  writeWishlist([]);
}

export function getWishlist(): string[] {
  return readWishlist();
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readWishlist());
    const onChange = () => setIds(readWishlist());
    window.addEventListener(WISHLIST_EVENT, onChange);
    // `storage` fires in the *other* tabs, so a save in one tab updates the
    // heart in the rest.
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return {
    ids,
    count: ids.length,
    has: (productId: string) => ids.includes(productId),
    add: addToWishlist,
    remove: removeFromWishlist,
    clear: clearWishlist,
  };
}

// Shape expected by the backend's POST /wishlist/merge.
export function getWishlistAsMergePayload() {
  return readWishlist();
}
