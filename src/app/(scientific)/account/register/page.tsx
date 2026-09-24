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
import { PhoneCountrySelect } from '@/components/PhoneCountrySelect';
import { COUNTRY_CODES } from '@/lib/countryCodes';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

const PHONE_DIGITS_REGEX = /^\d{6,14}$/;

const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /\d/.test(pw) },
  { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function PasswordStrengthChecklist({ password }: { password: string }) {
  const results = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) }));
  const allPassed = results.every((r) => r.passed);

  return (
    <ul className="mt-2 space-y-1">
      {results.map((r) => (
        <li
          key={r.label}
          className={`flex items-center gap-1.5 text-xs ${
            r.passed ? 'text-emerald-600' : 'text-sci-muted'
          }`}
        >
          <span
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] ${
              r.passed ? 'bg-emerald-600 text-white' : 'bg-sci-border text-sci-muted'
            }`}
          >
            {r.passed ? '✓' : ''}
          </span>
          {r.label}
        </li>
      ))}
      {allPassed && (
        <li className="mt-1 text-xs font-medium text-emerald-600">✓ Strong password</li>
      )}
    </ul>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [countryIso2, setCountryIso2] = useState('us');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!PHONE_DIGITS_REGEX.test(phone)) {
      setPhoneError('Enter a valid phone number (digits only, no letters).');
      return;
    }
    setPhoneError(null);

    if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      setError('Password does not meet all the requirements below.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const dialCode = COUNTRY_CODES.find((c) => c.iso2 === countryIso2)?.dialCode || '1';

    setLoading(true);
    try {
      const res = await customerApi.post<{ accessToken: string; refreshToken: string }>('/auth/register', {
        fullName,
        email,
        password,
        companyName: companyName || undefined,
        companyWebsite: companyName ? companyWebsite || undefined : undefined,
        phone: `+${dialCode} ${phone}`,
      });
      setCustomerTokens(res.accessToken, res.refreshToken);

      const localItems = getCart();
      if (localItems.length > 0) {
        await customerApi.post('/cart/merge', { items: getCartAsMergePayload() }).catch(() => {});
        clearCart();
        window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
      }

      const localQuoteItems = getQuoteList();
      if (localQuoteItems.length > 0) {
        await customerApi.post('/quote-list/merge', { items: getQuoteListAsMergePayload() }).catch(() => {});
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
      setError(getFriendlyErrorMessage(err, 'register'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[460px] px-6 py-16">
      <h1 className="font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy">Create your account</h1>
      <p className="mt-2 font-sci-body text-sci-body text-sci-muted">
        Wholesale accounts get order history and faster checkout.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="f-full-name" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">Full name</label>
          <input
            id="f-full-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-sci-border bg-white px-4 py-3 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
          />
        </div>

        <div>
          <label htmlFor="f-company-name-optional" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">Company name (optional)</label>
          <input
            id="f-company-name-optional"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-md border border-sci-border bg-white px-4 py-3 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
          />
        </div>

        {companyName && (
          <div>
            <label htmlFor="f-company-website-optional" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
              Company website (optional)
            </label>
            <input
            id="f-company-website-optional"
              type="text"
              placeholder="yourcompany.com"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className="w-full rounded-md border border-sci-border bg-white px-4 py-3 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
            />
          </div>
        )}

        <div>
          <label htmlFor="f-phone" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">Phone</label>
          <div className="flex gap-2">
            <PhoneCountrySelect value={countryIso2} onChange={setCountryIso2} />
            <input
            id="f-phone"
              type="tel"
              required
              inputMode="numeric"
              placeholder="5551234567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ''));
                setPhoneError(null);
              }}
              className="w-full rounded-md border border-sci-border bg-white px-4 py-3 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue"
            />
          </div>
          {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
        </div>

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
          <label htmlFor="f-password" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">Password</label>
          <div className="relative">
            <input
            id="f-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
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
          {password.length > 0 && <PasswordStrengthChecklist password={password} />}
        </div>

        <div>
          <label htmlFor="f-confirm-password" className="mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">Confirm Password</label>
          <div className="relative">
            <input
            id="f-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border px-3.5 py-2.5 pr-10 text-sm text-sci-navy outline-none focus:border-sci-blue ${
                confirmPassword.length > 0
                  ? confirmPassword === password
                    ? 'border-emerald-500'
                    : 'border-red-400'
                  : 'border-sci-border'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-sci-muted hover:text-sci-navy"
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-[18px] w-[18px]" />
              ) : (
                <EyeIcon className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <p className={`mt-1 text-xs ${confirmPassword === password ? 'text-emerald-600' : 'text-red-600'}`}>
              {confirmPassword === password ? '✓ Passwords match' : 'Passwords do not match'}
            </p>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-sci-muted">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-sci-border text-sci-blue focus:ring-sci-blue"
          />
          <span>
            I agree to the{' '}
            <Link href="/legal/terms-of-service" target="_blank" className="font-medium text-sci-blue hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy-policy" target="_blank" className="font-medium text-sci-blue hover:underline">
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
          className="w-full rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-sci-muted">
        Already have an account?{' '}
        <Link href="/account/login" className="font-medium text-sci-blue hover:underline">
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
