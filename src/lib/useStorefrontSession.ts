'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCart, clearCart } from '@/lib/cartStore';
import { useQuoteList, clearQuoteList } from '@/lib/quoteListStore';
import { customerApi } from '@/lib/customerApi';
import {
  clearCustomerToken,
  decodeCustomerToken,
  getCustomerRefreshToken,
  getCustomerToken,
} from '@/lib/customerAuth';

/**
 * The signed-in customer, their cart count, their quote-list count, and how to
 * sign out — everything a storefront header needs to render its icons.
 *
 * Extracted from StorefrontHeader when the "Scientific edition" header arrived:
 * the two headers coexist for the length of the rebrand, and duplicating this
 * would mean two copies of the guest/server switch, the cross-tab auth
 * listener, and the two custom-event invalidations. Those are exactly the
 * details that drift apart silently — a cart badge that stops updating in one
 * header and not the other is very hard to notice.
 *
 * Both counts follow the same rule: a signed-in customer has a server-persisted
 * cart and quote list, so their counts come from the API; a guest's come from
 * localStorage.
 */
export function useStorefrontSession() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { itemCount: localItemCount } = useCart();
  const { count: localQuoteListCount } = useQuoteList();
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  // `customer-auth-changed` is dispatched by the auth helpers, so signing in or
  // out anywhere in the app updates every header on the page.
  useEffect(() => {
    function syncAuth() {
      const token = getCustomerToken();
      const payload = token ? decodeCustomerToken(token) : null;
      setCustomerEmail(payload?.email || null);
    }
    syncAuth();
    window.addEventListener('customer-auth-changed', syncAuth);
    return () => window.removeEventListener('customer-auth-changed', syncAuth);
  }, []);

  const { data: serverCartSummary } = useQuery({
    queryKey: ['customer-cart-summary'],
    queryFn: () => customerApi.get<{ itemCount: number }>('/cart/summary'),
    enabled: !!customerEmail,
  });

  useEffect(() => {
    if (!customerEmail) return;
    function onServerCartChanged() {
      queryClient.invalidateQueries({ queryKey: ['customer-cart-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-cart'] });
    }
    window.addEventListener('cocojojochem-server-cart-changed', onServerCartChanged);
    return () =>
      window.removeEventListener('cocojojochem-server-cart-changed', onServerCartChanged);
  }, [customerEmail, queryClient]);

  const { data: serverQuoteListSummary } = useQuery({
    queryKey: ['customer-quote-list-summary'],
    queryFn: () => customerApi.get<{ count: number }>('/quote-list/summary'),
    enabled: !!customerEmail,
  });

  useEffect(() => {
    if (!customerEmail) return;
    function onServerQuoteListChanged() {
      queryClient.invalidateQueries({ queryKey: ['customer-quote-list-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-quote-list'] });
    }
    window.addEventListener('cocojojochem-server-quote-list-changed', onServerQuoteListChanged);
    return () =>
      window.removeEventListener(
        'cocojojochem-server-quote-list-changed',
        onServerQuoteListChanged,
      );
  }, [customerEmail, queryClient]);

  const signOut = useCallback(() => {
    const refreshToken = getCustomerRefreshToken();
    if (refreshToken) {
      // Fire-and-forget — revoke the refresh token server-side, but don't
      // block sign-out on the network round trip.
      customerApi.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    clearCustomerToken();
    // Clear any leftover local (guest) cart/quote list so the next person on
    // this device doesn't see this customer's items after they've signed out.
    clearCart();
    clearQuoteList();
    router.push('/');
  }, [router]);

  return {
    customerEmail,
    itemCount: customerEmail ? serverCartSummary?.itemCount || 0 : localItemCount,
    quoteListCount: customerEmail ? serverQuoteListSummary?.count || 0 : localQuoteListCount,
    signOut,
  };
}
