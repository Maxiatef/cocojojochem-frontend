'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';

type Step = 'email' | 'code' | 'password' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await customerApi.post('/auth/forgot-password', { email });
      setStep('code');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await customerApi.post<{ resetToken: string }>('/auth/verify-reset-code', { email, code });
      setResetToken(res.resetToken);
      setStep('password');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      await customerApi.post('/auth/reset-password', { resetToken, newPassword });
      setStep('done');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[460px] px-6 py-16">
      <h1 className="font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy">Reset your password</h1>
      <p className="mt-2 font-sci-body text-sci-body text-sci-muted">
        {step === 'email' && "We'll email you a 5-digit code to verify it's you."}
        {step === 'code' &&
          `If ${email} is a registered account, we've sent a 5-digit code to it. If it isn't, you won't receive anything.`}
        {step === 'password' && 'Choose a new password for your account.'}
        {step === 'done' && 'Your password has been reset.'}
      </p>

      {step === 'email' && (
        <form onSubmit={handleSendCode} className="mt-8 space-y-4">
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
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send code'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="mt-8 space-y-4">
          <div>
            <label htmlFor="f-5-digit-code" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
              5-digit code
            </label>
            <input
            id="f-5-digit-code"
              type="text"
              required
              inputMode="numeric"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="w-full border border-sci-border px-3.5 py-2.5 text-center text-lg tracking-[0.4em] text-sci-navy outline-none focus:border-sci-blue"
              placeholder="00000"
            />
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
          <button
            type="submit"
            disabled={loading || code.length !== 5}
            className="w-full rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Verify code'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('email');
              setCode('');
              setError(null);
            }}
            className="w-full text-center text-xs font-medium text-sci-muted hover:text-sci-navy"
          >
            Use a different email
          </button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
          <div>
            <label htmlFor="f-new-password" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
              New password
            </label>
            <input
            id="f-new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-sci-border bg-white px-4 py-3 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
            />
          </div>
          <div>
            <label htmlFor="f-confirm-new-password" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
              Confirm new password
            </label>
            <input
            id="f-confirm-new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-sci-border bg-white px-4 py-3 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
            />
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <div className="mt-8">
          <p className="rounded-lg bg-sci-pale px-3.5 py-2.5 text-sm text-sci-navy">
            Your password was reset successfully. You can now sign in with your new password.
          </p>
          <button
            onClick={() => router.push('/account/login')}
            className="mt-6 w-full bg-sci-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95"
          >
            Sign in
          </button>
        </div>
      )}

      {step !== 'done' && (
        <p className="mt-6 text-center text-sm text-sci-muted">
          <Link href="/account/login" className="font-medium text-sci-blue hover:underline">
            Back to sign in
          </Link>
        </p>
      )}
    </div>
  );
}
