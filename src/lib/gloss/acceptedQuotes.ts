'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { PublicQuote, QuoteRequest } from '@/lib/types';
import { categoryImage } from './images';
import { notify, openCartDrawer } from './stores';

/**
 * Quotes the customer accepted: their priced lines sit in the cart's "Ready to
 * pay" group at the quoted prices, and checkout sends the quote tokens so the
 * server charges exactly what was quoted.
 *
 * The browser keeps the tokens it accepted (works for guests). Signed-in
 * customers also get any accepted-but-unpaid quote from their account, so the
 * lines follow them to another device. A quote that is paid, declined or
 * closed drops out of the cart on its own.
 */
const KEY = 'cocojojochem_accepted_quotes';
const EVENT = 'cocojojochem-accepted-quotes-changed';

function readTokens(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((t) => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

function writeTokens(tokens: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(tokens)]));
  } catch {
    /* storage blocked — signed-in customers still get it from their account */
  }
  window.dispatchEvent(new Event(EVENT));
}

export interface QuotedLine {
  key: string;
  token: string;
  reference: string;
  name: string;
  label: string;
  image: string;
  unitPrice: number;
  quantity: number;
  source: 'COCOJOJO' | 'SUPPLIER_REFERENCE';
}

/** Accept a quote: mark it accepted on the server and put it in this cart. */
export async function acceptQuoteToCart(token: string) {
  const quote = await customerApi.post<PublicQuote>(`/wholesale/quotes/${token}/accept`);
  writeTokens([...readTokens(), token]);
  notify(`Quote ${quote.reference} added to your cart`);
  openCartDrawer();
  return quote;
}

export function useAcceptedQuotes() {
  const queryClient = useQueryClient();
  const [localTokens, setLocalTokens] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLocalTokens(readTokens());
      setSignedIn(!!getCustomerToken());
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('customer-auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('customer-auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const { data: mine } = useQuery({
    queryKey: ['customer-quote-requests'],
    queryFn: () => customerApi.get<QuoteRequest[]>('/wholesale/quote-requests/mine'),
    enabled: signedIn,
  });

  const tokens = useMemo(() => {
    const fromAccount = (mine || [])
      .filter((q) => q.status === 'QUOTED' && q.acceptedAt && !q.quoteOrderId && q.quoteToken)
      .map((q) => q.quoteToken as string);
    return [...new Set([...localTokens, ...fromAccount])];
  }, [localTokens, mine]);

  const results = useQueries({
    queries: tokens.map((token) => ({
      queryKey: ['public-quote', token],
      queryFn: () => customerApi.get<PublicQuote>(`/wholesale/quotes/${token}`),
      retry: false,
      staleTime: 30_000,
    })),
  });

  const quotes = results
    .map((r) => r.data)
    .filter((q): q is PublicQuote => !!q && q.status === 'QUOTED' && !q.paid && !!q.acceptedAt);
  const loaded = results.every((r) => !r.isLoading);

  // Forget local tokens whose quote is no longer payable (paid, closed, gone).
  useEffect(() => {
    if (!loaded) return;
    const live = new Set(quotes.map((q) => q.token));
    const stale = localTokens.filter((t) => {
      const r = results[tokens.indexOf(t)];
      return r && !r.isLoading && !live.has(t);
    });
    if (stale.length) writeTokens(localTokens.filter((t) => !stale.includes(t)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, quotes.length, localTokens.join(',')]);

  const lines: QuotedLine[] = quotes.flatMap((q) =>
    q.items
      .filter((i) => i.isAvailable && i.unitPrice != null)
      .map((i) => ({
        key: `${q.token}:${i.id}`,
        token: q.token,
        reference: q.reference,
        name: i.productName,
        label: i.packSize || 'Quoted size',
        image: categoryImage(i.productName),
        unitPrice: i.unitPrice as number,
        quantity: i.quantity,
        source: i.source,
      })),
  );

  /** Remove a quote from the cart; it stays open to accept again later. */
  const remove = useCallback(
    async (token: string) => {
      writeTokens(readTokens().filter((t) => t !== token));
      await customerApi.post(`/wholesale/quotes/${token}/unaccept`).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['customer-quote-requests'] });
      queryClient.invalidateQueries({ queryKey: ['public-quote', token] });
      notify('Quote removed from your cart');
    },
    [queryClient],
  );

  /** After a successful payment the quotes are paid; drop the local copies. */
  const clear = useCallback(() => writeTokens([]), []);

  return {
    quotes,
    tokens: quotes.map((q) => q.token),
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
    shipping: quotes.reduce((n, q) => n + (q.shippingCost ?? 0), 0),
    loaded,
    remove,
    clear,
  };
}
