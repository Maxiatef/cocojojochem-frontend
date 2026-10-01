'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { LoaderCircle } from 'lucide-react';
import { AuthLayout } from '@/components/gloss/account/AuthLayout';
import { PasswordInput } from '@/components/gloss/account/PasswordInput';

function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      // Read at submit time rather than with useSearchParams: that hook
      // forces a <Suspense> boundary, so the server sent an empty page and
      // the form popped in on hydration — a 0.24 layout shift in Lighthouse.
      // The redirect is only needed here, after the user has submitted.
      router.push(new URLSearchParams(window.location.search).get('redirect') || '/');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'login'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Sign in." intro="Return to your orders, quote list and saved ingredients.">
      <form onSubmit={handleSubmit} className="r-form-card">
        <h2>Sign in to your wholesale account</h2>
        <p>Use the email address your trade account was opened with.</p>

        <div className="r-field">
          <label htmlFor="f-email">Email address</label>
          <input
            id="f-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="r-field">
          <div className="ga-field-row">
            <label htmlFor="f-password">Password</label>
            <Link href="/account/forgot-password">Forgot password?</Link>
          </div>
          <PasswordInput
            id="f-password"
            required
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />
        </div>

        {error && (
          <p className="r-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="r-btn r-primary">
          {loading ? (
            <>
              <LoaderCircle className="r-spin" size={17} aria-hidden />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <p className="ga-auth-switch">
          New to CocoJojoChem? <Link href="/account/register">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function CustomerLoginPage() {
  return <LoginForm />;
}
