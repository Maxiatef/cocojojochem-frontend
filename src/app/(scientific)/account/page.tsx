'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { clearCustomerToken, getCustomerToken } from '@/lib/customerAuth';
import { CustomerProfile, Order } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { OrderShippingModal } from '@/components/storefront/OrderShippingModal';
import { ShippingIcon, ImagePlaceholderIcon } from '@/components/icons';
import { Container } from '@/components/scientific/primitives';

/**
 * The customer account, in the Scientific edition.
 *
 * Design premise: this is a trade account record, not a consumer profile. The
 * people who reach it read specification sheets all day — INCI, CAS, pack
 * size, hairline label/value rows — so the account is presented in exactly
 * that grammar, the same one the product pages use for materials. The old
 * page half-sensed this (it called itself an "Account Certificate") but drew
 * it as a cream-and-dark-green certificate in a palette used nowhere else.
 *
 * Two structural changes from that version:
 *
 *  - Orders take the wide column and the account panel the narrow one. It was
 *    the other way round, which put settings ahead of the thing people
 *    actually come here for, and read in the opposite order to the product
 *    page and the cart.
 *  - The navy header carries a ledger line — orders placed, lifetime value,
 *    open orders. None of it was shown anywhere before, and standing is the
 *    first thing a trade buyer looks for on their own account.
 *
 * Monospace is load-bearing rather than decorative: account ids, order
 * numbers, dates and money are strings you compare against a printed
 * document, and a proportional face makes 0/O and 1/l ambiguous.
 */

/** Orders still moving. Anything else is history or was cancelled. */
const OPEN_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED'];

const STATUS_PILL: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800',
  PROCESSING: 'bg-sci-blue/10 text-sci-blue',
  SHIPPED: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const MONO = { fontFamily: 'var(--font-account-mono), monospace' } as const;

function accountId(id: number) {
  return `ACCT-${String(id).padStart(6, '0')}`;
}

function orderNumber(id: number) {
  return `#${String(id).padStart(6, '0')}`;
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      style={MONO}
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        STATUS_PILL[status] || 'bg-sci-pale text-sci-muted'
      }`}
    >
      {status}
    </span>
  );
}

/** A label/value row, the same shape the product pages use for specs. */
function SpecRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="grid grid-cols-[88px_1fr] items-baseline gap-4 py-3">
      <dt className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
        {label}
      </dt>
      <dd
        style={MONO}
        className={`truncate text-[13px] ${muted ? 'text-sci-muted' : 'text-sci-navy'}`}
      >
        {value}
      </dd>
    </div>
  );
}

/** One figure in the header's ledger line. */
function LedgerFigure({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span style={MONO} className="text-[22px] font-semibold leading-7 text-white">
        {value}
      </span>
      <span className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-accent">
        {label}
      </span>
    </div>
  );
}

const PANEL_HEADING =
  'font-sci-body text-sci-eyebrow font-semibold uppercase tracking-wide text-sci-navy';

const SMALL_FIELD =
  'w-full rounded-md border border-sci-border bg-white px-3 py-2 text-[13px] text-sci-navy outline-none transition focus:border-sci-blue';

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!getCustomerToken()) {
      router.replace('/account/login?redirect=/account');
      return;
    }
    setReady(true);
  }, [router]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => customerApi.get<CustomerProfile>('/auth/me'),
    enabled: ready,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => customerApi.get<Order[]>('/orders'),
    enabled: ready,
  });

  const saveMutation = useMutation({
    mutationFn: (body: { fullName: string; phone: string }) =>
      customerApi.patch<CustomerProfile>('/auth/me', body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['customer-profile'], updated);
      setEditing(false);
    },
    onError: (err) => setSaveError(getFriendlyErrorMessage(err)),
  });

  function startEditing() {
    if (!profile) return;
    setFullName(profile.fullName);
    setPhone(profile.phone || '');
    setSaveError(null);
    setEditing(true);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    saveMutation.mutate({ fullName, phone });
  }

  function handleLogout() {
    clearCustomerToken();
    router.push('/account/login');
  }

  if (!ready) return null;

  // Cancelled orders are excluded from lifetime value — money that was never
  // taken shouldn't inflate a figure a buyer may quote back to us.
  const settled = (orders || []).filter((o) => o.status !== 'CANCELLED');
  const lifetime = settled.reduce((sum, o) => sum + Number(o.total), 0);
  const openCount = (orders || []).filter((o) => OPEN_STATUSES.includes(o.status)).length;

  return (
    <>
      {/* Account header. Navy, full width — the same opening every migrated
          page uses, so the account reads as part of the site rather than as a
          separate application bolted onto it. */}
      <section className="bg-sci-navy py-12 text-white">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <p style={MONO} className="text-[11px] uppercase tracking-[0.2em] text-sci-accent">
                {profile ? accountId(profile.id) : 'Account'}
              </p>

              {profileLoading ? (
                <div className="mt-3 h-10 w-64 animate-pulse rounded bg-white/10" />
              ) : (
                <h1 className="mt-2 font-sci-heading text-[32px] font-semibold leading-10 sm:text-[44px] sm:leading-[52px]">
                  {profile?.fullName}
                </h1>
              )}

              {profile && (
                <p className="mt-2 font-sci-body text-sci-body text-[#adc6d8]">
                  {profile.company?.name ? `${profile.company.name} · ` : ''}
                  Member since{' '}
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="shrink-0 rounded-md border border-white/20 px-4 py-2.5 font-sci-body text-sci-label font-medium text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>

          {/* Ledger line. Standing, quantified — the first thing a trade buyer
              looks for and the one thing this page never used to show. */}
          <dl className="flex flex-wrap items-end gap-x-12 gap-y-6 border-t border-white/15 pt-6">
            <LedgerFigure
              value={ordersLoading ? '—' : String((orders || []).length)}
              label="Orders placed"
            />
            <LedgerFigure
              value={ordersLoading ? '—' : formatUsd(lifetime)}
              label="Lifetime value"
            />
            <LedgerFigure
              value={ordersLoading ? '—' : String(openCount)}
              label="Open orders"
            />
          </dl>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
          {/* ---- Order history: the reason people open this page ---- */}
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-4 border-b border-sci-border pb-4">
              <h2 className="font-sci-heading text-sci-subheading font-semibold text-sci-navy">
                Order history
              </h2>
              {orders && orders.length > 0 && (
                <Link
                  href="/account/orders"
                  className="font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
                >
                  Track an order →
                </Link>
              )}
            </div>

            {ordersLoading && (
              <div className="mt-6 flex flex-col gap-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-28 w-full animate-pulse rounded-xl border border-sci-border bg-sci-pale"
                  />
                ))}
              </div>
            )}

            {orders && orders.length === 0 && (
              <div className="mt-6 rounded-xl border border-dashed border-sci-border px-6 py-16 text-center">
                <p className="font-sci-body text-sci-body text-sci-muted">
                  No orders yet.
                </p>
                <Link
                  href="/products"
                  className="mt-3 inline-block font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
                >
                  Browse the catalog →
                </Link>
              </div>
            )}

            {orders && orders.length > 0 && (
              <ul className="mt-6 flex flex-col gap-4">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="overflow-hidden rounded-xl border border-sci-border bg-white"
                  >
                    {/* Docket head */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-sci-pale px-5 py-3.5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span
                          style={MONO}
                          className="text-[15px] font-semibold text-sci-navy"
                        >
                          {orderNumber(order.id)}
                        </span>
                        <span style={MONO} className="text-xs text-sci-muted">
                          {shortDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusPill status={order.status} />
                        {order.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setShippingModalOrder(order)}
                            className="inline-flex items-center gap-1.5 font-sci-body text-sci-label font-medium text-sci-blue transition hover:underline"
                          >
                            <ShippingIcon className="h-4 w-4" />
                            Tracking
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Line items */}
                    <ul className="flex flex-col divide-y divide-sci-border px-5">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 py-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sci-pale">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImagePlaceholderIcon className="h-4 w-4 text-sci-border" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-sci-body text-sci-label font-medium text-sci-navy">
                              {item.productName}
                            </p>
                            <p style={MONO} className="text-xs text-sci-muted">
                              {item.variantLabel} × {item.quantity}
                            </p>
                          </div>

                          <span
                            style={MONO}
                            className="shrink-0 text-[13px] text-sci-navy"
                          >
                            {formatUsd(Number(item.price) * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-baseline justify-end gap-3 border-t border-sci-border px-5 py-3">
                      <span className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
                        Total
                      </span>
                      <span
                        style={MONO}
                        className="text-[15px] font-semibold text-sci-navy"
                      >
                        {formatUsd(order.total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ---- Account panel ---- */}
          <aside className="flex flex-col gap-6">
            {/* Saved products sit above the account details: it is a place
                people return to, where the details panel is something they set
                once and rarely reopen. */}
            <Link
              href="/account/wishlist"
              className="group flex items-center justify-between gap-4 rounded-xl border border-sci-border bg-white p-6 transition hover:border-sci-blue"
            >
              <span className="flex flex-col gap-1">
                <span className={PANEL_HEADING}>Saved products</span>
                <span className="font-sci-body text-sci-label text-sci-muted">
                  Your shortlist, with live pricing
                </span>
              </span>
              <span
                aria-hidden
                className="font-sci-body text-sci-label font-medium text-sci-blue transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>

            <div className="rounded-xl border border-sci-border bg-white p-6">
              <div className="flex items-center justify-between border-b border-sci-border pb-3">
                <h2 className={PANEL_HEADING}>Account details</h2>
                {!editing && profile && (
                  <button
                    onClick={startEditing}
                    className="font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {profileLoading && (
                <div className="flex flex-col gap-3 pt-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-4 w-full animate-pulse rounded bg-sci-pale" />
                  ))}
                </div>
              )}

              {profile && !editing && (
                <dl className="divide-y divide-sci-border">
                  <SpecRow label="Name" value={profile.fullName} />
                  <SpecRow label="Email" value={profile.email} muted />
                  <SpecRow label="Phone" value={profile.phone || 'Not set'} />
                  {profile.company?.name && (
                    <SpecRow label="Company" value={profile.company.name} muted />
                  )}
                </dl>
              )}

              {profile && editing && (
                <form onSubmit={handleSave} className="flex flex-col gap-4 pt-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
                      Full name
                    </span>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={MONO}
                      className={SMALL_FIELD}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
                      Phone
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={MONO}
                      className={SMALL_FIELD}
                    />
                  </label>

                  <p className="font-sci-body text-sci-label text-sci-muted">
                    Email can&rsquo;t be changed here — contact us to move the account to a
                    different address.
                  </p>

                  {saveError && (
                    <p
                      role="alert"
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-sci-body text-sci-label text-red-700"
                    >
                      {saveError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="rounded-md bg-sci-accent px-4 py-2.5 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:opacity-60"
                    >
                      {saveMutation.isPending ? 'Saving…' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="rounded-md px-4 py-2.5 font-sci-body text-sci-label font-medium text-sci-muted transition hover:text-sci-navy"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <ChangePasswordCard />

            <div className="rounded-xl border border-sci-border bg-sci-pale p-6">
              <h2 className={PANEL_HEADING}>Need something sourced?</h2>
              <p className="mt-3 font-sci-body text-sci-label text-sci-muted">
                Tell us the grade, volume and timing and we&rsquo;ll confirm what we can supply.
              </p>
              <Link
                href="/quote-request"
                className="mt-4 inline-block font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
              >
                Request a quote →
              </Link>
            </div>
          </aside>
        </Container>
      </section>

      {shippingModalOrder && (
        <OrderShippingModal order={shippingModalOrder} onClose={() => setShippingModalOrder(null)} />
      )}
    </>
  );
}

function ChangePasswordCard() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      customerApi.patch('/auth/me/password', body),
    onSuccess: () => {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormError(null);
      setOpen(false);
    },
    onError: (err) => {
      setSuccess(false);
      setFormError(getFriendlyErrorMessage(err));
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation do not match.');
      return;
    }
    mutation.mutate({ currentPassword, newPassword });
  }

  function reset() {
    setOpen(false);
    setFormError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="rounded-xl border border-sci-border bg-white p-6">
      <div className="flex items-center justify-between border-b border-sci-border pb-3">
        <h2 className={PANEL_HEADING}>Password</h2>
        {!open && (
          <button
            onClick={() => {
              setOpen(true);
              setSuccess(false);
              setFormError(null);
            }}
            className="font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
          >
            Change
          </button>
        )}
      </div>

      {!open && (
        <p className="pt-4 font-sci-body text-sci-label text-sci-muted">
          {success ? (
            <span className="text-emerald-700">Password changed.</span>
          ) : (
            <span style={MONO}>••••••••</span>
          )}
        </p>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
              Current password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={SMALL_FIELD}
            />
            <Link
              href="/account/forgot-password"
              className="font-sci-body text-xs font-medium text-sci-blue hover:underline"
            >
              Forgot your current password?
            </Link>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
              New password
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={SMALL_FIELD}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
              Confirm new password
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={SMALL_FIELD}
            />
          </label>

          {formError && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-sci-body text-sci-label text-red-700"
            >
              {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-sci-accent px-4 py-2.5 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:opacity-60"
            >
              {mutation.isPending ? 'Saving…' : 'Save password'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-md px-4 py-2.5 font-sci-body text-sci-label font-medium text-sci-muted transition hover:text-sci-navy"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
