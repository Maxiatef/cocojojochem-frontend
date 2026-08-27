'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useQuoteList } from '@/lib/quoteListStore';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken, decodeCustomerToken } from '@/lib/customerAuth';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { ImagePlaceholderIcon } from '@/components/icons';

export default function QuoteRequestPage() {
  const quoteList = useQuoteList();
  const token = getCustomerToken();
  const decoded = token ? decodeCustomerToken(token) : null;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(decoded?.email || '');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (quoteList.items.length === 0) {
      setError('Add at least one product to your quote list first.');
      return;
    }
    setSubmitting(true);
    try {
      await customerApi.post('/wholesale/quote-requests', {
        fullName,
        email,
        phone: phone || undefined,
        companyName: companyName || undefined,
        message: message || undefined,
        type: 'QUOTE',
        items: quoteList.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.variantLabel || undefined,
        })),
      });
      setDone(true);
      quoteList.clear();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl text-ink">Quote Request Sent</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Thanks — our team will follow up by email shortly with pricing.
        </p>
        <Link href="/products" className="mt-6 inline-block font-medium text-olive-700 hover:underline">
          Continue browsing →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Quote Request</p>
      <h1 className="mb-2 mt-1 font-display text-4xl text-ink">Your Quote List</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Add as many products as you need pricing on, then submit one request — no need to fill out the
        form again for each product.
      </p>

      {quoteList.items.length === 0 ? (
        <div className="border border-dashed border-sand-300 py-20 text-center">
          <p className="text-sm text-ink-soft">Your quote list is empty.</p>
          <Link href="/products" className="mt-3 inline-block font-medium text-olive-700 hover:underline">
            Browse products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="bg-white px-5">
            {quoteList.items.map((item) => (
              <div
                key={`${item.productId}-${item.variantLabel}`}
                className="flex items-center gap-4 border-b border-sand-200 py-4 last:border-0"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-sand-100">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlaceholderIcon className="h-6 w-6 text-sand-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="truncate font-medium text-ink hover:text-olive-700"
                  >
                    {item.productName}
                  </Link>
                  {item.variantLabel && <p className="text-xs text-ink-soft">{item.variantLabel}</p>}
                </div>
                <div className="flex items-center border border-sand-300">
                  <button
                    onClick={() =>
                      quoteList.updateQuantity(item.productId, item.variantLabel, item.quantity - 1)
                    }
                    className="px-2.5 py-1.5 text-ink-soft"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm text-ink">{item.quantity}</span>
                  <button
                    onClick={() =>
                      quoteList.updateQuantity(item.productId, item.variantLabel, item.quantity + 1)
                    }
                    className="px-2.5 py-1.5 text-ink-soft"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => quoteList.remove(item.productId, item.variantLabel)}
                  className="text-xs font-medium text-ink-soft hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="h-fit bg-white p-6">
            <h2 className="mb-4 font-display text-lg text-ink">Your Contact Info</h2>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Name
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Company (optional)
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Timeline, packaging, use case…"
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>

              {error && <div className="bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-olive-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-olive-700 disabled:opacity-60"
              >
                {submitting ? 'Sending…' : `Send Request (${quoteList.items.length} item${quoteList.items.length === 1 ? '' : 's'})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
