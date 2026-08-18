'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { setCustomerToken } from '@/lib/customerAuth';
import { getCartAsMergePayload, clearCart, getCart } from '@/lib/cartStore';
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
      const res = await customerApi.post<{ accessToken: string }>('/auth/login', { email, password });
      setCustomerToken(res.accessToken);

      // Merge any guest cart items into the server cart, then clear local storage.
      const localItems = getCart();
      if (localItems.length > 0) {
        await customerApi
          .post('/cart/merge', { items: getCartAsMergePayload() })
          .catch(() => {});
        clearCart();
      }

      router.push(redirectTo);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'login'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Sign in</h1>
      <p className="mt-1 text-sm text-ink-soft">Sign in to your wholesale account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-sand-300 px-3.5 py-2.5 pr-10 text-sm text-ink outline-none focus:border-olive-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-soft hover:text-ink"
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
          className="w-full bg-olive-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-olive-700 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New to CocoJojoChem?{' '}
        <Link href="/account/register" className="font-medium text-olive-700 hover:underline">
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
