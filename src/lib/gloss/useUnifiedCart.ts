'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { addToCart, removeFromCart, updateCartQuantity, useCart } from '@/lib/cartStore';
import { addToQuoteList } from '@/lib/quoteListStore';
import { ServerCart } from '@/lib/types';
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

/**
 * "Request" — the prototype's action for anything without a price. Here that
 * is our quote list: server-side when signed in, localStorage otherwise.
 */
export async function addProductToQuoteList(
  product: AddableProduct & { id: string },
  variantLabel: string | null = null,
  quantity = 1,
) {
  const payload = {
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    variantLabel,
    imageUrl: product.imageUrl || null,
    quantity,
  };
  try {
    if (getCustomerToken()) {
      await customerApi.post('/quote-list/items', payload);
      window.dispatchEvent(new Event('cocojojochem-server-quote-list-changed'));
    } else {
      addToQuoteList(payload);
    }
    notify('Added to your quote list');
    return true;
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Could not add to your quote list. Try again.');
    return false;
  }
}
