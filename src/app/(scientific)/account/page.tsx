'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRound } from 'lucide-react';
import { customerApi } from '@/lib/customerApi';
import { clearCustomerToken, getCustomerToken } from '@/lib/customerAuth';
import { CustomerProfile, Order } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { OrderShippingModal } from '@/components/commerce/OrderShippingModal';
import { shortId } from '@/lib/ids';
import { useStorefrontSession } from '@/lib/useStorefrontSession';
import { useCompare, useProjects } from '@/lib/gloss/stores';
import { OrderCard } from '@/components/gloss/account/OrderCard';
import { ReorderButton } from '@/components/gloss/account/ReorderButton';
import { RequestHistory } from '@/components/gloss/account/RequestHistory';
import { PasswordInput } from '@/components/gloss/account/PasswordInput';

/**
 * The customer account, in the Gloss Studio design.
 *
 * The prototype's account page is a short workspace: an intro panel, a row of
 * count tiles, and "Your requests". Ours is a real trade account, so the same
 * frame carries more:
 *
 *  - The intro greets the signed-in customer and keeps the ledger line —
 *    orders placed, lifetime value, open orders — the first thing a trade
 *    buyer looks for on their own account.
 *  - The tiles cover everything a customer keeps with us: orders, the quote
 *    list, the wishlist, projects, the comparison and the profile.
 *  - Orders take the wide column and the profile/password panel the narrow
 *    one, so the thing people come here for is read first.
 *
 * Order numbers, account ids, dates and money stay in the account mono
 * (ga-mono): they are compared against printed documents, and a
 * proportional face makes 0/O and 1/l ambiguous.
 */

/** Orders still moving. Anything else is history or was cancelled. */
const OPEN_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED'];

// Padding a uuid to six characters does nothing — it is already 36 — so this
// shows the id's first block instead. Long enough to quote in a support
// email, short enough to read.
function accountId(id: string) {
  return `ACCT-${shortId(id)}`;
}

/** A label/value row, the same shape the product pages use for specs. */
function SpecRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={muted ? 'is-muted' : undefined}>{value}</dd>
    </div>
  );
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

  // Tile counts. The session hook already resolves the quote-list and
  // wishlist counts for signed-in and guest visitors alike; projects and the
  // comparison are browser-local workspace stores.
  const { quoteListCount, wishlistCount } = useStorefrontSession();
  const projects = useProjects();
  const compare = useCompare();

  useEffect(() => {
    if (!getCustomerToken()) {
      // A full page load, not router.replace. The in-app swap drew this empty
      // page, then slid the login form in underneath the footer — a 0.47
      // layout shift on mobile. Login as a fresh document shifts nothing.
      window.location.replace('/account/login?redirect=/account');
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

  // The sign-in check needs localStorage, so it can't run on the server.
  // Until it has, hold a full screen of space: returning nothing let the
  // footer paint at the top, only to be pushed away a moment later.
  if (!ready) return <div className="min-h-screen" aria-busy="true" />;

  // Cancelled orders are excluded from lifetime value — money that was never
  // taken shouldn't inflate a figure a buyer may quote back to us.
  const settled = (orders || []).filter((o) => o.status !== 'CANCELLED');
  const lifetime = settled.reduce((sum, o) => sum + Number(o.total), 0);
  const openCount = (orders || []).filter((o) => OPEN_STATUSES.includes(o.status)).length;
  const firstName = profile?.fullName?.trim().split(' ')[0];

  const tiles: { href: string; value: ReactNode; label: string }[] = [
    { href: '/account/orders', value: ordersLoading ? '—' : (orders || []).length, label: 'Orders' },
    { href: '#requests', value: quoteListCount, label: 'Price to confirm' },
    { href: '/saved', value: wishlistCount, label: 'Wishlist' },
    { href: '/projects', value: projects.length, label: 'Projects' },
    { href: '/compare', value: compare.length, label: 'Compare' },
    { href: '#profile', value: <UserRound aria-hidden />, label: 'Profile' },
  ];

  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Your account</span>
        <h1>Everything in one place.</h1>
        <p>Return to your orders, quote list, saved ingredients and projects.</p>
      </div>

      <section className="r-wrap r-section">
        <div className="r-account-intro">
          <div>
            <span className="r-eyebrow">
              {profile ? <span className="ga-mono">{accountId(profile.id)}</span> : 'Your formulation workspace'}
            </span>
            {profileLoading ? (
              <div className="ga-skeleton" style={{ height: 40, maxWidth: 300 }} aria-hidden />
            ) : (
              <h2>{firstName ? `Welcome back, ${firstName}.` : 'A place for your next idea.'}</h2>
            )}
            <p>
              {profile?.company?.name ? `${profile.company.name} · ` : ''}
              {profile
                ? `Member since ${new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}. `
                : ''}
              Your orders, quote list and saved ingredients stay connected to your sign-in.
            </p>

            {/* Ledger line. Standing, quantified — the first thing a trade
                buyer looks for on their own account. */}
            <dl className="ga-ledger">
              <div>
                <dt>Orders placed</dt>
                <dd className="ga-mono">{ordersLoading ? '—' : String((orders || []).length)}</dd>
              </div>
              <div>
                <dt>Lifetime value</dt>
                <dd className="ga-mono">{ordersLoading ? '—' : formatUsd(lifetime)}</dd>
              </div>
              <div>
                <dt>Open orders</dt>
                <dd className="ga-mono">{ordersLoading ? '—' : String(openCount)}</dd>
              </div>
            </dl>
          </div>
          <button type="button" onClick={handleLogout} className="r-btn r-outline">
            Sign out
          </button>
        </div>

        <nav className="r-account-tiles" aria-label="Your workspace">
          {tiles.map((tile) => (
            <Link key={tile.href} href={tile.href}>
              <strong>{tile.value}</strong>
              <span>{tile.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ga-account-grid">
          {/* ---- Orders: the reason people open this page ---- */}
          <div>
            <div className="r-section-heading">
              <h2>Your orders</h2>
              {orders && orders.length > 0 && <Link href="/account/orders">Track an order</Link>}
            </div>

            {ordersLoading && (
              <div className="ga-orders" aria-busy="true">
                {[0, 1].map((i) => (
                  <div key={i} className="ga-skeleton" style={{ height: 150 }} />
                ))}
              </div>
            )}

            {orders && orders.length === 0 && (
              <div className="r-muted-panel">
                No orders yet. Your orders will appear here with their current status.
                <p>
                  <Link href="/products" className="ga-link">
                    Browse the catalog
                  </Link>
                </p>
              </div>
            )}

            {orders && orders.length > 0 && (
              <ul className="ga-orders">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onTrack={setShippingModalOrder}
                    action={<ReorderButton order={order} />}
                  />
                ))}
              </ul>
            )}

            <div className="r-section-heading" id="requests">
              <h2>Your requests</h2>
              <Link href="/cart">
                {quoteListCount > 0 ? `${quoteListCount} waiting in your cart` : 'Your cart'}
              </Link>
            </div>
            <RequestHistory />
          </div>

          {/* ---- Profile panel ---- */}
          <aside className="ga-account-aside">
            <div className="r-form-card" id="profile">
              <div className="ga-card-head">
                <h2>Profile</h2>
                {!editing && profile && (
                  <button type="button" onClick={startEditing} className="ga-link">
                    Edit
                  </button>
                )}
              </div>

              {profileLoading && (
                <div className="ga-stack" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="ga-skeleton" style={{ height: 16 }} />
                  ))}
                </div>
              )}

              {profile && !editing && (
                <dl className="ga-specs">
                  <SpecRow label="Name" value={profile.fullName} />
                  <SpecRow label="Email" value={profile.email} muted />
                  <SpecRow label="Phone" value={profile.phone || 'Not set'} />
                  {profile.company?.name && <SpecRow label="Company" value={profile.company.name} muted />}
                </dl>
              )}

              {profile && editing && (
                <form onSubmit={handleSave} className="ga-stack">
                  <div className="r-field">
                    <label htmlFor="f-profile-name">Full name</label>
                    <input
                      id="f-profile-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="r-field">
                    <label htmlFor="f-profile-phone">Phone</label>
                    <input
                      id="f-profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </div>

                  <p className="r-fine">
                    Email can&rsquo;t be changed here — contact us to move the account to a different address.
                  </p>

                  {saveError && (
                    <p role="alert" className="r-error">
                      {saveError}
                    </p>
                  )}

                  <div className="ga-actions">
                    <button type="submit" disabled={saveMutation.isPending} className="r-btn r-primary">
                      {saveMutation.isPending ? 'Saving…' : 'Save changes'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="r-btn r-outline">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <ChangePasswordCard />
          </aside>
        </div>
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
    <div className="r-form-card">
      <div className="ga-card-head">
        <h2>Password</h2>
        {!open && (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setSuccess(false);
              setFormError(null);
            }}
            className="ga-link"
          >
            Change
          </button>
        )}
      </div>

      {!open && (
        <div className="ga-stack">
          {success ? (
            <p className="ga-success" role="status">
              Password changed.
            </p>
          ) : (
            <p className="ga-mono" aria-label="Password set">
              ••••••••
            </p>
          )}
        </div>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="ga-stack">
          <div className="r-field">
            <div className="ga-field-row">
              <label htmlFor="f-current-password">Current password</label>
              <Link href="/account/forgot-password">Forgot it?</Link>
            </div>
            <PasswordInput
              id="f-current-password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
          </div>

          <div className="r-field">
            <label htmlFor="f-new-password">New password</label>
            <PasswordInput
              id="f-new-password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
            />
          </div>

          <div className="r-field">
            <label htmlFor="f-confirm-new-password">Confirm new password</label>
            <PasswordInput
              id="f-confirm-new-password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showLabel="Show confirmation"
              hideLabel="Hide confirmation"
            />
          </div>

          {formError && (
            <p role="alert" className="r-error">
              {formError}
            </p>
          )}

          <div className="ga-actions">
            <button type="submit" disabled={mutation.isPending} className="r-btn r-primary">
              {mutation.isPending ? 'Saving…' : 'Save password'}
            </button>
            <button type="button" onClick={reset} className="r-btn r-outline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
