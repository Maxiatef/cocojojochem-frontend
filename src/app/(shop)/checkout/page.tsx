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
import { CheckoutResponse, CouponValidateResult, Paginated, Product, ServerCart, ShippingEstimate } from '@/lib/types';
import { COUNTRY_CODES } from '@/lib/countryCodes';
import { US_STATES } from '@/lib/usStates';
import { CheckoutStepper } from '@/components/storefront/CheckoutStepper';
import { ImagePlaceholderIcon } from '@/components/icons';

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
  // filled-in zip on international addresses to avoid wasted Shippo calls.
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

  // Cross-sell strip: 3 published products not already in the cart.
  const cartVariantIds = new Set((items as any[]).map((i) => i.variantId ?? i.variant?.id));
  const { data: crossSellRes } = useQuery({
    queryKey: ['checkout-cross-sell'],
    queryFn: () => customerApi.get<Paginated<Product>>('/wholesale/products?page=1&limit=8&sort=newest'),
    enabled: ready,
  });
  const crossSellProducts = (crossSellRes?.data || [])
    .filter((p) => !p.variants.some((v) => cartVariantIds.has(v.id)))
    .slice(0, 3);

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
  const total = Math.max(0, subtotal - discount + shippingCost);

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

      const { order, checkoutUrl } = await customerApi.post<CheckoutResponse>('/orders/checkout', payload);

      if (!isAuthed) {
        if (order.accessToken) setCustomerToken(order.accessToken);
        clearCart();
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      router.push(`/checkout/success?order=${order.id}`);
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

  const inputClass =
    'w-full border border-sand-300 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-olive-600';
  const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft';

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Checkout</p>
      <h1 className="mb-6 mt-1 font-display text-4xl text-ink">Complete Your Order</h1>

      <div className="mb-10">
        <CheckoutStepper current={1} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-sand-200 bg-white p-6">
            <h2 className="mb-4 font-display text-lg text-ink">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  required
                  disabled={isAuthed}
                  value={isAuthed ? '' : email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAuthed ? 'Using your account email' : undefined}
                  className={`${inputClass} disabled:bg-sand-100 disabled:text-ink-soft`}
                />
              </div>
            </div>

            {!isAuthed && (
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
                    <label className={labelClass}>Password</label>
                    <input
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

          <div className="border border-sand-200 bg-white p-6">
            <h2 className="mb-4 font-display text-lg text-ink">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>First name</label>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Company name (optional)</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Country</label>
                <select
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
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Street address</label>
                <input required value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {countryIso2 === 'US' && (
                  <div>
                    <label className={labelClass}>State</label>
                    <select
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
                )}
                <div className={countryIso2 === 'US' ? '' : 'col-span-2'}>
                  <label className={labelClass}>ZIP / Postal code</label>
                  <input required value={zip} onChange={(e) => setZip(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Phone</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Order notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-sand-200 pt-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={residentialDelivery}
                  onChange={(e) => setResidentialDelivery(e.target.checked)}
                  className="h-4 w-4 rounded border-sand-300 text-olive-600 focus:ring-olive-500"
                />
                Residential delivery
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={liftgateService}
                  onChange={(e) => setLiftgateService(e.target.checked)}
                  className="h-4 w-4 rounded border-sand-300 text-olive-600 focus:ring-olive-500"
                />
                Liftgate service
              </label>
              <p className="text-xs text-ink-soft/70">
                These add-ons don&apos;t affect your total yet — a member of our team will follow up if either is needed for your shipment.
              </p>
            </div>

            {countryIso2 !== 'US' && (
              <div className="mt-4 border-t border-sand-200 pt-4">
                <InternationalShippingNotice />
              </div>
            )}
          </div>

          <div className="border border-sand-200 bg-white p-6">
            <h2 className="mb-2 font-display text-lg text-ink">Payment</h2>
            <p className="text-sm text-ink-soft">
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
            {submitting ? 'Redirecting to payment…' : `Continue to Payment — ${formatUsd(total)}`}
          </button>
        </form>

        <div className="space-y-6">
          <div className="h-fit bg-white p-6">
            <h2 className="mb-4 font-display text-lg text-ink">Order Summary</h2>
            <div className="space-y-3">
              {isAuthed
                ? (items as any[]).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-sand-100">
                        {item.variant?.imageUrl || item.variant?.product?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.variant.imageUrl || item.variant.product?.imageUrl}
                            alt={item.variant.product?.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImagePlaceholderIcon className="h-5 w-5 text-sand-400" />
                        )}
                      </div>
                      <span className="flex-1 text-ink-soft">
                        {item.variant.product?.name} × {item.quantity}
                        <span className="block text-xs text-ink-soft/70">{item.variant.label}</span>
                      </span>
                      <span className="font-medium text-ink">
                        {formatUsd(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))
                : (items as any[]).map((item) => (
                    <div key={item.variantId} className="flex items-center gap-3 text-sm">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-sand-100">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlaceholderIcon className="h-5 w-5 text-sand-400" />
                        )}
                      </div>
                      <span className="flex-1 text-ink-soft">
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
              <ShippingSummaryPanel
                countryIso2={countryIso2}
                estimate={shippingEstimate}
                loading={shippingLoading}
              />
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
                  <label className={labelClass}>Coupon code</label>
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
            <div className="mt-2 flex justify-between text-sm text-ink-soft">
              <span>Shipping</span>
              <span>{formatUsd(shippingCost)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-ink-soft">
              <span>Tax</span>
              <span>{formatUsd(0)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-sand-200 pt-3 text-sm font-semibold text-ink">
              <span>Total</span>
              <span>{formatUsd(total)}</span>
            </div>
          </div>

          {crossSellProducts.length > 0 && (
            <div className="bg-white p-6">
              <h2 className="mb-4 font-display text-base text-ink">Complete your order</h2>
              <div className="space-y-3">
                {crossSellProducts.map((product) => {
                  const variant = product.variants[0];
                  return (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-sand-100">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlaceholderIcon className="h-5 w-5 text-sand-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                        {variant && (
                          <p className="text-xs text-ink-soft">{formatUsd(Number(variant.effectivePrice ?? variant.price))}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        className="shrink-0 border border-olive-700 px-3 py-1.5 text-xs font-medium text-olive-700 transition hover:bg-olive-50"
                      >
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Shipping Notice</p>

      {loading && <p className="text-sm text-ink-soft">Calculating…</p>}

      {!loading && !estimate && (
        <p className="text-sm text-ink-soft">
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
          <div className="flex justify-between text-sm text-ink">
            <span>{estimate.regionLabel || estimate.zoneName || estimate.shippingMethod || 'Shipping'}</span>
            <span>{estimate.carrierNotice ? 'Contact us' : formatUsd(estimate.shippingCost ?? 0)}</span>
          </div>
          {estimate.isFreeShipping && (
            <p className="mt-1 text-xs text-green-700">You&apos;ve unlocked free shipping.</p>
          )}
          {!estimate.isFreeShipping &&
            estimate.freeShippingThreshold != null &&
            estimate.amountAwayFromFreeShipping != null &&
            estimate.amountAwayFromFreeShipping > 0 && (
              <p className="mt-1 text-xs text-ink-soft">
                Add {formatUsd(estimate.amountAwayFromFreeShipping)} more for free shipping.
              </p>
            )}
          {estimate.weightLb != null && (
            <p className="mt-1 text-xs text-ink-soft">Combined shipment weight: {estimate.weightLb} lb</p>
          )}
          {estimate.carrierNotice && (
            <p className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">{estimate.carrierNotice}</p>
          )}
          {!isUs && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">International Shipping Estimate</p>
              <p className="mt-0.5 text-xs text-ink-soft/70">
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
        <Link href="/terms-of-service" target="_blank" className="font-medium underline">
          Terms of Service
        </Link>{' '}
        for the full policy.
      </p>
    </div>
  );
}
