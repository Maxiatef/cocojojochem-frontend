'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { decodeCustomerToken, getCustomerToken, setCustomerToken } from '@/lib/customerAuth';
import { addToCart, useCart, clearCart } from '@/lib/cartStore';
import { formatUsd } from '@/lib/pricing';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { CheckoutResponse, CouponValidateResult, Product, ProductVariant, ServerCart, ShippingEstimate } from '@/lib/types';
import { COUNTRY_CODES } from '@/lib/countryCodes';
import { US_STATES } from '@/lib/usStates';
import { LoaderCircle, LockKeyhole, Package } from 'lucide-react';
import { CheckoutSuggestions } from '@/components/scientific/CheckoutSuggestions';
import { EmptyState } from '@/components/gloss/EmptyState';
import { PasswordInput } from '@/components/gloss/account/PasswordInput';
import { categoryImage, productImage } from '@/lib/gloss/images';
import { requestItemsPayload, useRequestList } from '@/lib/gloss/useUnifiedCart';
import { useAcceptedQuotes } from '@/lib/gloss/acceptedQuotes';
import { OrderRequestForm, RequestSummaryList } from '@/components/gloss/workspace/OrderRequestForm';
import { requestReference } from '@/lib/types';

/** Read by /checkout/success to show the pricing request sent with a payment. */
const PENDING_REQUEST_REF_KEY = 'cocojojochem_pending_request_ref';

const DEFAULT_MINIMUM_DISPLAY = '$250.00';

export default function CheckoutPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const localCart = useCart();
  // The cart's "Price to confirm" group. With priced items too, checkout
  // sends it as an order request and then takes payment for the rest; on
  // its own it becomes a request-only checkout (OrderRequestForm).
  const requests = useRequestList();
  // Accepted quotes: priced lines charged at the quoted price (the server
  // reads the prices from the quote; we only send the tokens).
  const quoted = useAcceptedQuotes();
  const [accountEmail, setAccountEmail] = useState('');
  // The request already sent in this visit, so a failed payment start that is
  // retried doesn't send a second copy.
  const [sentRequest, setSentRequest] = useState<{ id: string; ref: string } | null>(null);
  const [website, setWebsite] = useState('');
  // Request-only checkout: stays on its confirmation after the request list
  // is cleared, instead of dropping to the empty-cart state.
  const [requestOnlySent, setRequestOnlySent] = useState(false);

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
    const token = getCustomerToken();
    setIsAuthed(!!token);
    setAccountEmail((token && decodeCustomerToken(token)?.email) || '');
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
  // Everything being paid now: catalog items plus accepted quotes.
  const payableCount = items.length + quoted.lines.length;
  const fullSubtotal = subtotal + quoted.subtotal;

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

  async function handleQuickAdd(product: Product, variant: ProductVariant) {
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
        orderAmount: fullSubtotal,
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
  // Quoted lines count toward the minimum but aren't in the estimate.
  const minimumRemaining = shippingEstimate
    ? Math.max(0, shippingEstimate.wholesaleMinimum - (shippingEstimate.subtotal + quoted.subtotal))
    : 0;
  const belowMinimum = shippingEstimate != null && minimumRemaining > 0;
  // Quoted shipping is added by the server; shown here so the totals match.
  const displayShipping = shippingCost + quoted.shipping;
  const total = Math.max(0, fullSubtotal - discount + displayShipping + taxAmount);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (payableCount === 0) {
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
      if (quoted.tokens.length) payload.quoteTokens = quoted.tokens;
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

      // Combined checkout: send the "Price to confirm" items as an order
      // request first, then pay for the rest with its id attached. The
      // webhook links the paid order to it. If payment then fails or is
      // abandoned the request still stands — we price it either way.
      if (requests.lines.length > 0 || sentRequest) {
        let sent = sentRequest;
        if (!sent) {
          const created = await customerApi.post<{ id: string }>('/wholesale/quote-requests', {
            fullName,
            email: isAuthed ? accountEmail : email,
            phone: phone || undefined,
            companyName: companyName || undefined,
            destination: `${city}, ${stateCode} ${zip}, ${country}`.trim(),
            message: notes || undefined,
            type: 'QUOTE',
            withPayment: true,
            items: requestItemsPayload(requests.lines),
            website: website || undefined,
          });
          sent = { id: created.id, ref: requestReference(created.id) };
          setSentRequest(sent);
          await requests.clear();
        }
        payload.quoteRequestId = sent.id;
        try {
          sessionStorage.setItem(PENDING_REQUEST_REF_KEY, sent.ref);
        } catch {
          /* storage blocked — the success page just won't mention it */
        }
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

  const requestCount = requests.lines.length;
  const intro = (
    <div className="r-page-intro r-wrap">
      <span className="r-eyebrow">Checkout</span>
      <h1>Complete your order.</h1>
      <p>Confirm your details and delivery address, then pay securely with Stripe.</p>
    </div>
  );

  if (!ready || (isAuthed && isLoading) || !requests.loaded || !quoted.loaded) {
    return (
      <>
        {intro}
        <section className="r-wrap r-section" aria-busy="true">
          <p className="r-loading">Loading your checkout…</p>
        </section>
      </>
    );
  }

  // Only "Price to confirm" items: an order request, no payment.
  if (payableCount === 0 && (requestCount > 0 || requestOnlySent)) {
    return (
      <>
        <div className="r-page-intro r-wrap">
          <span className="r-eyebrow">Checkout</span>
          <h1>Request your order.</h1>
          <p>
            Everything in your cart is priced on request. Send it to us and we&apos;ll confirm prices and
            availability.
          </p>
        </div>
        <section className="r-wrap r-section">
          <OrderRequestForm
            lines={requests.lines}
            signedIn={isAuthed}
            defaultEmail={accountEmail}
            onSubmitted={async () => {
              setRequestOnlySent(true);
              await requests.clear();
            }}
          />
        </section>
      </>
    );
  }

  if (payableCount === 0) {
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

            {(requestCount > 0 || sentRequest) && (
              <div className="r-form-card">
                <h2>Price to confirm</h2>
                {sentRequest ? (
                  <p>
                    Your pricing request <strong>{sentRequest.ref}</strong> is sent. Only the priced items remain
                    to pay.
                  </p>
                ) : (
                  <>
                    <p>
                      {requestCount === 1 ? 'This item is' : `These ${requestCount} items are`} sent to us as an
                      order request when you pay. We reply with prices and availability; nothing is charged for{' '}
                      {requestCount === 1 ? 'it' : 'them'} now.
                    </p>
                    <RequestSummaryList lines={requests.lines} />
                  </>
                )}
                {/* Spam trap for the request: hidden from people and screen readers. */}
                <div className="r-honeypot" aria-hidden="true">
                  <label htmlFor="f-website">Website</label>
                  <input
                    id="f-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="r-form-card">
              <h2>Payment</h2>
              <div className="ga-pay-note">
                <LockKeyhole size={22} aria-hidden />
                <p>You&apos;ll be securely redirected to Stripe to enter your payment details.</p>
              </div>
            </div>

            {cancelledNoticeVisible && (
              <div className="ga-notice ga-dismissable" role="status">
                <span>
                  Payment was cancelled — nothing was charged. Your cart is saved, so you can complete payment now.
                  Any pricing request you sent is still with us.
                </span>
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
                `Add ${formatUsd(minimumRemaining)} to reach the minimum`
              ) : requestCount > 0 ? (
                `Pay ${formatUsd(total)} and request pricing for ${requestCount} item${requestCount === 1 ? '' : 's'}`
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

            {quoted.lines.length > 0 && (
              <ul className="ga-summary-lines">
                {quoted.lines.map((line) => (
                  <li key={line.key}>
                    <div className="ga-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={line.image} alt={line.name} />
                    </div>
                    <div className="ga-line-text">
                      <p>
                        {line.name} × {line.quantity}
                      </p>
                      <small>
                        {line.label} · quote {line.reference}
                      </small>
                    </div>
                    <span className="ga-line-price">{formatUsd(line.unitPrice * line.quantity)}</span>
                  </li>
                ))}
              </ul>
            )}

            {requestCount > 0 && (
              <div className="ga-summary-block">
                <span className="ga-label">Price to confirm · not included in total</span>
                <RequestSummaryList lines={requests.lines} />
              </div>
            )}

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
                <strong>{formatUsd(fullSubtotal)}</strong>
              </div>
              {discount > 0 && (
                <div className="ga-discount">
                  <span>Discount</span>
                  <span>-{formatUsd(discount)}</span>
                </div>
              )}
              <div>
                <span>Shipping</span>
                <span>{formatUsd(displayShipping)}</span>
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
