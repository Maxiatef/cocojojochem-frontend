'use client';

import { useEffect, useState } from 'react';

// Lets a customer add multiple products to a running "quote list" while
// browsing (mirrors cartStore.ts's localStorage pattern), then submit ONE
// consolidated quote request covering all of them from /quote-request,
// instead of having to fill out the contact form separately for every
// single product they want pricing on.
const QUOTE_LIST_KEY = 'cocojojochem_quote_list';
const QUOTE_LIST_EVENT = 'cocojojochem-quote-list-changed';

export interface QuoteListItem {
  productId: number;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
}

function readQuoteList(): QuoteListItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(QUOTE_LIST_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQuoteList(items: QuoteListItem[]) {
  localStorage.setItem(QUOTE_LIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(QUOTE_LIST_EVENT));
}

export function addToQuoteList(item: QuoteListItem) {
  const items = readQuoteList();
  const existing = items.find((i) => i.productId === item.productId && i.variantLabel === item.variantLabel);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  writeQuoteList(items);
}

export function updateQuoteListQuantity(productId: number, variantLabel: string | null, quantity: number) {
  const items = readQuoteList()
    .map((i) => (i.productId === productId && i.variantLabel === variantLabel ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  writeQuoteList(items);
}

export function removeFromQuoteList(productId: number, variantLabel: string | null) {
  writeQuoteList(readQuoteList().filter((i) => !(i.productId === productId && i.variantLabel === variantLabel)));
}

export function clearQuoteList() {
  writeQuoteList([]);
}

export function getQuoteList(): QuoteListItem[] {
  return readQuoteList();
}

export function useQuoteList() {
  const [items, setItems] = useState<QuoteListItem[]>([]);

  useEffect(() => {
    setItems(readQuoteList());
    const onChange = () => setItems(readQuoteList());
    window.addEventListener(QUOTE_LIST_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(QUOTE_LIST_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return {
    items,
    count: items.length,
    add: addToQuoteList,
    updateQuantity: updateQuoteListQuantity,
    remove: removeFromQuoteList,
    clear: clearQuoteList,
  };
}

// Shape expected by the backend's POST /quote-list/merge (AddQuoteListItemDto[]).
export function getQuoteListAsMergePayload() {
  return readQuoteList();
}
