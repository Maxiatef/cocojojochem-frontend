'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { CheckCircleIcon, ClockIcon, GlobeIcon, MailIcon } from '@/components/icons';

const INFO_CARDS = [
  {
    icon: MailIcon,
    title: 'Email',
    lines: ['support@cocojojochem.com', "We'll respond within 1 business day."],
  },
  {
    icon: ClockIcon,
    title: 'Support Hours',
    lines: ['Monday – Friday', '9:00 AM – 6:00 PM PST'],
  },
  {
    icon: GlobeIcon,
    title: 'Shipping Coverage',
    lines: ['Shipping nationwide', 'across the United States'],
  },
];

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <section className="bg-sand-100 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Contact</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Get in Touch</h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-soft">
            Questions about an ingredient, an order, or a bulk sourcing need? Send us a message
            and our team will follow up directly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {INFO_CARDS.map((card) => (
            <div key={card.title} className="border border-sand-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center bg-sand-100 text-olive-700">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg text-ink">{card.title}</h3>
              {card.lines.map((line) => (
                <p key={line} className="mt-1 text-sm text-ink-soft">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-6 font-display text-2xl text-ink">Send Us a Message</h2>

          {status === 'done' ? (
            <div className="flex items-center gap-3 border border-olive-200 bg-olive-50 px-5 py-4 text-sm font-medium text-olive-800">
              <CheckCircleIcon className="h-5 w-5 shrink-0" />
              Thanks — your message has been sent. We'll get back to you within 1 business day.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Name *
                  </label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Subject *
                </label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this regarding?"
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide details about your inquiry…"
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-sand-300 text-olive-600 focus:ring-olive-500"
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms-of-service" target="_blank" className="font-medium text-olive-700 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" target="_blank" className="font-medium text-olive-700 hover:underline">
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
                disabled={status === 'loading' || !agreed}
                className="w-full bg-olive-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-olive-700 disabled:opacity-60 sm:w-auto"
              >
                {status === 'loading' ? 'Sending…' : 'Submit Message'}
              </button>

              <p className="text-xs text-ink-soft/70">
                By submitting this form, you agree to our Privacy Policy. We will never share your
                information with third parties.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
