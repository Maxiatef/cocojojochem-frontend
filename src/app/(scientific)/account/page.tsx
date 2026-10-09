'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { clearCustomerToken, getCustomerToken } from '@/lib/customerAuth';
import { CustomerProfile, Order, QuoteRequest } from '@/lib/types';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { OrderShippingModal } from '@/components/commerce/OrderShippingModal';
import { shortId } from '@/lib/ids';
import { useStorefrontSession } from '@/lib/useStorefrontSession';
import { useCompare, useProjects, useSavedReferences } from '@/lib/gloss/stores';
import { useCartTotalCount } from '@/components/gloss/CartLines';
import { PasswordInput } from '@/components/gloss/account/PasswordInput';
import { AccountOrders, AccountRequests } from '@/components/ocean/workspace/AccountLists';

/**
 * The customer account in the reference's AccountWorkspace layout
 * (store-client.tsx): intro panel, count tiles, "Your requests", fine print.
 *
 * Ours is a real trade account, so the same frame also carries the
 * customer's orders and profile/password after the reference's requests.
 * Auth is unchanged: no token, straight to /account/login.
 */

// Padding a uuid to six characters does nothing (it is already 36), so this
// shows the id's first block instead.
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

  // Tile counts: the session hook resolves the wishlist count for signed-in
  // and guest visitors alike; saved references, projects and the comparison
  // are workspace stores; the cart count covers priced and to-confirm lines.
  const { wishlistCount } = useStorefrontSession();
  const savedReferences = useSavedReferences();
  const projects = useProjects();
  const compare = useCompare();
  const { count: cartCount } = useCartTotalCount();

  useEffect(() => {
    if (!getCustomerToken()) {
      // A full page load, not router.replace: login as a fresh document
      // shifts nothing.
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

  // Same key as <AccountRequests>, so this is one request.
  const { data: requests } = useQuery({
    queryKey: ['customer-quote-requests'],
    queryFn: () => customerApi.get<QuoteRequest[]>('/wholesale/quote-requests/mine'),
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

  const firstName = profile?.fullName?.trim().split(' ')[0];

  const tiles: [string, number | string, string][] = [
    ['/saved', wishlistCount + savedReferences.length, 'Wishlist'],
    ['/projects', projects.length, 'Projects'],
    ['/cart', cartCount, 'Cart selections'],
    ['/account/orders', ordersLoading || !orders ? '—' : orders.length, 'Orders'],
    ['#requests', requests ? requests.length : '—', 'Requests'],
    ['/compare', compare.length, 'Compare'],
  ];

  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Your account</span>
        <h1>Everything in one place.</h1>
        <p>Return to your ingredients, projects and requests.</p>
      </div>
      <section className="r-wrap r-section">
        {/* The sign-in check needs localStorage, so it can't run on the
            server. Until it has, hold the space instead of painting a
            workspace that is about to redirect. */}
        {!ready ? (
          <div className="r-account-pending" aria-busy="true" />
        ) : (
          <>
            <div className="r-account-intro">
              <div>
                <span className="r-eyebrow">Your formulation workspace</span>
                <h2>{firstName ? 'Welcome back, ' + firstName + '.' : 'A place for your next idea.'}</h2>
                <p>Your saved ingredients, projects and requests stay connected to your sign-in.</p>
              </div>
              <button type="button" onClick={handleLogout} className="r-btn r-outline">
                Sign out
              </button>
            </div>
            <div className="r-account-tiles">
              {tiles.map(([url, n, label]) => (
                <a href={url} key={url}>
                  <strong>{n}</strong>
                  <span>{label}</span>
                </a>
              ))}
            </div>

            <div className="r-section-heading" id="requests">
              <h2>Your requests</h2>
              <a href="/contact">Start a new request</a>
            </div>
            <AccountRequests />

            <div className="r-section-heading" id="orders">
              <h2>Your orders</h2>
              <a href="/account/orders">Track an order</a>
            </div>
            <AccountOrders orders={orders} loading={ordersLoading} onTrack={setShippingModalOrder} />

            <div className="r-section-heading" id="profile">
              <h2>Your details</h2>
              {profile && <span className="r-account-id">{accountId(profile.id)}</span>}
            </div>
            <div className="r-account-details">
              <div className="r-form-card">
                <div className="ga-card-head">
                  <h2>Profile</h2>
                  {!editing && profile && (
                    <button type="button" onClick={startEditing} className="ga-link">
                      Edit
                    </button>
                  )}
                </div>

                {profileLoading && <p className="r-fine">Loading your profile…</p>}

                {profile && !editing && (
                  <dl className="ga-specs">
                    <SpecRow label="Name" value={profile.fullName} />
                    <SpecRow label="Email" value={profile.email} muted />
                    <SpecRow label="Phone" value={profile.phone || 'Not set'} />
                    {profile.company?.name && <SpecRow label="Company" value={profile.company.name} muted />}
                    <SpecRow
                      label="Member since"
                      value={new Date(profile.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                      muted
                    />
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
                      Email can&rsquo;t be changed here. Contact us to move the account to a different address.
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
            </div>

            <p className="r-fine">
              For purchases previously placed on cocojojo.com,{' '}
              <a href="https://cocojojo.com/login">open your existing customer account</a>.
            </p>
          </>
        )}
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
