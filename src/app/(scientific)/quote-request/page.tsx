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
import { Container, Eyebrow } from '@/components/scientific/primitives';

/**
 * Quote request, restyled to the "Scientific edition" design
 * (Figma rj57PsDgSsbo86iG4RC1SA, nodes 33:586 desktop / 33:735 mobile).
 *
 * The page's own structure is unchanged: a quote list you can edit, a contact
 * form beside it, guest and signed-in paths, the same submission. What comes
 * from the design is the styling and the surrounding copy — the navy
 * "sourcing introduction" panel with its three steps, the field labels and
 * placeholders, and the notes under the submit button.
 *
 * The design's Ingredient / Quantity / Packaging fields are deliberately not
 * added: this page already collects all three per line item, from the quote
 * list on the left. Asking again in free text would produce two answers to the
 * same question and no way to tell which the buyer meant.
 */

interface QuoteListRow {
  key: string;
  productId: number;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
}

const FIELD_CLASS =
  'w-full border border-sci-border bg-white p-4 font-sci-body text-sci-body text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-sci-body text-sci-label font-medium text-sci-navy">{children}</span>
  );
}

/**
 * The navy panel from 33:587, promoted to the page's full-width header — it
 * carries the page title now, so the pale introduction that used to sit above
 * it is gone rather than repeating the same three sentences twice.
 *
 * Two columns from `lg`: at full width a single column would set 16px body
 * copy across 1300px, which is roughly twice a comfortable measure.
 */
function SourcingIntro() {
  return (
    <section className="bg-sci-navy py-16 text-white">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <Eyebrow tone="white">Let’s make the right connection</Eyebrow>

          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] md:text-[64px] md:leading-[72px]">
            Request a quote
          </h1>

          <p className="font-sci-heading text-[26px] font-semibold leading-[34px] text-sci-accent">
            Your next formula starts here.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="font-sci-body text-sci-body">
            Add as many products as you need pricing on, then submit one request — no need to fill
            out the form again for each product.
          </p>

          <p className="font-sci-body text-sci-body">
            Tell us what you’re working on. Share the ingredients, quantities, and support you need.
          </p>

          <ol className="flex flex-col gap-1 font-sci-body text-sci-body">
            <li>
              <span className="mr-3 text-sci-accent">01</span>Choose your ingredients
            </li>
            <li>
              <span className="mr-3 text-sci-accent">02</span>Tell us your requirements
            </li>
            <li>
              <span className="mr-3 text-sci-accent">03</span>Start a sourcing conversation
            </li>
          </ol>

          <p className="font-sci-body text-sci-label font-medium text-[#adc6d8]">
            From first formulation to full-scale production.
          </p>
        </div>
      </Container>
    </section>
  );
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
    <div className="h-fit bg-white p-8 md:p-10">
      <h2 className="font-sci-heading text-[28px] font-semibold leading-[36px] text-sci-navy">
        Your details
      </h2>
      <p className="mt-3 font-sci-body text-sci-body text-sci-muted">
        A few details will help us understand your project.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        {/* Paired on wide screens as the design has them; this column is
            narrow on most viewports, so the pairing only kicks in at xl. */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <label className="flex flex-col gap-2">
            <FieldLabel>Your name *</FieldLabel>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="First and last name"
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-2">
            <FieldLabel>Work email *</FieldLabel>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-2">
            <FieldLabel>Company</FieldLabel>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name"
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-2">
            <FieldLabel>Phone</FieldLabel>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Where we can reach you"
              className={FIELD_CLASS}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <FieldLabel>Project details</FieldLabel>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Application, specifications, delivery location, or other requirements"
            className={FIELD_CLASS}
          />
        </label>

        <p className="font-sci-body text-sci-label font-medium text-sci-muted">
          * Required fields. Grades, availability, and specifications are confirmed during
          quotation.
        </p>

        {error && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 font-sci-body text-sci-label text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:opacity-60"
        >
          {submitting
            ? 'Sending…'
            : `Send quote request (${items.length} item${items.length === 1 ? '' : 's'}) →`}
        </button>

        <p className="font-sci-body text-sci-label font-medium text-sci-muted">
          Our team replies by email with trade pricing and lead times, usually within one business
          day.
        </p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sci-deep/50 px-4">
      <div className="w-full max-w-xs bg-white p-6 shadow-xl">
        <p className="font-sci-body text-sci-body text-sci-navy">
          Remove <span className="font-semibold">{itemName}</span> from your quote list?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="border border-sci-border px-4 py-2 font-sci-body text-sci-label font-medium text-sci-muted transition hover:text-sci-navy"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 px-4 py-2 font-sci-body text-sci-label font-medium text-white transition hover:bg-red-700"
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
    <div className="flex flex-wrap items-center gap-4 border-b border-sci-border py-5 last:border-0">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sci-pale">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholderIcon className="h-6 w-6 text-sci-border" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${item.productSlug}`}
          className="block truncate font-sci-body text-sci-body font-medium text-sci-navy hover:text-sci-blue"
        >
          {item.productName}
        </Link>
        {item.variantLabel && (
          <p className="font-sci-body text-sci-label text-sci-muted">{item.variantLabel}</p>
        )}
      </div>

      <div className="flex items-center rounded-md border border-sci-border">
        <button
          type="button"
          aria-label={`Decrease quantity of ${item.productName}`}
          onClick={() => {
            if (item.quantity <= 1) {
              setConfirmingRemove(true);
              return;
            }
            onUpdateQuantity(item.quantity - 1);
          }}
          className="px-3 py-2 font-sci-body text-sci-muted transition hover:text-sci-navy"
        >
          −
        </button>
        <span className="w-8 text-center font-sci-body text-sci-label text-sci-navy">
          {item.quantity}
        </span>
        <button
          type="button"
          aria-label={`Increase quantity of ${item.productName}`}
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="px-3 py-2 font-sci-body text-sci-muted transition hover:text-sci-navy"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="font-sci-body text-sci-label font-medium text-sci-muted transition hover:text-red-600"
      >
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

function EmptyQuoteList() {
  return (
    <div className="border border-dashed border-sci-border py-20 text-center">
      <p className="font-sci-body text-sci-body text-sci-muted">Your quote list is empty.</p>
      <Link
        href="/products"
        className="mt-3 inline-block font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
      >
        Browse products →
      </Link>
    </div>
  );
}

/** Left column + right rail. Shared by the guest and signed-in paths. */
function QuoteRequestLayout({
  rows,
  renderRows,
  defaultEmail,
  onSubmitted,
}: {
  rows: QuoteListRow[];
  renderRows: () => React.ReactNode;
  defaultEmail: string;
  onSubmitted: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_460px]">
      <div className="bg-white p-6 md:p-8">
        <h2 className="mb-2 font-sci-heading text-sci-subheading font-semibold text-sci-navy">
          Your quote list
        </h2>
        {rows.length > 0 && (
          <p className="mb-4 font-sci-body text-sci-label text-sci-muted">
            {rows.length} {rows.length === 1 ? 'item' : 'items'} · adjust quantities before sending
          </p>
        )}
        {rows.length === 0 ? <EmptyQuoteList /> : renderRows()}
      </div>

      {rows.length > 0 && (
        <ContactForm items={rows} defaultEmail={defaultEmail} onSubmitted={onSubmitted} />
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
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
      {error && (
        <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 font-sci-body text-sci-label text-red-700">
          {error}
        </p>
      )}
      <QuoteRequestLayout
        rows={rows}
        defaultEmail={email}
        onSubmitted={() => {
          setDone(true);
          clearAll.mutate();
        }}
        renderRows={() =>
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
        }
      />
    </>
  );
}

function QuoteRequestSentPanel() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <Eyebrow>Request received</Eyebrow>
      <h2 className="mt-4 font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy md:text-sci-heading">
        Quote request sent.
      </h2>
      <p className="mt-4 font-sci-body text-sci-body text-sci-muted">
        Thanks — our team will follow up by email shortly with trade pricing and lead times.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-block font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
      >
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
    <>
      <SourcingIntro />

      <section className="bg-sci-pale py-16">
        <Container>
          {isAuthed ? <CustomerQuoteListView email={email} /> : <GuestQuoteRequestFlow />}
        </Container>
      </section>
    </>
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
    <QuoteRequestLayout
      rows={rows}
      defaultEmail=""
      onSubmitted={() => {
        setDone(true);
        quoteList.clear();
      }}
      renderRows={() =>
        rows.map((item) => (
          <QuoteListRowView
            key={item.key}
            item={item}
            onUpdateQuantity={(q) =>
              quoteList.updateQuantity(item.productId, item.variantLabel, q)
            }
            onRemove={() => quoteList.remove(item.productId, item.variantLabel)}
          />
        ))
      }
    />
  );
}
