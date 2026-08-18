'use client';

import { useCallback, useEffect, useState } from 'react';

// Guest cart lives entirely in localStorage, matching the real cocojojo.com
// wholesale site's behavior — no server round-trip until the customer logs in,
// at which point CartMergePrompt (see checkout/login flow) pushes these items
// to POST /cart/merge and clears local storage.
const CART_KEY = 'cocojojochem_cart';
const CART_EVENT = 'cocojojochem-cart-changed';

export interface LocalCartItem {
  variantId: number;
  productSlug: string;
  productName: string;
  variantLabel: string;
  sku: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

function readCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(item: LocalCartItem) {
  const items = readCart();
  const existing = items.find((i) => i.variantId === item.variantId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  writeCart(items);
}

export function updateCartQuantity(variantId: number, quantity: number) {
  const items = readCart()
    .map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  writeCart(items);
}

export function removeFromCart(variantId: number) {
  writeCart(readCart().filter((i) => i.variantId !== variantId));
}

export function clearCart() {
  writeCart([]);
}

export function getCart(): LocalCartItem[] {
  return readCart();
}

export function useCart() {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
    const onChange = () => setItems(readCart());
    window.addEventListener(CART_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(CART_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    itemCount,
    subtotal,
    add: addToCart,
    updateQuantity: updateCartQuantity,
    remove: removeFromCart,
    clear: clearCart,
  };
}

export const useAddToCart = () => useCallback(addToCart, []);

// Shape expected by the backend's POST /cart/merge (AddCartItemDto[]).
export function getCartAsMergePayload() {
  return readCart().map((i) => ({ productVariantId: i.variantId, quantity: i.quantity }));
}
