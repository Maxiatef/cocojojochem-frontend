'use client';

import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { Product } from '@/lib/types';
import { WISHLIST_SERVER_KEY, useWishlistState } from '@/lib/useWishlistState';

type ServerWishlistItem = { id: string; productId: string; savedAt: string; product: Product };

/**
 * The visitor's saved products, resolved to full catalog products.
 *
 * Same loading split the old /account/wishlist page used: a signed-in
 * customer's list comes from `/wishlist` (products embedded), a guest's ids
 * from localStorage are resolved in one `/wholesale/products/by-ids` call.
 * The result is filtered by the live id list, so un-saving a card removes it
 * at once instead of after the refetch.
 */
export function useSavedProducts() {
  const { ids } = useWishlistState();
  // null until the token has been read, so neither list flashes as empty.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setSignedIn(!!getCustomerToken());
    sync();
    window.addEventListener('customer-auth-changed', sync);
    return () => window.removeEventListener('customer-auth-changed', sync);
  }, []);

  const { data: serverItems, isLoading: loadingServer } = useQuery({
    queryKey: ['customer-wishlist'],
    queryFn: () => customerApi.get<ServerWishlistItem[]>('/wishlist'),
    enabled: signedIn === true,
  });

  const guestIds = signedIn === false ? ids : [];
  const { data: guestProducts, isLoading: loadingGuest } = useQuery({
    queryKey: ['guest-wishlist-products', guestIds.join(',')],
    queryFn: () => customerApi.get<Product[]>(`/wholesale/products/by-ids?ids=${guestIds.join(',')}`),
    enabled: signedIn === false && guestIds.length > 0,
    // Un-saving one changes the key; keep the old list (filtered below)
    // rather than dropping back to "Loading…" for the refetch.
    placeholderData: keepPreviousData,
  });

  // The signed-in id list (shared cache with every heart on the page). Until
  // it arrives there is nothing to filter by, so the embedded list is shown.
  const { data: serverIds } = useQuery({
    queryKey: WISHLIST_SERVER_KEY,
    queryFn: () => customerApi.get<string[]>('/wishlist/ids'),
    enabled: signedIn === true,
  });

  const all: Product[] = signedIn
    ? (serverItems || []).map((i) => i.product)
    : guestIds.length
      ? guestProducts || []
      : [];
  const live = signedIn ? serverIds : ids;
  const products = all.filter((p) => p && (!live || live.includes(p.id)));

  const loading =
    signedIn === null || (signedIn ? loadingServer : guestIds.length > 0 && loadingGuest);

  return { products, loading, signedIn: !!signedIn };
}
