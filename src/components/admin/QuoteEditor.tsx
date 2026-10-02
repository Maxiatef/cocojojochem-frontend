'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { displayId } from '@/lib/ids';
import { formatUsd } from '@/lib/pricing';
import { QuoteRequest } from '@/lib/types';

interface LineDraft {
  id: string;
  isAvailable: boolean;
  quotedPrice: string;
  quotedPackSize: string;
  quotedQuantity: string;
  availability: string;
  quoteNote: string;
}

const input =
  'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:bg-slate-50 disabled:text-slate-400';

/**
 * Price a request and send the quote. Per line: available or not, unit
 * price, pack size, quantity (defaults to what was asked), availability and a
 * note. "Send quote" emails the customer a link where they can accept the
 * quote into their cart at these prices, or decline it.
 */
export function QuoteEditor({
  qr,
  canEdit,
  onSaved,
}: {
  qr: QuoteRequest;
  canEdit: boolean;
  onSaved: (next: QuoteRequest) => void;
}) {
  const [lines, setLines] = useState<LineDraft[]>(() =>
    qr.items.map((i) => ({
      id: i.id,
      isAvailable: i.isAvailable !== false,
      quotedPrice: i.quotedPrice != null ? String(Number(i.quotedPrice)) : '',
      quotedPackSize: i.quotedPackSize || i.unit || '',
      quotedQuantity: String(i.quotedQuantity ?? i.quantity ?? 1),
      availability: i.availability || '',
      quoteNote: i.quoteNote || '',
    })),
  );
  const [message, setMessage] = useState(qr.quoteMessage || '');
  const [shipping, setShipping] = useState(qr.quotedShippingCost != null ? String(Number(qr.quotedShippingCost)) : '');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locked = !canEdit || !!qr.quoteOrderId || qr.status === 'LOST';
  const sentBefore = !!qr.quotedAt;

  const save = useMutation({
    mutationFn: (send: boolean) =>
      api.put<QuoteRequest>(`/wholesale/quote-requests/${qr.id}/quote`, {
        send,
        quoteMessage: message || null,
        quotedShippingCost: shipping.trim() === '' ? null : Number(shipping),
        items: lines.map((l) => ({
          id: l.id,
          isAvailable: l.isAvailable,
          quotedPrice: l.isAvailable && l.quotedPrice.trim() !== '' ? Number(l.quotedPrice) : null,
          quotedPackSize: l.quotedPackSize || null,
          quotedQuantity: l.quotedQuantity.trim() !== '' ? Math.max(1, Math.round(Number(l.quotedQuantity))) : null,
          availability: l.availability || null,
          quoteNote: l.quoteNote || null,
        })),
      }),
    onSuccess: (next, send) => {
      setError(null);
      setNotice(send ? 'Quote emailed to the customer.' : 'Draft saved — not sent.');
      onSaved(next);
    },
    onError: (err) => {
      setNotice(null);
      setError(getFriendlyErrorMessage(err));
    },
  });

  const update = (i: number, patch: Partial<LineDraft>) =>
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const subtotal = lines.reduce(
    (sum, l) =>
      l.isAvailable && l.quotedPrice.trim() !== '' ? sum + Number(l.quotedPrice) * (Number(l.quotedQuantity) || 1) : sum,
    0,
  );
  const shippingNum = shipping.trim() === '' ? null : Number(shipping);
  const link = qr.quoteToken && typeof window !== 'undefined' ? `${window.location.origin}/quotes/${qr.quoteToken}` : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quote</p>
        <QuoteState qr={qr} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">Avail.</th>
              <th className="px-3 py-2 font-medium">Unit price $</th>
              <th className="px-3 py-2 font-medium">Pack size</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Lead time / stock</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const item = qr.items[i];
              return (
                <tr key={l.id} className="border-b border-slate-100 align-top last:border-0">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      Asked: {item.quantity ?? 1} × {item.unit || 'any size'}
                      {item.source === 'SUPPLIER_REFERENCE' ? ' · supplier ref' : ''}
                    </p>
                    <input
                      className={`${input} mt-1.5`}
                      placeholder="Note to customer (optional)"
                      value={l.quoteNote}
                      disabled={locked}
                      onChange={(e) => update(i, { quoteNote: e.target.value })}
                      aria-label={`Note for ${item.productName}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={l.isAvailable}
                      disabled={locked}
                      onChange={(e) => update(i, { isAvailable: e.target.checked })}
                      aria-label={`${item.productName} available`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={input}
                      inputMode="decimal"
                      placeholder="0.00"
                      value={l.quotedPrice}
                      disabled={locked || !l.isAvailable}
                      onChange={(e) => update(i, { quotedPrice: e.target.value.replace(/[^0-9.]/g, '') })}
                      aria-label={`Unit price for ${item.productName}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={input}
                      placeholder="e.g. 5 kg pail"
                      value={l.quotedPackSize}
                      disabled={locked || !l.isAvailable}
                      onChange={(e) => update(i, { quotedPackSize: e.target.value })}
                      aria-label={`Pack size for ${item.productName}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={`${input} w-16`}
                      inputMode="numeric"
                      value={l.quotedQuantity}
                      disabled={locked || !l.isAvailable}
                      onChange={(e) => update(i, { quotedQuantity: e.target.value.replace(/[^0-9]/g, '') })}
                      aria-label={`Quantity for ${item.productName}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={input}
                      placeholder="In stock / 2–3 weeks"
                      value={l.availability}
                      disabled={locked}
                      onChange={(e) => update(i, { availability: e.target.value })}
                      aria-label={`Availability for ${item.productName}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-500">Message to the customer (optional)</span>
          <textarea
            className={input}
            rows={3}
            value={message}
            disabled={locked}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Grade notes, documents included, delivery timing…"
          />
        </label>
        <div className="space-y-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">Shipping $ (required · 0 = free/included)</span>
            <input
              className={input}
              inputMode="decimal"
              value={shipping}
              disabled={locked}
              onChange={(e) => setShipping(e.target.value.replace(/[^0-9.]/g, ''))}
            />
          </label>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Items</span>
              <span>{formatUsd(subtotal)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Quote total</span>
              <span>
                {formatUsd(subtotal + (shippingNum ?? 0))}
                {shippingNum == null ? ' + shipping?' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{notice}</div>}

      {!locked && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-sci-blue px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={save.isPending}
            onClick={() => save.mutate(true)}
          >
            {save.isPending ? 'Saving…' : sentBefore ? 'Update & re-send quote' : 'Send quote to customer'}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            disabled={save.isPending}
            onClick={() => save.mutate(false)}
          >
            Save draft
          </button>
          <span className="text-xs text-slate-500">
            Sending emails the customer a link to accept the quote into their cart, or decline it.
          </span>
        </div>
      )}

      {link && (
        <p className="text-xs text-slate-500">
          Customer&rsquo;s quote link:{' '}
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sci-blue hover:underline">
            {link}
          </a>
        </p>
      )}
    </div>
  );
}

/** Where the quote stands, for the admin. */
export function QuoteState({ qr }: { qr: QuoteRequest }) {
  const pill = (text: string, cls: string) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{text}</span>
  );
  if (qr.quoteOrderId) {
    return (
      <span className="inline-flex items-center gap-2">
        {pill('Quote paid', 'bg-green-50 text-green-700')}
        <Link href={`/admin/orders?open=${qr.quoteOrderId}`} className="text-xs text-sci-blue hover:underline">
          Order {displayId(qr.quoteOrderId)}
        </Link>
      </span>
    );
  }
  if (qr.declinedAt) return pill('Declined by customer', 'bg-red-50 text-red-700');
  if (qr.status === 'LOST') return pill('Closed', 'bg-slate-100 text-slate-600');
  if (qr.acceptedAt) return pill('Accepted · in cart, not paid', 'bg-amber-50 text-amber-700');
  if (qr.quotedAt) return pill(`Sent ${new Date(qr.quotedAt).toLocaleDateString()}`, 'bg-purple-50 text-purple-700');
  return pill('Not quoted yet', 'bg-slate-100 text-slate-500');
}
