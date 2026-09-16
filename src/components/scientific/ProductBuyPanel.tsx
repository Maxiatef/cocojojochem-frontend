'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { addToCart } from '@/lib/cartStore';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { useToast } from '@/components/ui';
import { addToQuoteList } from '@/lib/quoteListStore';
import { CheckCircleIcon, FileIcon } from '@/components/icons';
import { WishlistButton } from '@/components/scientific/WishlistButton';
import { ProductMediaGallery } from '@/components/commerce/ProductMediaGallery';

/**
 * The product detail body, in the Scientific edition.
 *
 * A restyle of the storefront's `ProductDetailClient`: the cart and quote-list
 * logic, the guest/logged-in split, the per-order limit clamping and the
 * availability gating are carried over unchanged. Only the presentation moved.
 *
 * The specification table sits above the buy box, as it did on the storefront
 * page: a formulator checks the spec before choosing a pack size, so it reads
 * in the order the decision is actually made.
 *
 * One structural change: "Chemical details" was a hand-rolled open/close
 * button; it is a `<details>` now, so it is keyboard-operable and findable by
 * in-page search without JavaScript having to run first.
 */
export function ProductBuyPanel({ product }: { product: Product }) {
  const router = useRouter();
  const inStockVariants = product.variants.filter((v) => v.stockStatus !== 'OUT_OF_STOCK');
  const [variantId, setVariantId] = useState(
    (inStockVariants[0] || product.variants[0])?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToQuoteList, setAddingToQuoteList] = useState(false);
  const toast = useToast();

  const variant = product.variants.find((v) => v.id === variantId) || null;
  const price = variant ? Number(variant.effectivePrice ?? variant.price) : null;
  const notYetAvailable = !!variant?.availableFrom && new Date(variant.availableFrom) > new Date();
  const availableFromLabel =
    variant?.availableFrom &&
    new Date(variant.availableFrom).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  // Clamp quantity down if switching to a variant with a stricter (or newly
  // set) per-order limit than the quantity already selected.
  useEffect(() => {
    if (variant?.limitPerOrder && variant.maxOrderQuantity && quantity > variant.maxOrderQuantity) {
      setQuantity(variant.maxOrderQuantity);
    }
  }, [variant, quantity]);

  async function handleAddToCart() {
    if (!variant) return;

    // Logged-in customers get a server-persisted cart (survives across
    // devices/sessions as a draft); guests fall back to the localStorage cart.
    const token = getCustomerToken();
    if (token) {
      setAddingToCart(true);
      try {
        await customerApi.post('/cart/items', { productVariantId: variant.id, quantity });
        window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } catch (err) {
        toast.show(getFriendlyErrorMessage(err), 'error');
      } finally {
        setAddingToCart(false);
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
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleAddToQuoteList() {
    // Same split as handleAddToCart above: logged-in customers get a
    // server-persisted quote list (scoped to their account), guests fall
    // back to the localStorage one.
    const token = getCustomerToken();
    if (token) {
      setAddingToQuoteList(true);
      try {
        await customerApi.post('/quote-list/items', {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          variantLabel: variant?.label || null,
          imageUrl: variant?.imageUrl || product.imageUrl,
          quantity,
        });
        window.dispatchEvent(new Event('cocojojochem-server-quote-list-changed'));
        toast.success('Added to your quote list — visit “Quote list” to review and submit it.');
      } catch (err) {
        toast.show(getFriendlyErrorMessage(err), 'error');
      } finally {
        setAddingToQuoteList(false);
      }
      return;
    }

    addToQuoteList({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant?.label || null,
      imageUrl: variant?.imageUrl || product.imageUrl,
      quantity,
    });
    toast.success('Added to your quote list — visit “Quote list” to review and submit it.');
  }

  const hasTags = !!(product.functions?.length || product.certifications?.length);

  return (
    <>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <ProductMediaGallery product={product} variantImageUrl={variant?.imageUrl} />

        <div className="flex flex-col">
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="font-sci-body text-sci-eyebrow font-medium uppercase text-sci-blue hover:underline"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="mt-3 font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy md:text-[40px] md:leading-[48px]">
            {product.name}
          </h1>

          {(product.inciName || product.casNumber) && (
            <p className="mt-3 font-sci-body text-sci-label text-sci-muted">
              {product.inciName && <>INCI: {product.inciName}</>}
              {product.inciName && product.casNumber && ' · '}
              {product.casNumber && <>CAS: {product.casNumber}</>}
            </p>
          )}

          {product.shortDescription && (
            <p className="mt-4 font-sci-body text-sci-body text-sci-muted">
              {product.shortDescription}
            </p>
          )}

          {hasTags && (
            <div className="mt-5 flex flex-wrap gap-2">
              {/* Functions link into the catalog filtered to that function —
                  "what else does this job?" is the question these labels
                  raise. Certifications don't: they describe this material. */}
              {product.functions?.map((f) => (
                <Link
                  key={f.id}
                  href={`/products?functionSlug=${f.slug}`}
                  className="rounded-full bg-sci-blue/10 px-3 py-1 font-sci-body text-sci-label font-medium text-sci-blue transition hover:bg-sci-blue/20"
                >
                  {f.name}
                </Link>
              ))}

              {product.certifications?.map((c) => {
                // When a certificate PDF has been attached for this
                // certification, the badge becomes its link — proof rather
                // than a claim. Otherwise it stays a plain label.
                const proof = (product.documents || []).find(
                  (d) => d.type === 'CERTIFICATE' && d.certificationId === c.id,
                );

                if (!proof) {
                  return (
                    <span
                      key={c.id}
                      className="rounded-full border border-sci-border bg-white px-3 py-1 font-sci-body text-sci-label text-sci-navy"
                    >
                      {c.name}
                    </span>
                  );
                }

                return (
                  <a
                    key={c.id}
                    href={proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`View the ${c.name} certificate (opens in a new tab)`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-sci-border bg-white px-3 py-1 font-sci-body text-sci-label text-sci-navy transition hover:border-sci-blue hover:text-sci-blue"
                  >
                    <FileIcon className="h-3 w-3" />
                    {c.name}
                  </a>
                );
              })}
            </div>
          )}

          <ProductFactsTable product={product} />

          {/* Buy box */}
          <div className="mt-8 rounded-xl border border-sci-border bg-sci-pale p-6">
            {product.variants.length > 0 ? (
              <>
                <p className="mb-2.5 font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
                  Pack size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      disabled={v.stockStatus === 'OUT_OF_STOCK'}
                      onClick={() => setVariantId(v.id)}
                      aria-pressed={variantId === v.id}
                      className={`rounded-md border px-4 py-2.5 font-sci-body text-sci-label font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        variantId === v.id
                          ? 'border-sci-blue bg-sci-blue text-white'
                          : 'border-sci-border bg-white text-sci-navy hover:border-sci-blue'
                      }`}
                    >
                      {v.label || v.sku}
                    </button>
                  ))}
                </div>

                {price != null && (
                  <div className="mt-6 flex items-baseline gap-3">
                    <span className="font-sci-heading text-[32px] font-semibold leading-10 text-sci-navy">
                      {formatUsd(price)}
                    </span>
                    {variant?.isOnSale && (
                      <span className="font-sci-body text-sci-body text-sci-muted line-through">
                        {formatUsd(variant.price)}
                      </span>
                    )}
                  </div>
                )}

                {variant && (
                  <p className="mt-1.5 font-sci-body text-sci-label text-sci-muted">
                    SKU: {variant.sku} ·{' '}
                    {variant.stockStatus === 'IN_STOCK'
                      ? 'In stock'
                      : variant.stockStatus === 'ON_BACKORDER'
                        ? 'On backorder'
                        : 'Out of stock'}
                    {variant.limitPerOrder && variant.maxOrderQuantity && (
                      <> · Limit {variant.maxOrderQuantity} per order</>
                    )}
                  </p>
                )}

                {notYetAvailable && (
                  <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 font-sci-body text-sci-label font-medium text-amber-800">
                    Available starting {availableFromLabel} — you can browse now, but it can&apos;t
                    be added to your cart until then.
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-md border border-sci-border bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                      className="px-4 py-3 text-sci-muted transition hover:text-sci-navy"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-sci-body text-sci-label font-medium text-sci-navy">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          variant?.limitPerOrder && variant.maxOrderQuantity
                            ? Math.min(variant.maxOrderQuantity, q + 1)
                            : q + 1,
                        )
                      }
                      aria-label="Increase quantity"
                      title="Increase quantity"
                      disabled={
                        !!variant?.limitPerOrder &&
                        !!variant.maxOrderQuantity &&
                        quantity >= variant.maxOrderQuantity
                      }
                      className="px-4 py-3 text-sci-muted transition hover:text-sci-navy disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={
                      !variant ||
                      variant.stockStatus === 'OUT_OF_STOCK' ||
                      notYetAvailable ||
                      addingToCart
                    }
                    className="inline-flex min-w-[200px] flex-1 items-center justify-center gap-2 rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {added && <CheckCircleIcon className="h-4 w-4" />}
                    {addingToCart
                      ? 'Adding…'
                      : added
                        ? 'Added'
                        : notYetAvailable
                          ? 'Not yet available'
                          : 'Add to cart'}
                  </button>
                </div>

                <WishlistButton
                  productId={product.id}
                  variant="labelled"
                  className="mt-3 w-full sm:w-auto"
                />

                {added && (
                  <button
                    onClick={() => router.push('/cart')}
                    className="mt-3 font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
                  >
                    View cart →
                  </button>
                )}
              </>
            ) : (
              <p className="font-sci-body text-sci-body text-sci-muted">
                This product has no purchasable sizes yet — send a quote request and we will
                confirm what we can supply.
              </p>
            )}

            <button
              onClick={handleAddToQuoteList}
              disabled={addingToQuoteList}
              className="mt-3 w-full rounded-md border border-sci-border bg-white px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:border-sci-blue hover:text-sci-blue disabled:opacity-60"
            >
              {addingToQuoteList ? 'Adding…' : 'Add to quote list'}
            </button>
          </div>

          {(product.chemicalDescriptions || product.botanicalName) && (
            <details className="group mt-6 border-t border-sci-border pt-6">
              <summary className="flex cursor-pointer list-none items-center justify-between font-sci-body text-sci-label font-medium text-sci-navy marker:content-none">
                Chemical details
                <span aria-hidden className="text-sci-muted">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <div className="mt-3 flex flex-col gap-2 font-sci-body text-sci-body text-sci-muted">
                {product.botanicalName && <p>Botanical name: {product.botanicalName}</p>}
                {product.chemicalDescriptions && <p>{product.chemicalDescriptions}</p>}
              </div>
            </details>
          )}
        </div>
      </div>

      {product.description && (
        <section className="mt-16 border-t border-sci-border pt-10">
          <h2 className="font-sci-heading text-sci-subheading font-semibold text-sci-navy">
            Product details
          </h2>
          <p className="mt-4 max-w-[900px] whitespace-pre-line font-sci-body text-sci-body text-sci-muted">
            {product.description}
          </p>
        </section>
      )}
    </>
  );
}

/**
 * The specification table under the buy box — brand, category, stock, and
 * every admin-entered spec row (pH, appearance, and so on).
 */
function ProductFactsTable({ product }: { product: Product }) {
  const prices = product.variants
    .map((v) => Number(v.effectivePrice ?? v.price))
    .filter((n) => !isNaN(n));
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const stockStatuses = product.variants.map((v) => v.stockStatus);
  const overallStock = stockStatuses.includes('OUT_OF_STOCK')
    ? 'Out of stock'
    : stockStatuses.includes('ON_BACKORDER')
      ? 'On backorder'
      : 'In stock';

  const rows: { label: string; value: string }[] = [];
  if (product.brand) rows.push({ label: 'Brand', value: product.brand });
  if (product.category?.name) rows.push({ label: 'Category', value: product.category.name });
  if (minPrice != null) {
    rows.push({
      label: 'Price range',
      value:
        minPrice === maxPrice
          ? formatUsd(minPrice)
          : `${formatUsd(minPrice)} – ${formatUsd(maxPrice as number)}`,
    });
  }
  rows.push({ label: 'Stock', value: overallStock });
  for (const spec of product.specs || []) {
    rows.push({ label: spec.key, value: spec.value });
  }

  if (rows.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-navy">
        Specification
      </h2>
      <dl className="divide-y divide-sci-border border-y border-sci-border font-sci-body text-sci-label">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[140px_1fr] gap-4 py-3">
            <dt className="text-sci-muted">{r.label}</dt>
            <dd className="text-sci-navy">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
