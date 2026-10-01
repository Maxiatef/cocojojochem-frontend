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
import { PhoneCountrySelect } from '@/components/PhoneCountrySelect';
import { COUNTRY_CODES } from '@/lib/countryCodes';
import { Check, LoaderCircle } from 'lucide-react';
import { AuthLayout } from '@/components/gloss/account/AuthLayout';
import { PasswordInput } from '@/components/gloss/account/PasswordInput';

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
    <ul className="ga-checklist">
      {results.map((r) => (
        <li key={r.label} className={r.passed ? 'is-ok' : undefined}>
          <span aria-hidden>{r.passed && <Check size={10} strokeWidth={3} />}</span>
          {r.label}
        </li>
      ))}
      {allPassed && <li className="is-ok">Strong password</li>}
    </ul>
  );
}

function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [countryIso2, setCountryIso2] = useState('us');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
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

      // Read at submit time rather than with useSearchParams: that hook
      // forces a <Suspense> boundary, so the server sent an empty page and
      // the form popped in on hydration — a 0.24 layout shift in Lighthouse.
      // The redirect is only needed here, after the user has submitted.
      router.push(new URLSearchParams(window.location.search).get('redirect') || '/');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'register'));
    } finally {
      setLoading(false);
    }
  }

  const confirmState =
    confirmPassword.length > 0 ? (confirmPassword === password ? 'is-ok' : 'is-bad') : undefined;

  return (
    <AuthLayout
      title="Create your account."
      intro="Wholesale accounts get order history, saved quote lists and faster checkout."
    >
      <form onSubmit={handleSubmit} className="r-form-card">
        <h2>Open a trade account</h2>
        <p>It takes a minute. Company details are optional and can be added later.</p>

        <div className="r-form-grid">
          <div className="r-field r-full">
            <label htmlFor="f-full-name">Full name</label>
            <input
              id="f-full-name"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className={companyName ? 'r-field' : 'r-field r-full'}>
            <label htmlFor="f-company-name-optional">
              Company <small>optional</small>
            </label>
            <input
              id="f-company-name-optional"
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {companyName && (
            <div className="r-field">
              <label htmlFor="f-company-website-optional">
                Company website <small>optional</small>
              </label>
              <input
                id="f-company-website-optional"
                type="text"
                placeholder="yourcompany.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </div>
          )}

          <div className="r-field r-full">
            <label htmlFor="f-phone">Phone</label>
            <div className="ga-phone">
              <PhoneCountrySelect value={countryIso2} onChange={setCountryIso2} />
              <input
                id="f-phone"
                type="tel"
                required
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="5551234567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  setPhoneError(null);
                }}
                className={phoneError ? 'is-bad' : undefined}
                aria-invalid={phoneError ? true : undefined}
                aria-describedby={phoneError ? 'f-phone-error' : undefined}
              />
            </div>
            {phoneError && (
              <span id="f-phone-error" className="ga-hint is-bad">
                {phoneError}
              </span>
            )}
          </div>

          <div className="r-field r-full">
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
            <label htmlFor="f-password">Password</label>
            <PasswordInput
              id="f-password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
            />
            {password.length > 0 && <PasswordStrengthChecklist password={password} />}
          </div>

          <div className="r-field">
            <label htmlFor="f-confirm-password">Confirm password</label>
            <PasswordInput
              id="f-confirm-password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              className={confirmState}
              showLabel="Show confirmation"
              hideLabel="Hide confirmation"
            />
            {confirmPassword.length > 0 && (
              <span className={`ga-hint ${confirmState}`}>
                {confirmPassword === password ? 'Passwords match' : 'Passwords do not match'}
              </span>
            )}
          </div>
        </div>

        <label className="r-consent">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          I agree to the{' '}
          <Link href="/legal/terms-of-service" target="_blank">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy-policy" target="_blank">
            Privacy Policy
          </Link>
          .
        </label>

        {error && (
          <p className="r-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || !agreedToTerms} className="r-btn r-primary">
          {loading ? (
            <>
              <LoaderCircle className="r-spin" size={17} aria-hidden />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>

        <p className="ga-auth-switch">
          Already have an account? <Link href="/account/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function CustomerRegisterPage() {
  return <RegisterForm />;
}
