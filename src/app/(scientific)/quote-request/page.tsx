'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, Package, Trash2 } from 'lucide-react';
import { useQuoteList } from '@/lib/quoteListStore';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken, decodeCustomerToken } from '@/lib/customerAuth';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { ServerQuoteListItem } from '@/lib/types';
import { categoryImage } from '@/lib/gloss/images';
import { EmptyState } from '@/components/gloss/EmptyState';
import { Quantity } from '@/components/gloss/Quantity';

/**
 * Quote request, in the Gloss Studio design (the prototype's request form:
 * `r-checkout-layout` with an `r-form-card` and an `r-summary`).
 *
 * The page's own behaviour is unchanged: a quote list you can edit, a contact
 * form beside it, guest and signed-in paths, the same submission to
 * `/wholesale/quote-requests`, and the list cleared once it is sent.
 *
 * The form deliberately does not ask for ingredient / quantity / packaging in
 * free text: this page already collects all three per line item, from the
 * quote list beside it.
 */

interface QuoteListRow {
  key: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
}

/**
 * What a buyer actually needs to know before sending a request. The page is
 * otherwise a form, and a form is almost no indexable text — this is the only
 * substantive copy on the route.
 */
const QUOTING_SECTIONS: { title: string; text: string }[] = [
  {
    title: 'A useful quote starts with a clear brief',
    text: `A useful quote starts with a clear brief. Specifically, tell us the material, the grade, the quantity and the delivery destination, and we can usually come back with pricing and availability within one business day. Where a specification is still open, describe the behaviour you need in the formulation and we will suggest candidates that fit.`,
  },
  {
    title: 'Pricing and volume',
    text: `Wholesale pricing moves with volume, pack size and current material cost. Consequently, a price confirmed against a drum quantity will differ from the same material in a 5 kg pail. Additionally, tell us your expected annual usage rather than only the first order — it changes which price band applies and whether we hold stock against your forecast.`,
  },
  {
    title: 'Lead times and stock',
    text: `Stock positions shown in the catalog reflect what is available now. However, availability moves as material ships, so a quote confirms both the price and the quantity we can commit to. Meanwhile, if you are planning a production run several weeks out, say so in the request — we can reserve material or schedule it to arrive against your date.`,
  },
  {
    title: 'Documentation and compliance',
    text: `Most buyers need paperwork before a material can enter a formulation. Therefore, tell us which documents you require: safety data sheets, technical data sheets, certificates of analysis, or origin and allergen statements. In particular, batch-specific documentation has to be requested against the lot you receive, so flag it early rather than after delivery.`,
  },
  {
    title: 'Samples and sourcing to order',
    text: `A significant share of what we ship is sourced to order against a customer specification. Similarly, if a material is not listed in the catalog it is still worth asking. Finally, where you need to trial a material before committing to volume, request a sample in the same message and we will quote both together.`,
  },
];

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
    <form className="r-form-card" onSubmit={handleSubmit}>
      <div className="r-step-label">
        <span>1</span> Your details <span>2</span> Review &amp; submit
      </div>
      <h2>Tell us about your project.</h2>
      <p>A few details will help us understand your project. Grades, availability and specifications are confirmed during quotation.</p>
      <div className="r-form-grid">
        <label className="r-field">
          Full name
          <input
            required
            autoComplete="name"
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="First and last name"
          />
        </label>
        <label className="r-field">
          Work email
          <input
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>
        <label className="r-field">
          <span>
            Company <small>optional</small>
          </span>
          <input
            autoComplete="organization"
            maxLength={200}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
          />
        </label>
        <label className="r-field">
          <span>
            Phone <small>optional</small>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Where we can reach you"
          />
        </label>
        <label className="r-field r-full">
          Project details
          <textarea
            rows={5}
            maxLength={5000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Application, specifications, delivery location, or other requirements"
          />
        </label>
      </div>

      {error && (
        <p className="r-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="r-btn r-primary" disabled={submitting}>
        {submitting ? 'Sending…' : `Send quote request (${items.length} item${items.length === 1 ? '' : 's'})`}
      </button>
      <p className="r-fine">
        Our team replies by email with trade pricing and lead times, usually within one business day. No payment is
        taken.
      </p>
    </form>
  );
}

/** One quote-list line, in the prototype's `r-cart-line` markup. */
function QuoteLine({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: QuoteListRow;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <article className="r-cart-line">
      <Link href={`/products/${item.productSlug}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl || categoryImage(item.productName)} alt={item.productName} width={100} height={100} />
      </Link>
      <div>
        <Link href={`/products/${item.productSlug}`}>
          <h3>{item.productName}</h3>
        </Link>
        <p>{item.variantLabel || 'Size to confirm'}</p>
        <Quantity value={item.quantity} onChange={onUpdateQuantity} />
      </div>
      <button type="button" className="r-icon-button" aria-label={`Remove ${item.productName}`} onClick={onRemove}>
        <Trash2 size={18} />
      </button>
    </article>
  );
}

/** Form card + quote-list summary. Shared by the guest and signed-in paths. */
function QuoteRequestLayout({
  rows,
  onUpdateQuantity,
  onRemove,
  defaultEmail,
  onSubmitted,
}: {
  rows: QuoteListRow[];
  onUpdateQuantity: (row: QuoteListRow, quantity: number) => void;
  onRemove: (row: QuoteListRow) => void;
  defaultEmail: string;
  onSubmitted: () => void;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Your quote list is empty."
        text="Choose Request on any ingredient to add it here, then send one request for everything you need priced."
        href="/products"
        label="Browse ingredients"
      />
    );
  }

  return (
    <div className="r-checkout-layout">
      <ContactForm items={rows} defaultEmail={defaultEmail} onSubmitted={onSubmitted} />
      <aside className="r-summary">
        <h2>Your quote list</h2>
        <p className="r-fine">
          {rows.length} {rows.length === 1 ? 'item' : 'items'} · adjust quantities before sending
        </p>
        <div className="r-cart-lines">
          {rows.map((row) => (
            <QuoteLine
              key={row.key}
              item={row}
              onUpdateQuantity={(q) => onUpdateQuantity(row, q)}
              onRemove={() => onRemove(row)}
            />
          ))}
        </div>
        <div className="r-summary-help">
          <Package size={22} />
          <p>Add as many products as you need pricing on, then submit one request for all of them.</p>
        </div>
        <Link href="/products">Add more ingredients</Link>
      </aside>
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
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      customerApi.patch(`/quote-list/items/${id}`, { quantity }),
    onSuccess: notifyChanged,
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => customerApi.delete(`/quote-list/items/${id}`),
    onSuccess: notifyChanged,
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const clearAll = useMutation({
    mutationFn: () => customerApi.delete('/quote-list'),
    onSuccess: notifyChanged,
  });

  if (isLoading) return <p className="r-loading">Loading your quote list…</p>;

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
        <p className="r-error" role="alert">
          {error}
        </p>
      )}
      <QuoteRequestLayout
        rows={rows}
        defaultEmail={email}
        onUpdateQuantity={(row, quantity) => updateQuantity.mutate({ id: row.key, quantity })}
        onRemove={(row) => removeItem.mutate(row.key)}
        onSubmitted={() => {
          setDone(true);
          clearAll.mutate();
        }}
      />
    </>
  );
}

function QuoteRequestSentPanel() {
  return (
    <div className="r-confirmation">
      <CircleCheck size={54} />
      <span className="r-eyebrow">Request received</span>
      <h2>Quote request sent.</h2>
      <p>Thanks — our team will follow up by email shortly with trade pricing and lead times.</p>
      <Link className="r-btn r-primary" href="/products">
        Continue browsing
      </Link>
      <Link className="r-btn r-outline" href="/account">
        Your account
      </Link>
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
    <QuoteRequestLayout
      rows={rows}
      defaultEmail=""
      onUpdateQuantity={(row, q) => quoteList.updateQuantity(row.productId, row.variantLabel, q)}
      onRemove={(row) => quoteList.remove(row.productId, row.variantLabel)}
      onSubmitted={() => {
        setDone(true);
        quoteList.clear();
      }}
    />
  );
}

export default function QuoteRequestPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = getCustomerToken();
    const decoded = token ? decodeCustomerToken(token) : null;
    setIsAuthed(!!token);
    setEmail(decoded?.email || '');
  }, []);

  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Let’s make the right connection</span>
        <h1>Request a quote.</h1>
        <p>
          Tell us what you’re working on. Add as many products as you need pricing on, then submit one request — no
          need to fill out the form again for each product.
        </p>
      </div>

      <section className="r-wrap r-section">
        {isAuthed ? <CustomerQuoteListView email={email} /> : <GuestQuoteRequestFlow />}
      </section>

      <section className="r-wrap r-section r-quote-guide">
        <div className="r-help-layout">
          <div>
            <span className="r-eyebrow">Before you send</span>
            <h2>How quoting works.</h2>
            <div className="r-faq">
              {QUOTING_SECTIONS.map((s, i) => (
                <details key={s.title} open={i === 0}>
                  <summary>{s.title}</summary>
                  <p>{s.text}</p>
                </details>
              ))}
            </div>
          </div>
          <aside className="r-reading-aside">
            <Package size={28} />
            <h3>From first formulation to full-scale production.</h3>
            <ol>
              <li>Choose your ingredients</li>
              <li>Tell us your requirements</li>
              <li>Start a sourcing conversation</li>
            </ol>
            <Link href="/contact">Ask an ingredient question</Link>
            <Link href="/shipping-returns">Shipping &amp; returns</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
