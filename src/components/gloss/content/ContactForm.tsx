'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleCheck, LoaderCircle } from 'lucide-react';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';

/**
 * The contact form in the prototype's `r-form-card` markup.
 *
 * Submission is unchanged from the previous contact page: the same fields
 * (fullName, email, optional phone, subject, message), the same consent rule
 * and the same `POST /wholesale/contact-messages`. The prototype's company /
 * location / honeypot fields are not sent because our API does not take them.
 *
 * `?subject=` pre-fills the subject (the services and accessibility pages link
 * here with one). Read from `window.location` after mount rather than
 * `useSearchParams`, which would force a Suspense boundary and opt the whole
 * page out of static rendering for a convenience.
 */
export function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get('subject')?.trim();
    if (preset) setSubject((current) => current || preset.slice(0, 200));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to send your message.');
      return;
    }
    setStatus('loading');
    try {
      await customerApi.post('/wholesale/contact-messages', {
        fullName,
        email,
        phone: phone || undefined,
        subject,
        message,
      });
      setStatus('done');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      setStatus('idle');
    }
  }

  function startOver() {
    setSubject('');
    setMessage('');
    setStatus('idle');
  }

  if (status === 'done') {
    return (
      <div className="r-form-card">
        <div className="r-confirmation" role="status">
          <CircleCheck size={54} aria-hidden="true" />
          <span className="r-eyebrow">Successfully received</span>
          <h2>Your message has been sent.</h2>
          <p>Thank you. Our team reads every message and replies by email within one business day.</p>
          <Link className="r-btn r-primary" href="/products">
            Continue shopping
          </Link>
          <button type="button" className="r-btn r-outline" onClick={startOver}>
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="r-form-card" onSubmit={handleSubmit}>
      <div className="r-step-label">
        <span>1</span> Your details <span>2</span> Review &amp; submit
      </div>
      <h2>How can we help?</h2>
      <p>Share your question with our team. We reply by email within one business day.</p>

      <div className="r-form-grid">
        <label className="r-field" htmlFor="contact-name">
          Full name
          <input
            id="contact-name"
            name="fullName"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="r-field" htmlFor="contact-email">
          Email address
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="r-field" htmlFor="contact-phone">
          <span>
            Phone <small>optional</small>
          </span>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="r-field" htmlFor="contact-subject">
          Subject
          <input
            id="contact-subject"
            name="subject"
            required
            placeholder="What is this regarding?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>
        <label className="r-field r-full" htmlFor="contact-message">
          Your message
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            placeholder="Ingredient or project, application, required grade, estimated volume, delivery destination, documentation needs…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
      </div>

      <label className="r-consent" htmlFor="contact-consent">
        <input
          id="contact-consent"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
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

      <button className="r-btn r-primary" type="submit" disabled={status === 'loading' || !agreed}>
        {status === 'loading' ? (
          <>
            <LoaderCircle className="r-spin" size={17} aria-hidden="true" />
            Sending…
          </>
        ) : (
          'Send message'
        )}
      </button>
      <p className="r-fine">
        We use these details to respond to your inquiry. See our{' '}
        <Link href="/legal/privacy-policy">Privacy Policy</Link>.
      </p>
    </form>
  );
}
