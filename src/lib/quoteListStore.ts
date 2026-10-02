'use client';

import { useEffect, useState } from 'react';

// A guest's request list ("Price to confirm" in the cart): items we price on
// request. Signed-in customers keep theirs on the server (/quote-list); this
// one is merged in at sign-in via POST /quote-list/merge.
//
// Two kinds of line: a product from our catalog (productId), or a material
// from the supplier reference library, which is not in our catalog
// (source SUPPLIER_REFERENCE, identified by referenceCode).

const QUOTE_LIST_KEY = 'cocojojochem_quote_list';
const QUOTE_LIST_EVENT = 'cocojojochem-quote-list-changed';

export type QuoteLineSource = 'COCOJOJO' | 'SUPPLIER_REFERENCE';

export interface QuoteListItem {
  source?: QuoteLineSource;
  productId: string | null;
  referenceCode?: string | null;
  sourceUrl?: string | null;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
}

/** Stable identity of a line: what it is plus the size asked for. */
export function quoteLineKey(item: Pick<QuoteListItem, 'source' | 'productId' | 'referenceCode' | 'variantLabel'>) {
  const target = item.source === 'SUPPLIER_REFERENCE' ? `ref:${item.referenceCode}` : `p:${item.productId}`;
  return `${target}|${item.variantLabel ?? ''}`;
}

function readQuoteList(): QuoteListItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(QUOTE_LIST_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (i) => i && (typeof i.productId === 'string' || (i.source === 'SUPPLIER_REFERENCE' && i.referenceCode)),
    );
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
  const existing = items.find((i) => quoteLineKey(i) === quoteLineKey(item));
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  writeQuoteList(items);
}

export function updateQuoteListQuantity(key: string, quantity: number) {
  writeQuoteList(
    readQuoteList()
      .map((i) => (quoteLineKey(i) === key ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0),
  );
}

export function removeFromQuoteList(key: string) {
  writeQuoteList(readQuoteList().filter((i) => quoteLineKey(i) !== key));
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

/**
 * Shape expected by the backend's POST /quote-list/merge. Only the fields the
 * DTO accepts (the API rejects unknown ones), and only those that apply to
 * each kind of line.
 */
export function getQuoteListAsMergePayload() {
  return readQuoteList().map((i) =>
    i.source === 'SUPPLIER_REFERENCE'
      ? {
          source: 'SUPPLIER_REFERENCE' as const,
          referenceCode: i.referenceCode,
          sourceUrl: i.sourceUrl || undefined,
          productSlug: i.productSlug,
          productName: i.productName,
          variantLabel: i.variantLabel,
          imageUrl: i.imageUrl,
          quantity: i.quantity,
        }
      : {
          productId: i.productId,
          productSlug: i.productSlug,
          productName: i.productName,
          variantLabel: i.variantLabel,
          imageUrl: i.imageUrl,
          quantity: i.quantity,
        },
  );
}
