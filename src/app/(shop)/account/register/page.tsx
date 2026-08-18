'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { setCustomerToken } from '@/lib/customerAuth';
import { getCartAsMergePayload, clearCart, getCart } from '@/lib/cartStore';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    try {
      const res = await customerApi.post<{ accessToken: string }>('/auth/register', {
        fullName,
        email,
        password,
        companyName: companyName || undefined,
        phone: phone || undefined,
      });
      setCustomerToken(res.accessToken);

      const localItems = getCart();
      if (localItems.length > 0) {
        await customerApi.post('/cart/merge', { items: getCartAsMergePayload() }).catch(() => {});
        clearCart();
      }

      router.push(redirectTo);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'register'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Wholesale accounts get order history and faster checkout.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Full name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Company name (optional)</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Phone</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
          />
        </div>

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
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-sand-300 text-olive-600 focus:ring-olive-500"
          />
          <span>
            I agree to the{' '}
            <Link href="/terms-of-service" target="_blank" className="font-medium text-olive-700 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" target="_blank" className="font-medium text-olive-700 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && (
          <div className="bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          className="w-full bg-olive-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-olive-700 disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link href="/account/login" className="font-medium text-olive-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
