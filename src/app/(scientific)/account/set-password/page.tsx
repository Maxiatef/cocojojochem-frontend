'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

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
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      <div className="mx-auto max-w-[460px] px-6 py-16">
        <h1 className="font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy">Link incomplete</h1>
        <p className="mt-2 font-sci-body text-sci-body text-sci-muted">
          This password link is missing its security token. It may have been cut short by your email client — try
          copying the full link from the email, or request a new one.
        </p>
        <Link
          href="/account/forgot-password"
          className="mt-6 block w-full bg-sci-accent px-4 py-2.5 text-center text-sm font-medium text-white transition hover:brightness-95"
        >
          Reset my password
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-[460px] px-6 py-16">
        <h1 className="font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy">Password set</h1>
        <p className="mt-2 font-sci-body text-sci-body text-sci-muted">Your password has been saved.</p>
        <p className="mt-8 rounded-lg bg-sci-pale px-3.5 py-2.5 text-sm text-sci-navy">
          You can now sign in with your new password. For your security, you've been signed out on any other devices.
        </p>
        <button
          onClick={() => router.push('/account/login')}
          className="mt-6 w-full bg-sci-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[460px] px-6 py-16">
      <h1 className="font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy">Set your password</h1>
      <p className="mt-2 font-sci-body text-sci-body text-sci-muted">Choose a new password for your wholesale account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
            New password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-sci-border px-3.5 py-2.5 pr-11 text-sm text-sci-navy outline-none focus:border-sci-blue"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? 'Hide password' : 'Show password'}
              aria-pressed={showNew}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-sci-muted transition hover:text-sci-navy"
            >
              {showNew ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-sci-muted">At least 8 characters.</p>
        </div>
        <div>
          <label className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
            Confirm new password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-sci-border px-3.5 py-2.5 pr-11 text-sm text-sci-navy outline-none focus:border-sci-blue"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
              aria-pressed={showConfirm}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-sci-muted transition hover:text-sci-navy"
            >
              {showConfirm ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>
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
          className="w-full rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="mx-auto max-w-[460px] px-6 py-16">
          <h1 className="font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy">Set your password</h1>
          <p className="mt-2 font-sci-body text-sci-body text-sci-muted">Loading…</p>
        </div>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
