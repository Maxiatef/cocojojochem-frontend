'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { addToCart, removeFromCart, updateCartQuantity, useCart } from '@/lib/cartStore';
import {
  addToQuoteList,
  clearQuoteList,
  quoteLineKey,
  removeFromQuoteList,
  updateQuoteListQuantity,
  useQuoteList,
} from '@/lib/quoteListStore';
import { ServerCart, ServerQuoteListItem } from '@/lib/types';
import { categoryImage } from './images';
import { notify, openCartDrawer } from './stores';

/**
 * One cart, whichever side of sign-in the visitor is on.
 *
 * Guests keep their cart in localStorage (cartStore); signed-in customers have
 * a server cart. The drawer and the cart page render `lines` and call
 * `update` / `remove` without caring which one is behind it — the same split
 * the old cart page handled with two separate views.
 */
export interface CartLine {
  /** variantId for guests, cart-item id for customers — what update/remove take. */
  key: string;
  slug: string;
  name: string;
  label: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const sync = () => setSignedIn(!!getCustomerToken());
    sync();
    window.addEventListener('customer-auth-changed', sync);
    return () => window.removeEventListener('customer-auth-changed', sync);
  }, []);
  return signedIn;
}

function serverChanged(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['customer-cart'] });
  queryClient.invalidateQueries({ queryKey: ['customer-cart-summary'] });
  window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
}

export function useUnifiedCart() {
  const signedIn = useSignedIn();
  const guest = useCart();
  const queryClient = useQueryClient();

  const { data: server, isLoading } = useQuery({
    queryKey: ['customer-cart'],
    queryFn: () => customerApi.get<ServerCart>('/cart'),
    enabled: signedIn,
  });

  const lines: CartLine[] = useMemo(() => {
    if (signedIn) {
      return (server?.items || []).map((i) => {
        const p = i.variant?.product;
        return {
          key: i.id,
          slug: p?.slug || '',
          name: p?.name || i.variant?.label || 'Ingredient',
          label: i.variant?.label || '',
          image: i.variant?.imageUrl || p?.imageUrl || categoryImage(p?.category?.slug || p?.category?.name),
          unitPrice: Number(i.price),
          quantity: i.quantity,
        };
      });
    }
    return guest.items.map((i) => ({
      key: i.variantId,
      slug: i.productSlug,
      name: i.productName,
      label: i.variantLabel,
      image: i.imageUrl || categoryImage(i.productName),
      unitPrice: i.price,
      quantity: i.quantity,
    }));
  }, [signedIn, server, guest.items]);

  const updateServer = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      customerApi.patch(`/cart/items/${id}`, { quantity }),
    onSuccess: () => serverChanged(queryClient),
  });
  const removeServer = useMutation({
    mutationFn: (id: string) => customerApi.delete(`/cart/items/${id}`),
    onSuccess: () => serverChanged(queryClient),
  });

  const update = useCallback(
    (key: string, quantity: number) => {
      if (signedIn) updateServer.mutate({ id: key, quantity });
      else updateCartQuantity(key, quantity);
    },
    [signedIn, updateServer],
  );

  const remove = useCallback(
    (key: string) => {
      if (signedIn) removeServer.mutate(key);
      else removeFromCart(key);
      notify('Removed from cart');
    },
    [signedIn, removeServer],
  );

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);

  return {
    signedIn,
    lines,
    count,
    subtotal,
    loaded: !signedIn || !isLoading,
    saving: updateServer.isPending || removeServer.isPending,
    update,
    remove,
  };
}

/** Minimal product shape needed to put a variant in the cart. */
export interface AddableProduct {
  slug: string;
  name: string;
  imageUrl?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
}
export interface AddableVariant {
  id: string;
  label: string;
  sku: string;
  price: string;
  salePrice?: string | null;
  effectivePrice?: string;
  imageUrl?: string | null;
}

/**
 * Add a variant to whichever cart applies, then open the drawer — the
 * prototype's "Add to cart" always shows you the cart it just changed.
 */
export function useAddVariantToCart() {
  const queryClient = useQueryClient();
  return useCallback(
    async (product: AddableProduct, variant: AddableVariant, quantity = 1) => {
      try {
        if (getCustomerToken()) {
          await customerApi.post('/cart/items', { productVariantId: variant.id, quantity });
          serverChanged(queryClient);
        } else {
          addToCart({
            variantId: variant.id,
            productSlug: product.slug,
            productName: product.name,
            variantLabel: variant.label,
            sku: variant.sku,
            price: Number(variant.effectivePrice ?? variant.salePrice ?? variant.price),
            imageUrl: variant.imageUrl || product.imageUrl || categoryImage(product.category?.slug || product.category?.name),
            quantity,
          });
        }
        notify('Added to cart');
        openCartDrawer();
        return true;
      } catch (e) {
        notify(e instanceof Error ? e.message : 'Could not add to cart. Try again.');
        return false;
      }
    },
    [queryClient],
  );
}

/* -------------------------------------------------- request list ("Price to confirm") */

/**
 * One line of the cart's "Price to confirm" group: something we price on
 * request — a catalog product in a size we don't list, or a material from the
 * supplier reference library. Never counted in the cart total.
 */
export interface RequestLine {
  /** cart-item id for customers, quoteLineKey() for guests — what update/remove take. */
  key: string;
  source: 'COCOJOJO' | 'SUPPLIER_REFERENCE';
  productId: string | null;
  referenceCode: string | null;
  sourceUrl: string | null;
  slug: string;
  name: string;
  /** The size asked for, if any. */
  label: string | null;
  image: string;
  quantity: number;
}

function requestListChanged(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['customer-quote-list'] });
  queryClient.invalidateQueries({ queryKey: ['customer-quote-list-summary'] });
  window.dispatchEvent(new Event('cocojojochem-server-quote-list-changed'));
}

/** The request list, whichever side of sign-in the visitor is on. */
export function useRequestList() {
  const signedIn = useSignedIn();
  const guest = useQuoteList();
  const queryClient = useQueryClient();

  const { data: server, isLoading } = useQuery({
    queryKey: ['customer-quote-list'],
    queryFn: () => customerApi.get<ServerQuoteListItem[]>('/quote-list'),
    enabled: signedIn,
  });

  const lines: RequestLine[] = useMemo(() => {
    const rows = signedIn
      ? (server || []).map((i) => ({ ...i, key: i.id }))
      : guest.items.map((i) => ({ ...i, key: quoteLineKey(i) }));
    return rows.map((i) => ({
      key: i.key,
      source: i.source === 'SUPPLIER_REFERENCE' ? 'SUPPLIER_REFERENCE' : 'COCOJOJO',
      productId: i.productId ?? null,
      referenceCode: i.referenceCode ?? null,
      sourceUrl: i.sourceUrl ?? null,
      slug: i.productSlug,
      name: i.productName,
      label: i.variantLabel,
      image: i.imageUrl || categoryImage(i.productName),
      quantity: i.quantity,
    }));
  }, [signedIn, server, guest.items]);

  const updateServer = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      customerApi.patch(`/quote-list/items/${id}`, { quantity }),
    onSuccess: () => requestListChanged(queryClient),
  });
  const removeServer = useMutation({
    mutationFn: (id: string) => customerApi.delete(`/quote-list/items/${id}`),
    onSuccess: () => requestListChanged(queryClient),
  });

  const update = useCallback(
    (key: string, quantity: number) => {
      if (signedIn) updateServer.mutate({ id: key, quantity });
      else updateQuoteListQuantity(key, quantity);
    },
    [signedIn, updateServer],
  );

  const remove = useCallback(
    (key: string) => {
      if (signedIn) removeServer.mutate(key);
      else removeFromQuoteList(key);
      notify('Removed from cart');
    },
    [signedIn, removeServer],
  );

  /** After a request is submitted: the items are with us now. */
  const clear = useCallback(async () => {
    if (signedIn) {
      await customerApi.delete('/quote-list').catch(() => {});
      requestListChanged(queryClient);
    } else {
      clearQuoteList();
    }
  }, [signedIn, queryClient]);

  return {
    signedIn,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    loaded: !signedIn || !isLoading,
    saving: updateServer.isPending || removeServer.isPending,
    update,
    remove,
    clear,
  };
}

/** The "Price to confirm" lines as the order-request items the API takes. */
export function requestItemsPayload(lines: RequestLine[]) {
  return lines.map((l) =>
    l.source === 'SUPPLIER_REFERENCE'
      ? {
          source: 'SUPPLIER_REFERENCE' as const,
          referenceCode: l.referenceCode || undefined,
          sourceUrl: l.sourceUrl || undefined,
          productName: l.name,
          quantity: l.quantity,
          unit: l.label || undefined,
        }
      : {
          productId: l.productId || undefined,
          productName: l.name,
          quantity: l.quantity,
          unit: l.label || undefined,
        },
  );
}

type RequestPayload = {
  source?: 'SUPPLIER_REFERENCE';
  productId?: string;
  referenceCode?: string;
  sourceUrl?: string;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
};

async function addToRequestList(payload: RequestPayload, opened = true) {
  try {
    if (getCustomerToken()) {
      await customerApi.post('/quote-list/items', payload);
      window.dispatchEvent(new Event('cocojojochem-server-quote-list-changed'));
    } else {
      addToQuoteList({
        source: payload.source ?? 'COCOJOJO',
        productId: payload.productId ?? null,
        referenceCode: payload.referenceCode ?? null,
        sourceUrl: payload.sourceUrl ?? null,
        productSlug: payload.productSlug,
        productName: payload.productName,
        variantLabel: payload.variantLabel,
        imageUrl: payload.imageUrl,
        quantity: payload.quantity,
      });
    }
    notify('Added to cart — price to confirm');
    if (opened) openCartDrawer();
    return true;
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Could not add to your cart. Try again.');
    return false;
  }
}

/**
 * "Request" on one of our products without a listed price or size: goes into
 * the cart's "Price to confirm" group.
 */
export function addProductToQuoteList(
  product: AddableProduct & { id: string },
  variantLabel: string | null = null,
  quantity = 1,
) {
  return addToRequestList({
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    variantLabel,
    imageUrl: product.imageUrl || null,
    quantity,
  });
}

/** A supplier reference library entry, as the cart needs it. */
export interface ReferenceAddable {
  slug: string;
  name: string;
  category: string;
  sourceUrl: string;
  /** Card photo; defaults to the category's representative image. */
  image?: string;
}

/**
 * "Add to cart" on a supplier-reference material: it has no price, so it
 * joins the cart's "Price to confirm" group and we source and price it.
 */
export function addReferenceToCart(entry: ReferenceAddable, size: string | null = null, quantity = 1) {
  return addToRequestList({
    source: 'SUPPLIER_REFERENCE',
    referenceCode: entry.slug,
    sourceUrl: entry.sourceUrl,
    productSlug: entry.slug,
    productName: entry.name,
    variantLabel: size?.trim() || null,
    imageUrl: entry.image || categoryImage(entry.category),
    quantity,
  });
}
