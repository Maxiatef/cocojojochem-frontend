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
import { LoaderCircle, LockKeyhole, Package } from 'lucide-react';
import { CheckoutSuggestions } from '@/components/scientific/CheckoutSuggestions';
import { EmptyState } from '@/components/gloss/EmptyState';
import { PasswordInput } from '@/components/gloss/account/PasswordInput';
import { categoryImage, productImage } from '@/lib/gloss/images';

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

  const intro = (
    <div className="r-page-intro r-wrap">
      <span className="r-eyebrow">Checkout</span>
      <h1>Complete your order.</h1>
      <p>Confirm your details and delivery address, then pay securely with Stripe.</p>
    </div>
  );

  if (!ready || (isAuthed && isLoading)) {
    return (
      <>
        {intro}
        <section className="r-wrap r-section" aria-busy="true">
          <p className="r-loading">Loading your checkout…</p>
        </section>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        {intro}
        <section className="r-wrap r-section">
          <EmptyState
            icon="cart"
            title="Your cart is empty."
            text="Add an ingredient before continuing to checkout."
            href="/products"
            label="Shop ingredients"
          />
        </section>
      </>
    );
  }

  return (
    <>
      {intro}

      <section className="r-wrap r-section">
        <div className="r-checkout-layout">
          <form onSubmit={handleSubmit} className="ga-checkout-form">
            <div className="r-form-card">
              <div className="r-step-label" aria-label="Checkout progress: step 1 of 2">
                <span>1</span> Your details <span>2</span> Secure payment
              </div>
              <h2>Contact information</h2>
              <div className="r-form-grid">
                <div className="r-field r-full">
                  <label htmlFor="f-email">Email address</label>
                  <input
                    id="f-email"
                    type="email"
                    required
                    autoComplete="email"
                    disabled={isAuthed}
                    value={isAuthed ? '' : email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAuthed ? 'Using your account email' : undefined}
                  />
                </div>
              </div>

              {!isAuthed && (
                <div className="ga-checks">
                  <label className="ga-check">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                    />
                    Create an account for faster checkout next time
                  </label>
                  {createAccount && (
                    <div className="r-field">
                      <label htmlFor="f-password">Password</label>
                      <PasswordInput
                        id="f-password"
                        required={createAccount}
                        minLength={8}
                        autoComplete="new-password"
                        value={password}
                        onChange={setPassword}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="r-form-card">
              <h2>Shipping address</h2>
              <div className="r-form-grid">
                <div className="r-field">
                  <label htmlFor="f-first-name">First name</label>
                  <input
                    id="f-first-name"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="r-field">
                  <label htmlFor="f-last-name">Last name</label>
                  <input
                    id="f-last-name"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="r-field r-full">
                  <label htmlFor="f-company-name-optional">
                    Company <small>optional</small>
                  </label>
                  <input
                    id="f-company-name-optional"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                {/* International shipping disabled for now — US only. Country is
                    fixed to 'US' (see countryIso2 initial state above) instead of
                    offering a picker here. Re-enable by uncommenting this block
                    and the InternationalShippingNotice usage below. */}
                {/* <div className="r-field r-full">
                  <label htmlFor="f-country">Country</label>
                  <select
                    id="f-country"
                    required
                    value={countryIso2}
                    onChange={(e) => {
                      setCountryIso2(e.target.value);
                      setStateCode('');
                    }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.iso2} value={c.iso2.toUpperCase()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div className="r-field r-full">
                  <label htmlFor="f-state">State</label>
                  <select
                    id="f-state"
                    required
                    autoComplete="address-level1"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="r-field r-full">
                  <label htmlFor="f-street-address">Street address</label>
                  <input
                    id="f-street-address"
                    required
                    autoComplete="street-address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
                <div className="r-field">
                  <label htmlFor="f-city">City</label>
                  <input
                    id="f-city"
                    required
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="r-field">
                  <label htmlFor="f-zip-postal-code">ZIP / Postal code</label>
                  <input
                    id="f-zip-postal-code"
                    required
                    autoComplete="postal-code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </div>
                <div className="r-field r-full">
                  <label htmlFor="f-phone">Phone</label>
                  <input
                    id="f-phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="r-field r-full">
                  <label htmlFor="f-order-notes-optional">
                    Order notes <small>optional</small>
                  </label>
                  <textarea
                    id="f-order-notes-optional"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Delivery hours, dock access or anything we should know."
                  />
                </div>
              </div>

              <div className="ga-checks">
                <label className="ga-check">
                  <input
                    type="checkbox"
                    checked={residentialDelivery}
                    onChange={(e) => setResidentialDelivery(e.target.checked)}
                  />
                  Residential delivery
                </label>
                <label className="ga-check">
                  <input
                    type="checkbox"
                    checked={liftgateService}
                    onChange={(e) => setLiftgateService(e.target.checked)}
                  />
                  Liftgate service
                </label>
                <p className="r-fine">
                  These add-ons don&apos;t affect your total yet — a member of our team will follow up if either is
                  needed for your shipment.
                </p>
              </div>

              {/* International shipping disabled for now — US only, see the
                  commented-out Country field above. */}
              {/* {countryIso2 !== 'US' && (
                <div className="ga-checks">
                  <InternationalShippingNotice />
                </div>
              )} */}
            </div>

            <div className="r-form-card">
              <h2>Payment</h2>
              <div className="ga-pay-note">
                <LockKeyhole size={22} aria-hidden />
                <p>You&apos;ll be securely redirected to Stripe to enter your payment details.</p>
              </div>
            </div>

            {cancelledNoticeVisible && (
              <div className="ga-notice ga-dismissable" role="status">
                <span>Payment was cancelled — your order is saved and you can complete payment later.</span>
                <button type="button" onClick={() => setCancelledNoticeVisible(false)}>
                  Dismiss
                </button>
              </div>
            )}

            {/* Last section of the form, directly above the terms and the
                Continue button: the final thing read before committing, in the
                customer's own column and reading order, and it cannot push the
                Continue button around because it sits above it. */}
            <CheckoutSuggestions cartVariantIds={cartVariantIds} enabled={ready} onAdd={handleQuickAdd} />

            <label className="r-consent">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              I agree to the{' '}
              <Link href="/legal/terms-of-service" target="_blank">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy-policy" target="_blank">
                Privacy Policy
              </Link>
              .
            </label>

            {error && (
              <p className="r-error" role="alert">
                {error}
              </p>
            )}

            {/* The minimum is enforced on the server too — this only stops the
                customer being sent to Stripe for an order that will be refused.
                Gated on a loaded estimate: before one arrives meetsMinimum is
                simply unknown, and blocking on unknown would strand a valid
                cart.

                Disabled styling is a solid pair of colours (gloss-account.css),
                not an opacity fade, so the label stays readable. */}
            <button type="submit" disabled={submitting || !agreedToTerms || belowMinimum} className="r-btn r-primary">
              {submitting ? (
                <>
                  <LoaderCircle className="r-spin" size={17} aria-hidden />
                  Redirecting to payment…
                </>
              ) : belowMinimum ? (
                `Add ${formatUsd(shippingEstimate!.minimumRemaining)} to reach the minimum`
              ) : (
                `Continue to payment — ${formatUsd(total)}`
              )}
            </button>
          </form>

          <aside className="r-summary">
            <h2>Order summary</h2>
            <ul className="ga-summary-lines">
              {isAuthed
                ? (items as any[]).map((item) => (
                    <li key={item.id}>
                      <div className="ga-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            item.variant?.imageUrl ||
                            productImage({
                              imageUrl: item.variant?.product?.imageUrl,
                              category: item.variant?.product?.category,
                            })
                          }
                          alt={item.variant?.product?.name || ''}
                        />
                      </div>
                      <div className="ga-line-text">
                        <p>
                          {item.variant?.product?.name} × {item.quantity}
                        </p>
                        <small>{item.variant?.label}</small>
                      </div>
                      <span className="ga-line-price">{formatUsd(Number(item.price) * item.quantity)}</span>
                    </li>
                  ))
                : (items as any[]).map((item) => (
                    <li key={item.variantId}>
                      <div className="ga-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl || categoryImage(item.productName)} alt={item.productName} />
                      </div>
                      <div className="ga-line-text">
                        <p>
                          {item.productName} × {item.quantity}
                        </p>
                        <small>{item.variantLabel}</small>
                      </div>
                      <span className="ga-line-price">{formatUsd(item.price * item.quantity)}</span>
                    </li>
                  ))}
            </ul>

            <div className="ga-summary-block">
              <ShippingSummaryPanel countryIso2={countryIso2} estimate={shippingEstimate} loading={shippingLoading} />
            </div>

            <div className="ga-summary-block">
              {!showCoupon && !appliedCoupon && (
                <button type="button" onClick={() => setShowCoupon(true)} className="ga-link">
                  Have a coupon code?
                </button>
              )}

              {showCoupon && !appliedCoupon && (
                <div>
                  <label htmlFor="f-coupon-code" className="ga-label">
                    Coupon code
                  </label>
                  <div className="ga-coupon">
                    <input
                      id="f-coupon-code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter code"
                    />
                    <button
                      type="button"
                      disabled={couponChecking || !couponInput.trim()}
                      onClick={handleApplyCoupon}
                      className="r-btn r-outline"
                    >
                      {couponChecking ? 'Checking…' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="r-error" role="alert">
                      {couponError}
                    </p>
                  )}
                </div>
              )}

              {appliedCoupon?.isValid && appliedCoupon.coupon && (
                <div className="ga-coupon-applied">
                  <span>
                    Coupon <strong>{appliedCoupon.coupon.code}</strong> applied
                  </span>
                  <button type="button" onClick={handleRemoveCoupon}>
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="r-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatUsd(subtotal)}</strong>
              </div>
              {discount > 0 && (
                <div className="ga-discount">
                  <span>Discount</span>
                  <span>-{formatUsd(discount)}</span>
                </div>
              )}
              <div>
                <span>Shipping</span>
                <span>{formatUsd(shippingCost)}</span>
              </div>
              <div>
                <span>{taxLabel}</span>
                <span>{formatUsd(taxAmount)}</span>
              </div>
              <div className="ga-grand">
                <span>Total</span>
                <strong>{formatUsd(total)}</strong>
              </div>
            </div>

            <div className="r-summary-help">
              <Package size={22} aria-hidden />
              <p>Payment is taken securely by Stripe. Shipping and tax are worked out from your delivery address.</p>
            </div>
            <Link href="/shipping-returns">Shipping &amp; return information</Link>
          </aside>
        </div>
      </section>
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
    <div aria-live="polite">
      <span className="ga-label">Shipping notice</span>

      {loading && <p>Calculating…</p>}

      {!loading && !estimate && (
        <p>
          {isUs
            ? 'Enter your address to calculate shipping.'
            : 'International shipping will be calculated after your address is confirmed.'}
        </p>
      )}

      {!loading && estimate && !estimate.meetsMinimum && (
        <div className="ga-notice">
          <p>
            Wholesale minimum purchase is {minimumDisplay}. Current wholesale subtotal is {formatUsd(estimate.subtotal)}.
          </p>
          <strong>Wholesale minimum</strong>
          <p>
            Add {formatUsd(estimate.minimumRemaining)} more to reach the {minimumDisplay} wholesale minimum before
            shipping and tax.
          </p>
        </div>
      )}

      {!loading && estimate && estimate.meetsMinimum && !estimate.canShip && (
        <p className="ga-notice">
          {estimate.errorMessage ||
            'We are unable to ship to this destination automatically — please contact us for a manual quote.'}
        </p>
      )}

      {!loading && estimate && estimate.meetsMinimum && estimate.canShip && (
        <>
          <div className="ga-row">
            <span>{estimate.regionLabel || estimate.zoneName || estimate.shippingMethod || 'Shipping'}</span>
            <span>
              {estimate.carrierNotice ? (
                <Link href="/contact" className="ga-link">
                  Contact us
                </Link>
              ) : (
                formatUsd(estimate.shippingCost ?? 0)
              )}
            </span>
          </div>
          {estimate.isFreeShipping && <small className="is-ok">You&apos;ve unlocked free shipping.</small>}
          {!estimate.isFreeShipping &&
            estimate.freeShippingThreshold != null &&
            estimate.amountAwayFromFreeShipping != null &&
            estimate.amountAwayFromFreeShipping > 0 && (
              <small>Add {formatUsd(estimate.amountAwayFromFreeShipping)} more for free shipping.</small>
            )}
          {estimate.weightLb != null && <small>Combined shipment weight: {estimate.weightLb} lb</small>}
          {estimate.carrierNotice && (
            <div className="ga-notice">
              <p>{estimate.carrierNotice}</p>
              <Link href="/contact">Contact us →</Link>
            </div>
          )}
          {!isUs && (
            <>
              <span className="ga-label ga-label-gap">
                International shipping estimate
              </span>
              <small>
                Estimated UPS international shipping. Duties, taxes, fuel, dimensional-weight, remote-area,
                residential, and peak surcharges are not included.
              </small>
            </>
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
    <div className="ga-notice">
      <strong>International shipping notice</strong>
      <p>
        Some international destinations have strict customs rules and address requirements, which can lead to delays,
        refusals, or packages being sent back to us by local authorities. If that happens because of an incomplete or
        incorrect address, or because of the destination country&apos;s import restrictions, you&apos;ll be responsible for
        the return shipping cost, a 35% restocking fee, and the original (non-refundable) shipping charge.
      </p>
      <p>
        Any import duties, taxes, or customs fees charged by the destination country are your responsibility. If those
        fees are refused, customs may return or destroy the package, and we won&apos;t be able to issue a refund in
        that case. By placing an order, you&apos;re accepting these risks — see our{' '}
        <Link href="/legal/terms-of-service" target="_blank">
          Terms of Service
        </Link>{' '}
        for the full policy.
      </p>
    </div>
  );
}
