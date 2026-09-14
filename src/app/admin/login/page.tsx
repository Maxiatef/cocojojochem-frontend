'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { decodeToken, getToken, setTokens } from '@/lib/auth';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

/**
 * Staff sign-in, in the "Scientific edition" design.
 *
 * Split rather than centred: the left panel carries the brand on navy, the
 * right holds the form on white. It is the same navy/teal pairing the
 * storefront uses for its own page headers, so a staff member arriving from
 * the public site doesn't land somewhere that looks like a different product.
 *
 * Below `lg` the navy panel collapses to a header band and the form fills the
 * screen — a login form is the one thing on the page, and on a phone it should
 * not be pushed below a decorative column.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace('/admin');
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ accessToken: string; refreshToken: string }>('/auth/login', {
        email,
        password,
      });
      const payload = decodeToken(res.accessToken);
      if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SALES')) {
        setError('This account does not have dashboard access.');
        setLoading(false);
        return;
      }
      setTokens(res.accessToken, res.refreshToken);
      router.replace('/admin');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'login'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Brand panel */}
      <div className="flex flex-col justify-between gap-10 bg-sci-navy px-6 py-10 text-white sm:px-10 lg:w-[46%] lg:px-14 lg:py-14">
        <Image
          src="/brand/cocojojo-logo.png"
          alt="COCOJOJO Chemical"
          width={991}
          height={396}
          priority
          sizes="180px"
          className="h-14 w-auto self-start brightness-0 invert lg:h-[72px]"
        />

        <div className="flex flex-col gap-6">
          <p className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-accent">
            Operations console
          </p>
          <h1 className="font-sci-heading text-[32px] font-semibold leading-[40px] lg:text-[44px] lg:leading-[54px]">
            The catalog,
            <br className="hidden lg:block" /> behind the counter.
          </h1>
          <p className="max-w-[420px] font-sci-body text-sci-body text-[#adc6d8]">
            Orders, quote requests, inventory and the ingredient catalog — all in one place. Staff
            access only.
          </p>
        </div>

        <p className="hidden font-sci-body text-sci-label text-[#7e9cb4] lg:block">
          Every action in here is recorded in the audit log.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          <h2 className="font-sci-heading text-sci-subheading font-semibold text-sci-navy">
            Sign in
          </h2>
          <p className="mt-2 font-sci-body text-sci-body text-sci-muted">
            Use the staff account provisioned for you.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="font-sci-body text-sci-label font-medium text-sci-navy">Email</span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@cocojojo.com"
                className="w-full border border-sci-border bg-white p-4 font-sci-body text-sci-body text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-sci-body text-sci-label font-medium text-sci-navy">
                Password
              </span>
              <span className="relative block">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-sci-border bg-white p-4 pr-12 font-sci-body text-sci-body text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-sci-muted transition hover:text-sci-navy"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <EyeIcon className="h-[18px] w-[18px]" />
                  )}
                </button>
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="border border-red-200 bg-red-50 px-4 py-3 font-sci-body text-sci-label text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p className="mt-8 border-t border-sci-border pt-6 font-sci-body text-sci-label text-sci-muted">
            Admin accounts are provisioned by a system administrator. If you cannot sign in, contact
            them rather than registering — customer accounts have no dashboard access.
          </p>
        </div>
      </div>
    </div>
  );
}
