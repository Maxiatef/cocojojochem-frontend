'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { setCustomerTokens } from '@/lib/customerAuth';
import { getCartAsMergePayload, clearCart, getCart } from '@/lib/cartStore';
import { getQuoteListAsMergePayload, clearQuoteList, getQuoteList } from '@/lib/quoteListStore';
import {
  getWishlist,
  getWishlistAsMergePayload,
  clearWishlist,
} from '@/lib/wishlistStore';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await customerApi.post<{ accessToken: string; refreshToken: string }>('/auth/login', { email, password });
      setCustomerTokens(res.accessToken, res.refreshToken);

      // Merge any guest cart items into the server cart, then clear local storage.
      const localItems = getCart();
      if (localItems.length > 0) {
        await customerApi
          .post('/cart/merge', { items: getCartAsMergePayload() })
          .catch(() => {});
        clearCart();
        window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
      }

      // Same merge-then-clear pattern for the guest quote list.
      const localQuoteItems = getQuoteList();
      if (localQuoteItems.length > 0) {
        await customerApi
          .post('/quote-list/merge', { items: getQuoteListAsMergePayload() })
          .catch(() => {});
        clearQuoteList();
        window.dispatchEvent(new Event('cocojojochem-server-quote-list-changed'));
      }

      // And the guest wishlist. A union server-side, so saving on a phone and
      // on a laptop leaves both sets, not whichever signed in last.
      const localWishlist = getWishlist();
      if (localWishlist.length > 0) {
        await customerApi
          .post('/wishlist/merge', { productIds: getWishlistAsMergePayload() })
          .catch(() => {});
        clearWishlist();
      }

      router.push(redirectTo);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'login'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[460px] px-6 py-16">
      <h1 className="font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy">Sign in</h1>
      <p className="mt-2 font-sci-body text-sci-body text-sci-muted">Sign in to your wholesale account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="f-email" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">Email</label>
          <input
            id="f-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-sci-border bg-white px-4 py-3 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="f-password" className="block text-xs font-semibold uppercase tracking-wide text-sci-muted">Password</label>
            <Link href="/account/forgot-password" className="text-xs font-medium text-sci-blue hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
            id="f-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-sci-border bg-white px-4 py-3 pr-12 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-sci-muted hover:text-sci-navy"
            >
              {showPassword ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-sci-muted">
        New to CocoJojoChem?{' '}
        <Link href="/account/register" className="font-medium text-sci-blue hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
