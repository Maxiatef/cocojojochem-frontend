'use client';

import { FormEvent, useId, useState } from 'react';
import { customerApi } from '@/lib/customerApi';
import { ApiError } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';

/**
 * Wholesale updates sign-up, for the footer.
 *
 * Same endpoint as the storefront `NewsletterForm` — one subscriber list, two
 * skins — but written against the sci tokens and without the consent
 * checkbox: a footer field that grows a second required control is a field
 * most people abandon. The terms are linked as a line of text instead, which
 * is what the rest of the footer already does.
 */
export function FooterNewsletter() {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'already'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus('loading');

    try {
      await customerApi.post('/wholesale/newsletter/subscribe', { email });
      setStatus('done');
    } catch (err) {
      // 409 is "already on the list" — a success from the reader's side, so
      // it gets a confirmation rather than an error.
      if (err instanceof ApiError && err.status === 409) {
        setStatus('already');
        return;
      }
      setError(getFriendlyErrorMessage(err, 'newsletter'));
      setStatus('idle');
    }
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
      <div className="flex max-w-[520px] flex-col gap-2">
        <p className="font-sci-heading text-[24px] font-semibold leading-8 text-white md:text-[28px] md:leading-9">
          Wholesale Updates
        </p>
        <p className="font-sci-body text-sci-body text-[#adc6d8]">
          Get restock alerts, bulk supply notes, and manufacturing updates.
        </p>
      </div>

      <div className="w-full lg:max-w-[520px]">
        {status === 'done' || status === 'already' ? (
          <p
            role="status"
            className="border-l-2 border-sci-accent pl-4 font-sci-body text-sci-body text-white"
          >
            {status === 'done'
              ? 'Subscribed. Wholesale updates will arrive at that address.'
              : 'That address is already on the list.'}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label
              htmlFor={inputId}
              className="font-sci-body text-sci-eyebrow font-semibold uppercase tracking-wide text-[#adc6d8]"
            >
              Business email
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={inputId}
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error ? true : undefined}
                className="w-full rounded-md border border-white/20 bg-white/[0.06] px-4 py-3 font-sci-body text-sci-body text-white outline-none transition placeholder:text-white/35 focus:border-sci-accent"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                // Navy text on teal: the accent is light enough that white
                // labels fail contrast against it.
                className="shrink-0 rounded-md bg-sci-accent px-6 py-3 font-sci-body text-sci-label font-semibold text-sci-navy transition hover:bg-white disabled:opacity-60"
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </div>

            {error && (
              <p role="alert" className="font-sci-body text-sci-label text-[#ff9f9f]">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
