'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { ApiError } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { ArrowRightIcon, CheckCircleIcon } from '@/components/icons';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'already-subscribed'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to subscribe.');
      return;
    }
    setStatus('loading');
    try {
      await customerApi.post('/wholesale/newsletter/subscribe', { email });
      setStatus('done');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setStatus('already-subscribed');
        return;
      }
      setError(getFriendlyErrorMessage(err, 'newsletter'));
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2.5 text-sm font-medium text-white">
        <CheckCircleIcon className="h-5 w-5 text-olive-300" />
        You're subscribed — watch your inbox for updates.
      </div>
    );
  }

  if (status === 'already-subscribed') {
    return (
      <div className="flex items-center gap-2.5 text-sm font-medium text-sand-100/80">
        <CheckCircleIcon className="h-5 w-5 text-olive-300" />
        You're already subscribed with this email.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div
        className="flex items-center gap-2 border border-white/20 bg-black/20 p-1.5 focus-within:border-olive-300"
      >
        <input
          type="email"
          required
          placeholder="you@yourbrand.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap bg-white px-5 py-2.5 text-sm font-semibold text-olive-900 transition hover:bg-sand-50 disabled:opacity-60"
        >
          {status === 'loading' ? 'Joining…' : 'Subscribe'}
          {status !== 'loading' && <ArrowRightIcon className="h-3.5 w-3.5" />}
        </button>
      </div>

      <label className="mt-3 flex items-start justify-center gap-2 text-xs text-sand-100/50">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border-white/40 bg-black/20 text-olive-400 focus:ring-olive-400 focus:ring-offset-0"
        />
        <span>
          I agree to the{' '}
          <Link href="/terms-of-service" target="_blank" className="underline hover:text-white">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" target="_blank" className="underline hover:text-white">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {error && <p className="mt-2 text-center text-xs font-medium text-red-300">{error}</p>}
    </form>
  );
}
