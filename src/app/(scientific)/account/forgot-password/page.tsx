'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { AuthLayout } from '@/components/gloss/account/AuthLayout';
import { PasswordInput } from '@/components/gloss/account/PasswordInput';

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

  const errorBox = error && (
    <p className="r-error" role="alert">
      {error}
    </p>
  );

  return (
    <AuthLayout
      title="Reset your password."
      intro={
        <>
          {step === 'email' && "We'll email you a 5-digit code to verify it's you."}
          {step === 'code' &&
            `If ${email} is a registered account, we've sent a 5-digit code to it. If it isn't, you won't receive anything.`}
          {step === 'password' && 'Choose a new password for your account.'}
          {step === 'done' && 'Your password has been reset.'}
        </>
      }
    >
      {step === 'email' && (
        <form onSubmit={handleSendCode} className="r-form-card">
          <div className="r-step-label">
            <span>1</span> Your email <span>2</span> Code <span>3</span> New password
          </div>
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
          {errorBox}
          <button type="submit" disabled={loading} className="r-btn r-primary">
            {loading ? 'Sending…' : 'Send code'}
          </button>
          <p className="ga-auth-switch">
            <Link href="/account/login">Back to sign in</Link>
          </p>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="r-form-card">
          <div className="r-step-label">
            <span>1</span> Your email <span>2</span> Code <span>3</span> New password
          </div>
          <div className="r-field">
            <label htmlFor="f-5-digit-code">5-digit code</label>
            <input
              id="f-5-digit-code"
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="ga-code-input ga-mono"
              placeholder="00000"
            />
          </div>
          {errorBox}
          <button type="submit" disabled={loading || code.length !== 5} className="r-btn r-primary">
            {loading ? 'Verifying…' : 'Verify code'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('email');
              setCode('');
              setError(null);
            }}
            className="ga-link ga-secondary"
          >
            Use a different email
          </button>
          <p className="ga-auth-switch">
            <Link href="/account/login">Back to sign in</Link>
          </p>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="r-form-card">
          <div className="r-step-label">
            <span>1</span> Your email <span>2</span> Code <span>3</span> New password
          </div>
          <div className="r-field">
            <label htmlFor="f-new-password">New password</label>
            <PasswordInput
              id="f-new-password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <span className="ga-hint">At least 8 characters.</span>
          </div>
          <div className="r-field">
            <label htmlFor="f-confirm-new-password">Confirm new password</label>
            <PasswordInput
              id="f-confirm-new-password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showLabel="Show confirmation"
              hideLabel="Hide confirmation"
            />
          </div>
          {errorBox}
          <button type="submit" disabled={loading} className="r-btn r-primary">
            {loading ? 'Saving…' : 'Set new password'}
          </button>
          <p className="ga-auth-switch">
            <Link href="/account/login">Back to sign in</Link>
          </p>
        </form>
      )}

      {step === 'done' && (
        <div className="r-form-card">
          <p className="ga-success" role="status">
            Your password was reset successfully. You can now sign in with your new password.
          </p>
          <button onClick={() => router.push('/account/login')} className="r-btn r-primary">
            Sign in
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
