'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken, setCustomerToken } from '@/lib/customerAuth';
import { addToCart, useCart, clearCart } from '@/lib/cartStore';
import { formatUsd } from '@/lib/pricing';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { CheckoutResponse, CouponValidateResult, Product, ServerCart, ShippingEstimate } from '@/lib/types';
import { COUNTRY_CODES } from '@/lib/countryCodes';
import { US_STATES } from '@/lib/usStates';
import { CheckoutStepper } from '@/components/commerce/CheckoutStepper';
import { ImagePlaceholderIcon } from '@/components/icons';
import { Container, Eyebrow } from '@/components/scientific/primitives';
import { CheckoutSuggestions } from '@/components/scientific/CheckoutSuggestions';

const DEFAULT_MINIMUM_DISPLAY = '$250.00';

export default function CheckoutPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const localCart = useCart();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zip, setZip] = useState('');
  const [countryIso2, setCountryIso2] = useState('US');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI-only add-ons — no backend field, no effect on the charge yet.
  const [residentialDelivery, setResidentialDelivery] = useState(false);
  const [liftgateService, setLiftgateService] = useState(false);

  // Guest-only fields
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  // Coupon
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidateResult | null>(null);

  const [cancelledNoticeVisible, setCancelledNoticeVisible] = useState(false);

  // Shipping estimate
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    setIsAuthed(!!getCustomerToken());
    setReady(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('cancelled') === '1') setCancelledNoticeVisible(true);
    }
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

  const estimateItems = useMemo(
    () =>
      (items as any[]).map((i) => ({
        productVariantId: i.variantId ?? i.variant?.id,
        quantity: i.quantity,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length, isAuthed, JSON.stringify((items as any[]).map((i) => [i.variantId ?? i.variant?.id, i.quantity]))],
  );

  // Debounced shipping estimate — fires as soon as country=US is picked
  // (zip isn't needed for the free/minimum-only case), but waits for a
  // filled-in zip on international addresses.
  //
  // Note this hits POST /orders/shipping-estimate, which prices from the
  // local zone/weight rate tables — NOT a carrier API. Shippo is only
  // involved after payment, when the label is bought.
  useEffect(() => {
    if (!ready || estimateItems.length === 0 || !countryIso2) {
      setShippingEstimate(null);
      return;
    }
    const isUs = countryIso2 === 'US';
    if (!isUs && !zip.trim()) {
      setShippingEstimate(null);
      return;
    }

    const t = setTimeout(async () => {
      setShippingLoading(true);
      try {
        const result = await customerApi.post<ShippingEstimate>('/orders/shipping-estimate', {
          country: countryIso2,
          state: stateCode || undefined,
          zip: zip || undefined,
          items: estimateItems,
        });
        setShippingEstimate(result);
      } catch {
        setShippingEstimate(null);
      } finally {
        setShippingLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [ready, countryIso2, stateCode, zip, estimateItems]);

  // The ids driving the cross-sell below. Previously this list also had to be
  // filtered client-side against the suggestions, because the old strip asked
  // for the 8 newest products and hoped none of them were already in the
  // cart. The suggestions endpoint excludes them server-side now, so these
  // ids are only an input.
  const cartVariantIds = useMemo(
    () => (items as any[]).map((i) => i.variantId ?? i.variant?.id).filter(Boolean),
    [items],
  );

  async function handleQuickAdd(product: Product) {
    const variant = product.variants.find((v) => v.stockStatus !== 'OUT_OF_STOCK') || product.variants[0];
    if (!variant) return;
    const token = getCustomerToken();
    if (token) {
      try {
        await customerApi.post('/cart/items', { productVariantId: variant.id, quantity: 1 });
        window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
      } catch {
        // silent — cross-sell add is a convenience, not critical path
      }
      return;
    }
    addToCart({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant.label,
      sku: variant.sku,
      price: Number(variant.effectivePrice ?? variant.price),
      imageUrl: variant.imageUrl || product.imageUrl,
      quantity: 1,
    });
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError(null);
    try {
      const result = await customerApi.post<CouponValidateResult>('/coupons/validate', {
        code: couponInput.trim(),
        orderAmount: subtotal,
        email: isAuthed ? undefined : email || undefined,
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
  const shippingCost =
    shippingEstimate?.available && shippingEstimate.canShip ? shippingEstimate.shippingCost ?? 0 : 0;
  // Preview only — the server recomputes this from the real subtotal at
  // checkout and never trusts a client-sent value (unlike shippingCost).
  const taxAmount =
    shippingEstimate?.available && shippingEstimate.canShip ? shippingEstimate.taxAmount ?? 0 : 0;
  const taxLabel = shippingEstimate?.taxName || 'Tax';
  // Only true once an estimate has actually come back saying so — a null
  // estimate means "not calculated yet", not "under the minimum".
  const belowMinimum = shippingEstimate != null && !shippingEstimate.meetsMinimum;
  const total = Math.max(0, subtotal - discount + shippingCost + taxAmount);

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
      const fullName = `${firstName} ${lastName}`.trim();
      const country = COUNTRY_CODES.find((c) => c.iso2.toUpperCase() === countryIso2)?.name || countryIso2;
      const addressLines = [
        fullName,
        companyName || null,
        street,
        countryIso2 === 'US' ? `${city}, ${stateCode} ${zip}` : `${city}${zip ? ' ' + zip : ''}`,
        country,
      ].filter(Boolean);
      const shippingAddress = addressLines.join('\n');

      const payload: Record<string, unknown> = {
        shippingAddress,
        notes,
        shippingCost,
      };
      if (appliedCoupon?.isValid && appliedCoupon.coupon) {
        payload.couponCode = appliedCoupon.coupon.code;
      }
      if (!isAuthed) {
        payload.guestEmail = email;
        payload.guestName = fullName;
        payload.guestPhone = phone || undefined;
        payload.createAccount = createAccount;
        if (createAccount) payload.password = password;
        payload.items = localCart.items.map((i) => ({
          productVariantId: i.variantId,
          quantity: i.quantity,
        }));
      }

      const { checkoutUrl, accessToken } = await customerApi.post<CheckoutResponse>('/orders/checkout', payload);

      if (!isAuthed) {
        if (accessToken) setCustomerToken(accessToken);
        clearCart();
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      // No order id to reference yet — the order isn't created until Stripe
      // confirms payment via webhook. Only reachable if checkoutUrl is ever
      // null (Stripe session creation failed), which the success page
      // already handles gracefully with generic copy.
      router.push('/checkout/success');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || (isAuthed && isLoading)) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-sci-muted">Your cart is empty.</p>
        <a href="/products" className="mt-3 inline-block font-medium text-sci-blue hover:underline">
          Browse products →
        </a>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-md border border-sci-border bg-white px-4 py-3 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue';
  const labelClass =
    'mb-2 block font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy';

  return (
    <>
      <section className="bg-sci-pale py-12">
        <Container className="flex flex-col gap-4">
          <Eyebrow>Checkout</Eyebrow>
          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[56px] md:leading-[64px]">
            Complete your order
          </h1>
        </Container>
      </section>

      <Container className="py-12">
      <div className="mb-10">
        <CheckoutStepper current={1} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-sci-border bg-white p-6 md:p-8">
            <h2 className="mb-5 font-sci-heading text-[20px] font-semibold text-sci-navy">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="f-email" className={labelClass}>Email</label>
                <input
            id="f-email"
                  type="email"
                  required
                  disabled={isAuthed}
                  value={isAuthed ? '' : email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAuthed ? 'Using your account email' : undefined}
                  className={`${inputClass} disabled:bg-sci-pale disabled:text-sci-muted`}
                />
              </div>
            </div>

            {!isAuthed && (
              <div className="mt-4 border-t border-sci-border pt-4">
                <label className="flex items-center gap-2 text-sm text-sci-navy">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="h-4 w-4 rounded border-sci-border text-sci-blue focus:ring-sci-blue"
                  />
                  Create an account for faster checkout next time
                </label>
                {createAccount && (
                  <div className="mt-3">
                    <label htmlFor="f-password" className={labelClass}>Password</label>
                    <input
            id="f-password"
                      type="password"
                      required={createAccount}
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-sci-border bg-white p-6 md:p-8">
            <h2 className="mb-5 font-sci-heading text-[20px] font-semibold text-sci-navy">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-first-name" className={labelClass}>First name</label>
                <input
            id="f-first-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="f-last-name" className={labelClass}>Last name</label>
                <input
            id="f-last-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-company-name-optional" className={labelClass}>Company name (optional)</label>
                <input
            id="f-company-name-optional" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
              </div>
              {/* International shipping disabled for now — US only. Country is
                  fixed to 'US' (see countryIso2 initial state above) instead of
                  offering a picker here. Re-enable by uncommenting this block
                  and the InternationalShippingNotice usage below. */}
              {/* <div className="sm:col-span-2">
                <label htmlFor="f-country" className={labelClass}>Country</label>
                <select
            id="f-country"
                  required
                  value={countryIso2}
                  onChange={(e) => {
                    setCountryIso2(e.target.value);
                    setStateCode('');
                  }}
                  className={inputClass}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.iso2} value={c.iso2.toUpperCase()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div> */}
              <div className="sm:col-span-2">
                <label htmlFor="f-state" className={labelClass}>State</label>
                <select
            id="f-state"
                  required
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-street-address" className={labelClass}>Street address</label>
                <input
            id="f-street-address" required value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="f-city" className={labelClass}>City</label>
                <input
            id="f-city" required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="f-zip-postal-code" className={labelClass}>ZIP / Postal code</label>
                <input
            id="f-zip-postal-code" required value={zip} onChange={(e) => setZip(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-phone" className={labelClass}>Phone</label>
                <input
            id="f-phone" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-order-notes-optional" className={labelClass}>Order notes (optional)</label>
                <textarea
            id="f-order-notes-optional"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-sci-border pt-4">
              <label className="flex items-center gap-2 text-sm text-sci-navy">
                <input
                  type="checkbox"
                  checked={residentialDelivery}
                  onChange={(e) => setResidentialDelivery(e.target.checked)}
                  className="h-4 w-4 rounded border-sci-border text-sci-blue focus:ring-sci-blue"
                />
                Residential delivery
              </label>
              <label className="flex items-center gap-2 text-sm text-sci-navy">
                <input
                  type="checkbox"
                  checked={liftgateService}
                  onChange={(e) => setLiftgateService(e.target.checked)}
                  className="h-4 w-4 rounded border-sci-border text-sci-blue focus:ring-sci-blue"
                />
                Liftgate service
              </label>
              <p className="text-xs text-sci-muted">
                These add-ons don&apos;t affect your total yet — a member of our team will follow up if either is needed for your shipment.
              </p>
            </div>

            {/* International shipping disabled for now — US only, see the
                commented-out Country field above. */}
            {/* {countryIso2 !== 'US' && (
              <div className="mt-4 border-t border-sci-border pt-4">
                <InternationalShippingNotice />
              </div>
            )} */}
          </div>

          <div className="rounded-xl border border-sci-border bg-white p-6 md:p-8">
            <h2 className="mb-2 font-sci-heading text-[20px] font-semibold text-sci-navy">Payment</h2>
            <p className="text-sm text-sci-muted">
              You&apos;ll be securely redirected to Stripe to enter your payment details.
            </p>
          </div>

          {cancelledNoticeVisible && (
            <div className="flex items-start justify-between gap-3 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
              <span>
                Payment was cancelled — your order is saved and you can complete payment later.
              </span>
              <button
                type="button"
                onClick={() => setCancelledNoticeVisible(false)}
                className="shrink-0 font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Last section of the form, directly above the terms and the
              Continue button. The old strip sat beside the totals at
              48px-thumbnail size, which is the size you use for something you
              do not really want clicked. Here it is the final thing read
              before committing — still in the customer's own column and their
              own reading order, and it cannot push the Continue button around
              because it sits above it rather than between its fields. */}
          <CheckoutSuggestions
            cartVariantIds={cartVariantIds}
            enabled={ready}
            onAdd={handleQuickAdd}
          />

          <label className="flex items-start gap-2 text-sm text-sci-muted">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-sci-border text-sci-blue focus:ring-sci-blue"
            />
            <span>
              I agree to the{' '}
              <Link href="/legal/terms-of-service" target="_blank" className="font-medium text-sci-blue hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy-policy" target="_blank" className="font-medium text-sci-blue hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          {/* The minimum is enforced on the server too — this only stops the
              customer being sent to Stripe for an order that will be refused.
              Gated on a loaded estimate: before one arrives meetsMinimum is
              simply unknown, and blocking on unknown would strand a valid
              cart.

              Disabled styling is a solid pair of colours, not disabled:opacity
              — fading the accent washed it out until the white label was
              unreadable against it. */}
          <button
            type="submit"
            disabled={submitting || !agreedToTerms || belowMinimum}
            className="w-full bg-sci-accent px-4 py-3 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:brightness-100"
          >
            {submitting
              ? 'Redirecting to payment…'
              : belowMinimum
                ? `Add ${formatUsd(shippingEstimate!.minimumRemaining)} to reach the minimum`
                : `Continue to Payment — ${formatUsd(total)}`}
          </button>
        </form>

        <div className="space-y-6">
          <div className="h-fit bg-white p-6">
            <h2 className="mb-5 font-sci-heading text-[20px] font-semibold text-sci-navy">Order Summary</h2>
            <div className="space-y-3">
              {isAuthed
                ? (items as any[]).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-sci-pale">
                        {item.variant?.imageUrl || item.variant?.product?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.variant.imageUrl || item.variant.product?.imageUrl}
                            alt={item.variant.product?.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImagePlaceholderIcon className="h-5 w-5 text-sci-border" />
                        )}
                      </div>
                      <span className="flex-1 text-sci-muted">
                        {item.variant.product?.name} × {item.quantity}
                        <span className="block text-xs text-sci-muted">{item.variant.label}</span>
                      </span>
                      <span className="font-medium text-sci-navy">
                        {formatUsd(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))
                : (items as any[]).map((item) => (
                    <div key={item.variantId} className="flex items-center gap-3 text-sm">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-sci-pale">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlaceholderIcon className="h-5 w-5 text-sci-border" />
                        )}
                      </div>
                      <span className="flex-1 text-sci-muted">
                        {item.productName} × {item.quantity}
                        <span className="block text-xs text-sci-muted">{item.variantLabel}</span>
                      </span>
                      <span className="font-medium text-sci-navy">
                        {formatUsd(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
            </div>

            <div className="mt-4 border-t border-sci-border pt-4">
              <ShippingSummaryPanel
                countryIso2={countryIso2}
                estimate={shippingEstimate}
                loading={shippingLoading}
              />
            </div>

            <div className="mt-4 border-t border-sci-border pt-4">
              {!showCoupon && !appliedCoupon && (
                <button
                  type="button"
                  onClick={() => setShowCoupon(true)}
                  className="text-sm font-medium text-sci-blue hover:underline"
                >
                  Have a coupon code?
                </button>
              )}

              {showCoupon && !appliedCoupon && (
                <div>
                  <label htmlFor="f-coupon-code" className={labelClass}>Coupon code</label>
                  <div className="flex gap-2">
                    <input
            id="f-coupon-code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 border border-sci-border px-3.5 py-2.5 text-sm text-sci-navy outline-none focus:border-sci-blue"
                    />
                    <button
                      type="button"
                      disabled={couponChecking || !couponInput.trim()}
                      onClick={handleApplyCoupon}
                      className="border border-sci-blue px-4 py-2.5 text-sm font-medium text-sci-blue transition hover:bg-sci-pale disabled:opacity-50"
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

            <div className="mt-4 flex justify-between border-t border-sci-border pt-4 text-sm text-sci-navy">
              <span>Subtotal</span>
              <span>{formatUsd(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="mt-2 flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span>-{formatUsd(discount)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between text-sm text-sci-muted">
              <span>Shipping</span>
              <span>{formatUsd(shippingCost)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-sci-muted">
              <span>{taxLabel}</span>
              <span>{formatUsd(taxAmount)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-sci-border pt-3 text-sm font-semibold text-sci-navy">
              <span>Total</span>
              <span>{formatUsd(total)}</span>
            </div>
          </div>

        </div>
      </div>
      </Container>
    </>
  );
}

function ShippingSummaryPanel({
  countryIso2,
  estimate,
  loading,
}: {
  countryIso2: string;
  estimate: ShippingEstimate | null;
  loading: boolean;
}) {
  const isUs = countryIso2 === 'US';
  const minimumDisplay = estimate ? formatUsd(estimate.wholesaleMinimum) : DEFAULT_MINIMUM_DISPLAY;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sci-muted">Shipping Notice</p>

      {loading && <p className="text-sm text-sci-muted">Calculating…</p>}

      {!loading && !estimate && (
        <p className="text-sm text-sci-muted">
          {isUs
            ? 'Enter your address to calculate shipping.'
            : 'International shipping will be calculated after your address is confirmed.'}
        </p>
      )}

      {!loading && estimate && !estimate.meetsMinimum && (
        <div className="rounded bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <p>
            Wholesale minimum purchase is {minimumDisplay}. Current wholesale subtotal is {formatUsd(estimate.subtotal)}.
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700">Wholesale Minimum</p>
          <p className="mt-0.5">
            Add {formatUsd(estimate.minimumRemaining)} more to reach the {minimumDisplay} wholesale minimum before shipping and tax.
          </p>
        </div>
      )}

      {!loading && estimate && estimate.meetsMinimum && !estimate.canShip && (
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {estimate.errorMessage || 'We are unable to ship to this destination automatically — please contact us for a manual quote.'}
        </p>
      )}

      {!loading && estimate && estimate.meetsMinimum && estimate.canShip && (
        <>
          <div className="flex justify-between text-sm text-sci-navy">
            <span>{estimate.regionLabel || estimate.zoneName || estimate.shippingMethod || 'Shipping'}</span>
            <span>
              {estimate.carrierNotice ? (
                <Link href="/contact" className="font-medium text-sci-blue underline hover:text-sci-navy">
                  Contact us
                </Link>
              ) : (
                formatUsd(estimate.shippingCost ?? 0)
              )}
            </span>
          </div>
          {estimate.isFreeShipping && (
            <p className="mt-1 text-xs text-green-700">You&apos;ve unlocked free shipping.</p>
          )}
          {!estimate.isFreeShipping &&
            estimate.freeShippingThreshold != null &&
            estimate.amountAwayFromFreeShipping != null &&
            estimate.amountAwayFromFreeShipping > 0 && (
              <p className="mt-1 text-xs text-sci-muted">
                Add {formatUsd(estimate.amountAwayFromFreeShipping)} more for free shipping.
              </p>
            )}
          {estimate.weightLb != null && (
            <p className="mt-1 text-xs text-sci-muted">Combined shipment weight: {estimate.weightLb} lb</p>
          )}
          {estimate.carrierNotice && (
            <div className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <p>{estimate.carrierNotice}</p>
              <Link href="/contact" className="mt-1 inline-block font-semibold underline hover:text-amber-900">
                Contact Us →
              </Link>
            </div>
          )}
          {!isUs && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-sci-muted">International Shipping Estimate</p>
              <p className="mt-0.5 text-xs text-sci-muted">
                Estimated UPS international shipping. Duties, taxes, fuel, dimensional-weight, remote-area, residential, and peak surcharges are not included.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Original wording conveying the same policy the real site discloses for
// international orders — not copied verbatim (see Terms of Service page for
// the same "not a copy of the real site's legal text" rationale). Shown once
// a non-US country is selected, regardless of whether the shipping estimate
// has resolved yet, since it's a standing risk disclosure, not a quote.
function InternationalShippingNotice() {
  return (
    <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800">
        International Shipping Notice
      </p>
      <p className="text-xs leading-relaxed">
        Some international destinations have strict customs rules and address requirements, which can lead to delays,
        refusals, or packages being sent back to us by local authorities. If that happens because of an incomplete or
        incorrect address, or because of the destination country&apos;s import restrictions, you&apos;ll be responsible for
        the return shipping cost, a 35% restocking fee, and the original (non-refundable) shipping charge.
      </p>
      <p className="mt-2 text-xs leading-relaxed">
        Any import duties, taxes, or customs fees charged by the destination country are your responsibility. If those
        fees are refused, customs may return or destroy the package, and we won&apos;t be able to issue a refund in
        that case. By placing an order, you&apos;re accepting these risks — see our{' '}
        <Link href="/legal/terms-of-service" target="_blank" className="font-medium underline">
          Terms of Service
        </Link>{' '}
        for the full policy.
      </p>
    </div>
  );
}
