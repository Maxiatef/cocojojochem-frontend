'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken, setCustomerToken } from '@/lib/customerAuth';
import { useCart, clearCart } from '@/lib/cartStore';
import { formatUsd } from '@/lib/pricing';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { CouponValidateResult, Order, ServerCart } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const localCart = useCart();

  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Guest-only fields
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  // Coupon
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidateResult | null>(null);

  useEffect(() => {
    setIsAuthed(!!getCustomerToken());
    setReady(true);
  }, []);

  const { data: serverCart, isLoading } = useQuery({
    queryKey: ['customer-cart'],
    queryFn: () => customerApi.get<ServerCart>('/cart'),
    enabled: ready && isAuthed,
  });

  const items = isAuthed ? serverCart?.items || [] : localCart.items;
  const subtotal = isAuthed
    ? items.reduce((sum, i: any) => sum + Number(i.price) * i.quantity, 0)
    : localCart.subtotal;

  function buildCartItems() {
    if (isAuthed) {
      return (items as any[]).map((i) => ({
        variantId: i.variantId ?? i.variant?.id,
        quantity: i.quantity,
        price: Number(i.price),
      }));
    }
    return (items as any[]).map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
      price: i.price,
    }));
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError(null);
    try {
      const result = await customerApi.post<CouponValidateResult>('/coupons/validate', {
        code: couponInput.trim(),
        orderAmount: subtotal,
        email: isAuthed ? undefined : guestEmail || undefined,
        cartItems: buildCartItems(),
      });
      if (result.isValid) {
        setAppliedCoupon(result);
      } else {
        setAppliedCoupon(null);
        setCouponError(result.message || 'This coupon is not valid.');
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(getFriendlyErrorMessage(err));
    } finally {
      setCouponChecking(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  }

  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to place your order.');
      return;
    }

    setSubmitting(true);
    try {
      const shippingAddress = `${fullName}\n${street}\n${city}, ${state} ${zip}\n${country}`;

      const payload: Record<string, unknown> = { shippingAddress, notes };
      if (appliedCoupon?.isValid && appliedCoupon.coupon) {
        payload.couponCode = appliedCoupon.coupon.code;
      }
      if (!isAuthed) {
        payload.guestEmail = guestEmail;
        payload.guestName = fullName;
        payload.guestPhone = guestPhone || undefined;
        payload.createAccount = createAccount;
        if (createAccount) payload.password = password;
        payload.items = localCart.items.map((i) => ({
          productVariantId: i.variantId,
          quantity: i.quantity,
        }));
      }

      const order = await customerApi.post<Order>('/orders/checkout', payload);

      if (!isAuthed) {
        if (order.accessToken) setCustomerToken(order.accessToken);
        clearCart();
      }

      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || (isAuthed && isLoading)) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-ink-soft">Your cart is empty.</p>
        <a href="/products" className="mt-3 inline-block font-medium text-olive-700 hover:underline">
          Browse products →
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Checkout</p>
      <h1 className="mb-8 mt-1 font-display text-4xl text-ink">Complete Your Order</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isAuthed && (
            <div className="border border-sand-200 bg-white p-6">
              <h2 className="mb-4 font-display text-lg text-ink">Contact Information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Email</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Phone (optional)</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-sand-200 pt-4">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="h-4 w-4 rounded border-sand-300 text-olive-600 focus:ring-olive-500"
                  />
                  Create an account for faster checkout next time
                </label>
                {createAccount && (
                  <div className="mt-3">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Password</label>
                    <input
                      type="password"
                      required={createAccount}
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border border-sand-200 bg-white p-6">
            <h2 className="mb-4 font-display text-lg text-ink">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Full name</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Street address</label>
                <input
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">City</label>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">State</label>
                  <input
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">ZIP</label>
                  <input
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Country</label>
                <input
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Order notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                />
              </div>
            </div>
          </div>

          <div className="border border-dashed border-sand-300 bg-sand-50 p-6">
            <h2 className="mb-2 font-display text-lg text-ink">Payment</h2>
            <p className="text-sm text-ink-soft">
              Card payment via Stripe is coming soon. Placing this order records it for manual
              invoicing — no charge is made now.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 opacity-50 sm:grid-cols-2">
              <input disabled placeholder="Card number" className="border border-sand-300 px-3.5 py-2.5 text-sm" />
              <input disabled placeholder="MM / YY" className="border border-sand-300 px-3.5 py-2.5 text-sm" />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
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
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting || !agreedToTerms}
            className="w-full bg-olive-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-olive-700 disabled:opacity-60"
          >
            {submitting ? 'Placing order…' : `Place Order — ${formatUsd(total)}`}
          </button>
        </form>

        <div className="h-fit bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">Order Summary</h2>
          <div className="space-y-3">
            {isAuthed
              ? (items as any[]).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-ink-soft">
                      {item.variant.product?.name} × {item.quantity}
                      <span className="block text-xs text-ink-soft/70">{item.variant.label}</span>
                    </span>
                    <span className="font-medium text-ink">
                      {formatUsd(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                ))
              : (items as any[]).map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                    <span className="text-ink-soft">
                      {item.productName} × {item.quantity}
                      <span className="block text-xs text-ink-soft/70">{item.variantLabel}</span>
                    </span>
                    <span className="font-medium text-ink">
                      {formatUsd(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
          </div>
          <div className="mt-4 border-t border-sand-200 pt-4">
            {!showCoupon && !appliedCoupon && (
              <button
                type="button"
                onClick={() => setShowCoupon(true)}
                className="text-sm font-medium text-olive-700 hover:underline"
              >
                Have a coupon code?
              </button>
            )}

            {showCoupon && !appliedCoupon && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600"
                  />
                  <button
                    type="button"
                    disabled={couponChecking || !couponInput.trim()}
                    onClick={handleApplyCoupon}
                    className="border border-olive-700 px-4 py-2.5 text-sm font-medium text-olive-700 transition hover:bg-olive-50 disabled:opacity-50"
                  >
                    {couponChecking ? 'Checking…' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
              </div>
            )}

            {appliedCoupon?.isValid && appliedCoupon.coupon && (
              <div className="flex items-center justify-between rounded bg-green-50 px-3 py-2 text-sm text-green-800">
                <span>
                  Coupon <strong>{appliedCoupon.coupon.code}</strong> applied
                </span>
                <button type="button" onClick={handleRemoveCoupon} className="text-xs font-medium underline">
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between border-t border-sand-200 pt-4 text-sm text-ink">
            <span>Subtotal</span>
            <span>{formatUsd(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="mt-2 flex justify-between text-sm text-green-700">
              <span>Discount</span>
              <span>-{formatUsd(discount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-sand-200 pt-3 text-sm font-semibold text-ink">
            <span>Total</span>
            <span>{formatUsd(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
