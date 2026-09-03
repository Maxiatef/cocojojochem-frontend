'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQuoteList } from '@/lib/quoteListStore';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken, decodeCustomerToken } from '@/lib/customerAuth';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { ServerQuoteListItem } from '@/lib/types';
import { ImagePlaceholderIcon } from '@/components/icons';

interface QuoteListRow {
  key: string;
  productId: number;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
}

function ContactForm({
  items,
  defaultEmail,
  onSubmitted,
}: {
  items: QuoteListRow[];
  defaultEmail: string;
  onSubmitted: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
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
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.variantLabel || undefined,
        })),
      });
      onSubmitted();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-fit bg-white p-6">
      <h2 className="mb-4 font-display text-lg text-ink">Your Contact Info</h2>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Email</label>
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
          {submitting ? 'Sending…' : `Send Request (${items.length} item${items.length === 1 ? '' : 's'})`}
        </button>
      </form>
    </div>
  );
}

// Same storefront-styled confirm popup used by the cart (not a native
// browser alert) whenever decrementing a line item's quantity would take it
// to zero.
function RemoveItemConfirm({
  itemName,
  onConfirm,
  onCancel,
}: {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-xs bg-white p-5 shadow-xl">
        <p className="text-sm text-ink">
          Remove <span className="font-semibold">{itemName}</span> from your quote list?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="border border-sand-300 px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteListRowView({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: QuoteListRow;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  return (
    <div className="flex items-center gap-4 border-b border-sand-200 py-4 last:border-0">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-sand-100">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholderIcon className="h-6 w-6 text-sand-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${item.productSlug}`} className="truncate font-medium text-ink hover:text-olive-700">
          {item.productName}
        </Link>
        {item.variantLabel && <p className="text-xs text-ink-soft">{item.variantLabel}</p>}
      </div>
      <div className="flex items-center border border-sand-300">
        <button
          onClick={() => {
            if (item.quantity <= 1) {
              setConfirmingRemove(true);
              return;
            }
            onUpdateQuantity(item.quantity - 1);
          }}
          className="px-2.5 py-1.5 text-ink-soft"
        >
          −
        </button>
        <span className="w-8 text-center text-sm text-ink">{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.quantity + 1)} className="px-2.5 py-1.5 text-ink-soft">
          +
        </button>
      </div>
      <button onClick={onRemove} className="text-xs font-medium text-ink-soft hover:text-red-600">
        Remove
      </button>

      {confirmingRemove && (
        <RemoveItemConfirm
          itemName={item.productName}
          onCancel={() => setConfirmingRemove(false)}
          onConfirm={() => {
            onRemove();
            setConfirmingRemove(false);
          }}
        />
      )}
    </div>
  );
}

function CustomerQuoteListView({ email }: { email: string }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['customer-quote-list'],
    queryFn: () => customerApi.get<ServerQuoteListItem[]>('/quote-list'),
  });

  function notifyChanged() {
    queryClient.invalidateQueries({ queryKey: ['customer-quote-list'] });
    window.dispatchEvent(new Event('cocojojochem-server-quote-list-changed'));
  }

  const updateQuantity = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      customerApi.patch(`/quote-list/items/${id}`, { quantity }),
    onSuccess: notifyChanged,
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: (id: number) => customerApi.delete(`/quote-list/items/${id}`),
    onSuccess: notifyChanged,
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const clearAll = useMutation({
    mutationFn: () => customerApi.delete('/quote-list'),
    onSuccess: notifyChanged,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  if (done) return <QuoteRequestSentPanel />;

  const rows: QuoteListRow[] = (data || []).map((item) => ({
    key: String(item.id),
    productId: item.productId,
    productSlug: item.productSlug,
    productName: item.productName,
    variantLabel: item.variantLabel,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
  }));

  return (
    <>
      {error && <div className="mb-4 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="bg-white px-5">
          {rows.length === 0 ? (
            <div className="border border-dashed border-sand-300 py-20 text-center">
              <p className="text-sm text-ink-soft">Your quote list is empty.</p>
              <Link href="/products" className="mt-3 inline-block font-medium text-olive-700 hover:underline">
                Browse products →
              </Link>
            </div>
          ) : (
            (data || []).map((item) => (
              <QuoteListRowView
                key={item.id}
                item={{
                  key: String(item.id),
                  productId: item.productId,
                  productSlug: item.productSlug,
                  productName: item.productName,
                  variantLabel: item.variantLabel,
                  imageUrl: item.imageUrl,
                  quantity: item.quantity,
                }}
                onUpdateQuantity={(quantity) => updateQuantity.mutate({ id: item.id, quantity })}
                onRemove={() => removeItem.mutate(item.id)}
              />
            ))
          )}
        </div>
        {rows.length > 0 && (
          <ContactForm
            items={rows}
            defaultEmail={email}
            onSubmitted={() => {
              setDone(true);
              clearAll.mutate();
            }}
          />
        )}
      </div>
    </>
  );
}

function QuoteRequestSentPanel() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl text-ink">Quote Request Sent</h1>
      <p className="mt-3 text-sm text-ink-soft">Thanks — our team will follow up by email shortly with pricing.</p>
      <Link href="/products" className="mt-6 inline-block font-medium text-olive-700 hover:underline">
        Continue browsing →
      </Link>
    </div>
  );
}

export default function QuoteRequestPage() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = getCustomerToken();
    const decoded = token ? decodeCustomerToken(token) : null;
    setIsAuthed(!!token);
    setEmail(decoded?.email || '');
  }, []);

  if (isAuthed === null) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Quote Request</p>
      <h1 className="mb-2 mt-1 font-display text-4xl text-ink">Your Quote List</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Add as many products as you need pricing on, then submit one request — no need to fill out the form again
        for each product.
      </p>

      {isAuthed ? <CustomerQuoteListView email={email} /> : <GuestQuoteRequestFlow />}
    </div>
  );
}

function GuestQuoteRequestFlow() {
  const quoteList = useQuoteList();
  const [done, setDone] = useState(false);

  if (done) return <QuoteRequestSentPanel />;

  const rows: QuoteListRow[] = quoteList.items.map((item) => ({
    key: `${item.productId}-${item.variantLabel}`,
    productId: item.productId,
    productSlug: item.productSlug,
    productName: item.productName,
    variantLabel: item.variantLabel,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
  }));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div className="bg-white px-5">
        {rows.length === 0 ? (
          <div className="border border-dashed border-sand-300 py-20 text-center">
            <p className="text-sm text-ink-soft">Your quote list is empty.</p>
            <Link href="/products" className="mt-3 inline-block font-medium text-olive-700 hover:underline">
              Browse products →
            </Link>
          </div>
        ) : (
          rows.map((item) => (
            <QuoteListRowView
              key={item.key}
              item={item}
              onUpdateQuantity={(q) => quoteList.updateQuantity(item.productId, item.variantLabel, q)}
              onRemove={() => quoteList.remove(item.productId, item.variantLabel)}
            />
          ))
        )}
      </div>
      {rows.length > 0 && (
        <ContactForm
          items={rows}
          defaultEmail=""
          onSubmitted={() => {
            setDone(true);
            quoteList.clear();
          }}
        />
      )}
    </div>
  );
}
