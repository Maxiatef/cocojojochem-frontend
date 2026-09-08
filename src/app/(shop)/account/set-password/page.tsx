'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';

// Landing page for the reset link an admin sends from the admin user editor.
// The token in the URL was minted already code-verified, so there's no
// 5-digit step here — this posts straight to the same /auth/reset-password
// endpoint the self-service flow finishes on.
function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      await customerApi.post('/auth/reset-password', { resetToken: token, newPassword });
      setDone(true);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // A link that arrives without a token can't be recovered from here — the
  // token is the only credential, so point them at the self-service flow
  // rather than showing a form that's guaranteed to fail.
  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl text-ink">Link incomplete</h1>
        <p className="mt-1 text-sm text-ink-soft">
          This password link is missing its security token. It may have been cut short by your email client — try
          copying the full link from the email, or request a new one.
        </p>
        <Link
          href="/account/forgot-password"
          className="mt-6 block w-full bg-olive-800 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-olive-700"
        >
          Reset my password
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl text-ink">Password set</h1>
        <p className="mt-1 text-sm text-ink-soft">Your password has been saved.</p>
        <p className="mt-8 rounded-lg bg-olive-50 px-3.5 py-2.5 text-sm text-olive-800">
          You can now sign in with your new password. For your security, you've been signed out on any other devices.
        </p>
        <button
          onClick={() => router.push('/account/login')}
          className="mt-6 w-full bg-olive-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-olive-700"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Set your password</h1>
      <p className="mt-1 text-sm text-ink-soft">Choose a new password for your wholesale account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
            New password
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
          />
          <p className="mt-1.5 text-xs text-ink-soft">At least 8 characters.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Confirm new password
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
            {/* A 401 here almost always means the link expired or was already
                used, which the generic error text doesn't make actionable. */}
            <Link href="/account/forgot-password" className="mt-1 block font-medium underline">
              Request a new reset link
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-olive-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-olive-700 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Set password'}
        </button>
      </form>
    </div>
  );
}

// useSearchParams needs a Suspense boundary above it, or Next fails the
// production build for this route with a prerender error.
export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <h1 className="font-display text-3xl text-ink">Set your password</h1>
          <p className="mt-1 text-sm text-ink-soft">Loading…</p>
        </div>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
