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
import { IconButton } from '@/components/ui';
import { ShippingIcon, ImagePlaceholderIcon } from '@/components/icons';

const ORDER_STATUS_INK: Record<string, string> = {
  PENDING: 'text-amber-700',
  PROCESSING: 'text-blue-700',
  SHIPPED: 'text-indigo-700',
  DELIVERED: 'text-emerald-700',
  CANCELLED: 'text-red-700',
};

function accountId(id: number) {
  return `ACCT-${String(id).padStart(6, '0')}`;
}

function orderNumber(id: number) {
  return `#${String(id).padStart(6, '0')}`;
}

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
    mutationFn: (body: { fullName: string; phone: string }) => customerApi.patch<CustomerProfile>('/auth/me', body),
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

  const fontDisplay = { fontFamily: 'var(--font-account-display), sans-serif' };
  const fontMono = { fontFamily: 'var(--font-account-mono), monospace' };

  return (
    <div className="bg-[#faf9f4]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* ── Certificate header ── */}
        <div className="relative overflow-hidden border border-[#16241c]/15 bg-white px-6 py-8 sm:px-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p
                style={fontMono}
                className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#16241c]/50"
              >
                Account Certificate
              </p>
              {profileLoading ? (
                <div className="mt-3 h-9 w-56 animate-pulse bg-[#16241c]/5" />
              ) : (
                <h1 style={fontDisplay} className="mt-2 text-3xl font-semibold leading-tight text-[#16241c] sm:text-4xl">
                  {profile?.fullName}
                </h1>
              )}
              {profile?.company && (
                <p className="mt-1.5 text-sm text-[#16241c]/60">{profile.company.name}</p>
              )}
              {profile && (
                <p style={fontMono} className="mt-4 text-xs tracking-wide text-[#16241c]/40">
                  {accountId(profile.id)} · Issued {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="shrink-0 self-start text-xs font-medium text-[#16241c]/40 underline decoration-[#16241c]/20 underline-offset-4 hover:text-[#16241c]/70"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          <div className="space-y-8">
          {/* ── Particulars ledger ── */}
          <div className="border border-[#16241c]/15 bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#16241c]/10 pb-3">
              <p style={fontMono} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#16241c]/50">
                Particulars
              </p>
              {!editing && (
                <button
                  onClick={startEditing}
                  className="text-xs font-medium text-brand-700 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {profileLoading && (
              <div className="space-y-4 pt-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-4 w-full animate-pulse bg-[#16241c]/5" />
                ))}
              </div>
            )}

            {profile && !editing && (
              <dl style={fontMono} className="divide-y divide-[#16241c]/10 text-[13px]">
                <Row label="Full name" value={profile.fullName} />
                <Row label="Email" value={profile.email} />
                <Row label="Phone" value={profile.phone || '—'} />
                <Row label="Company" value={profile.company?.name || '—'} readOnly />
              </dl>
            )}

            {profile && editing && (
              <form onSubmit={handleSave} style={fontMono} className="space-y-4 pt-4 text-[13px]">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-wide text-[#16241c]/40">Full name</label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-[#16241c]/20 bg-transparent px-2.5 py-1.5 outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-wide text-[#16241c]/40">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-[#16241c]/20 bg-transparent px-2.5 py-1.5 outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-[#16241c]/40">Email (read-only)</p>
                  <p className="px-2.5 py-1.5 text-[#16241c]/50">{profile.email}</p>
                </div>

                {saveError && (
                  <p className="border border-red-700/30 bg-red-50 px-2.5 py-2 text-[12px] font-sans text-red-700">
                    {saveError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="bg-brand-600 px-4 py-1.5 font-sans text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                  >
                    {saveMutation.isPending ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-1.5 font-sans text-[13px] font-medium text-[#16241c]/50 hover:text-[#16241c]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <ChangePasswordCard fontMono={fontMono} />
          </div>

          {/* ── Recent orders ── */}
          <div>
            <p style={fontMono} className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#16241c]/50">
              Recent Orders
            </p>

            {ordersLoading && (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-20 w-full animate-pulse border border-[#16241c]/10 bg-white" />
                ))}
              </div>
            )}

            {orders && orders.length === 0 && (
              <div className="border border-dashed border-[#16241c]/20 bg-white px-6 py-16 text-center">
                <p className="text-sm text-[#16241c]/50">No orders yet.</p>
                <Link href="/products" className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">
                  Browse products →
                </Link>
              </div>
            )}

            {orders && orders.length > 0 && (
              <div className="border border-[#16241c]/15 bg-white">
                {orders.map((order, idx) => (
                  <div key={order.id} className={idx > 0 ? 'border-t border-[#16241c]/10' : ''}>
                    <div className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-baseline gap-3">
                        <span style={fontMono} className="text-sm font-semibold text-[#16241c]">
                          {orderNumber(order.id)}
                        </span>
                        <span style={fontMono} className="text-xs text-[#16241c]/40">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          style={fontMono}
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            ORDER_STATUS_INK[order.status] || 'text-[#16241c]/50'
                          }`}
                        >
                          [{order.status}]
                        </span>
                        {order.status !== 'CANCELLED' && (
                          <IconButton
                            icon={ShippingIcon}
                            label="Shipping"
                            onClick={() => setShippingModalOrder(order)}
                          />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-dashed border-[#16241c]/10 px-5 py-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-[#16241c]/5">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                            ) : (
                              <ImagePlaceholderIcon className="h-4 w-4 text-[#16241c]/30" />
                            )}
                          </div>
                          <span className="min-w-0 flex-1 text-[#16241c]/70">
                            {item.productName}
                            <span style={fontMono} className="ml-2 text-xs text-[#16241c]/35">
                              ×{item.quantity} · {item.variantLabel}
                            </span>
                          </span>
                          <span style={fontMono} className="shrink-0 text-[#16241c]/70">
                            {formatUsd(Number(item.price) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end border-t border-[#16241c]/10 px-5 py-2.5">
                      <span style={fontMono} className="text-sm font-semibold text-[#16241c]">
                        Total {formatUsd(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {shippingModalOrder && (
        <OrderShippingModal order={shippingModalOrder} onClose={() => setShippingModalOrder(null)} />
      )}
    </div>
  );
}

function ChangePasswordCard({ fontMono }: { fontMono: React.CSSProperties }) {
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

  return (
    <div className="border border-[#16241c]/15 bg-white p-6">
      <div className="flex items-center justify-between border-b border-[#16241c]/10 pb-3">
        <p style={fontMono} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#16241c]/50">
          Password
        </p>
        {!open && (
          <button
            onClick={() => {
              setOpen(true);
              setSuccess(false);
              setFormError(null);
            }}
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            Change
          </button>
        )}
      </div>

      {!open && success && (
        <p className="pt-4 text-[13px] text-emerald-700">Password changed successfully.</p>
      )}

      {!open && !success && (
        <p className="pt-4 text-[13px] text-[#16241c]/50">••••••••</p>
      )}

      {open && (
        <form onSubmit={handleSubmit} style={fontMono} className="space-y-4 pt-4 text-[13px]">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-[#16241c]/40">
              Current password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-[#16241c]/20 bg-transparent px-2.5 py-1.5 outline-none focus:border-brand-600"
            />
            <Link
              href="/account/forgot-password"
              className="mt-1.5 inline-block font-sans text-[12px] font-medium text-brand-700 hover:underline"
            >
              Forgot your current password?
            </Link>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-[#16241c]/40">
              New password
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-[#16241c]/20 bg-transparent px-2.5 py-1.5 outline-none focus:border-brand-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-[#16241c]/40">
              Confirm new password
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-[#16241c]/20 bg-transparent px-2.5 py-1.5 outline-none focus:border-brand-600"
            />
          </div>

          {formError && (
            <p className="border border-red-700/30 bg-red-50 px-2.5 py-2 text-[12px] font-sans text-red-700">
              {formError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-brand-600 px-4 py-1.5 font-sans text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {mutation.isPending ? 'Saving…' : 'Save password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setFormError(null);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="px-4 py-1.5 font-sans text-[13px] font-medium text-[#16241c]/50 hover:text-[#16241c]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Row({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3">
      <dt className="text-[11px] uppercase tracking-wide text-[#16241c]/40">{label}</dt>
      <dd className={`truncate text-right ${readOnly ? 'text-[#16241c]/50' : 'text-[#16241c]'}`}>{value}</dd>
    </div>
  );
}
