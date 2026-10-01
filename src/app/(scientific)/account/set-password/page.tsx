'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { AuthLayout } from '@/components/gloss/account/AuthLayout';
import { PasswordInput } from '@/components/gloss/account/PasswordInput';

// Landing page for the reset link an admin sends from the admin user editor.
// The token in the URL was minted already code-verified, so there's no
// 5-digit step here — this posts straight to the same /auth/reset-password
// endpoint the self-service flow finishes on.
function SetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

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
      <AuthLayout
        title="Link incomplete."
        intro="This password link is missing its security token. It may have been cut short by your email client — try copying the full link from the email, or request a new one."
      >
        <div className="r-form-card">
          <h2>Request a new link</h2>
          <p>We&apos;ll email you a 5-digit code instead, and you can choose a new password from there.</p>
          <Link href="/account/forgot-password" className="r-btn r-primary">
            Reset my password
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Password set." intro="Your password has been saved.">
        <div className="r-form-card">
          <p className="ga-success" role="status">
            You can now sign in with your new password. For your security, you&apos;ve been signed out on any other
            devices.
          </p>
          <button onClick={() => router.push('/account/login')} className="r-btn r-primary">
            Sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set your password." intro="Choose a new password for your wholesale account.">
      <form onSubmit={handleSubmit} className="r-form-card">
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

        {error && (
          <div className="r-error" role="alert">
            {error}
            {/* A 401 here almost always means the link expired or was already
                used, which the generic error text doesn't make actionable. */}
            <Link href="/account/forgot-password" className="ga-link">
              Request a new reset link
            </Link>
          </div>
        )}

        <button type="submit" disabled={loading} className="r-btn r-primary">
          {loading ? 'Saving…' : 'Set password'}
        </button>
      </form>
    </AuthLayout>
  );
}

// The token comes in as a page prop rather than through useSearchParams.
// That hook needs a <Suspense> boundary, so the server sent a short
// "Loading…" placeholder and swapped the taller form in on hydration — a 0.09
// layout shift. As a prop, the finished form is in the server HTML.
export default function SetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string | string[] };
}) {
  const raw = searchParams.token;
  return <SetPasswordForm token={(Array.isArray(raw) ? raw[0] : raw) || ''} />;
}
