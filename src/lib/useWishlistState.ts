'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { addToWishlist, removeFromWishlist, useWishlist } from '@/lib/wishlistStore';

export const WISHLIST_SERVER_KEY = ['customer-wishlist-ids'] as const;

/**
 * Which products the current visitor has saved, and how to toggle one —
 * whichever side of the sign-in line they are on.
 *
 * Signed in, the ids come from the API (one cached array serves every heart on
 * the page); as a guest, from localStorage. Callers never need to know which.
 */
export function useWishlistState() {
  const queryClient = useQueryClient();
  const { ids: localIds } = useWishlist();
  const [signedIn, setSignedIn] = useState(false);

  // Same listener the storefront session uses, so signing in or out anywhere
  // on the page flips every heart at once.
  useEffect(() => {
    const sync = () => setSignedIn(!!getCustomerToken());
    sync();
    window.addEventListener('customer-auth-changed', sync);
    return () => window.removeEventListener('customer-auth-changed', sync);
  }, []);

  const { data: serverIds } = useQuery({
    queryKey: WISHLIST_SERVER_KEY,
    queryFn: () => customerApi.get<string[]>('/wishlist/ids'),
    enabled: signedIn,
  });

  const ids = signedIn ? serverIds || [] : localIds;

  const toggle = useCallback(
    async (productId: string) => {
      const saved = ids.includes(productId);

      if (!signedIn) {
        if (saved) removeFromWishlist(productId);
        else addToWishlist(productId);
        return !saved;
      }

      // Optimistic: the heart must respond on the click, not on the round
      // trip. A failed request re-fetches, which puts it back.
      queryClient.setQueryData<string[]>(WISHLIST_SERVER_KEY, (prev = []) =>
        saved ? prev.filter((id) => id !== productId) : [productId, ...prev],
      );

      try {
        if (saved) await customerApi.delete(`/wishlist/items/${productId}`);
        else await customerApi.post('/wishlist/items', { productId });
      } finally {
        queryClient.invalidateQueries({ queryKey: WISHLIST_SERVER_KEY });
        queryClient.invalidateQueries({ queryKey: ['customer-wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['customer-wishlist-summary'] });
      }
      return !saved;
    },
    [ids, signedIn, queryClient],
  );

  return { ids, signedIn, has: (productId: string) => ids.includes(productId), toggle };
}
