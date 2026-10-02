'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { categoryImage } from '@/lib/gloss/images';
import { addProductToQuoteList, useAddVariantToCart } from '@/lib/gloss/useUnifiedCart';
import { Quantity } from '@/components/gloss/Quantity';
import { CompareToggle, WishlistToggle } from '@/components/gloss/ProductCard';
import { productImages, stockLabel, unitPrice } from './productInfo';

const REQUEST = 'request';

/**
 * The top of the product page (`r-product-detail`): the image pane and the
 * copy column with the purchase panel — the prototype's store-client `N` in
 * full mode, wired to our variants.
 *
 * Cart/quote logic carried over from scientific/ProductBuyPanel: default to
 * the first in-stock variant, clamp the quantity into the variant's MOQ and
 * per-order limit, block add-to-cart for out-of-stock or not-yet-available
 * sizes, and keep "Add to quote list" for everything. Guest vs signed-in is
 * handled by useAddVariantToCart / addProductToQuoteList.
 */
export function ProductDetailHero({ product }: { product: Product }) {
  const variants = product.variants || [];
  const inStock = variants.filter((v) => v.stockStatus !== 'OUT_OF_STOCK');
  const [selected, setSelected] = useState<string>((inStock[0] || variants[0])?.id ?? REQUEST);
  const [quantity, setQuantity] = useState(1);
  const [preferredSize, setPreferredSize] = useState('');
  const [busy, setBusy] = useState<'cart' | 'quote' | null>(null);
  const addToCart = useAddVariantToCart();

  const isRequest = selected === REQUEST;
  const variant = isRequest ? null : variants.find((v) => v.id === selected) || null;
  const price = variant ? unitPrice(variant) : null;
  const priced = price != null && price > 0;
  const notYetAvailable = !!variant?.availableFrom && new Date(variant.availableFrom) > new Date();
  const availableFromLabel =
    variant?.availableFrom &&
    new Date(variant.availableFrom).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const minQuantity = variant?.moq && variant.moq > 1 ? variant.moq : 1;
  const maxQuantity =
    variant?.limitPerOrder && variant.maxOrderQuantity ? variant.maxOrderQuantity : 999;

  // Clamp into the variant's allowed range whenever it changes: a stricter
  // limit must come down, a minimum must go up.
  useEffect(() => {
    if (quantity > maxQuantity) setQuantity(maxQuantity);
    else if (quantity < minQuantity) setQuantity(minQuantity);
  }, [quantity, minQuantity, maxQuantity]);

  const canAddToCart =
    !!variant && priced && variant.stockStatus !== 'OUT_OF_STOCK' && !notYetAvailable;

  async function handleCart() {
    if (!variant || !canAddToCart) return;
    setBusy('cart');
    await addToCart(product, variant, quantity);
    setBusy(null);
  }

  async function handleQuote() {
    setBusy('quote');
    const label = isRequest
      ? preferredSize.trim()
        ? `Requested size: ${preferredSize.trim()}`
        : 'Requested size'
      : variant?.label || null;
    await addProductToQuoteList(product, label, quantity);
    setBusy(null);
  }

  // Unpriced sizes and "Request a size" go to the quote list from the main button.
  const mainIsQuote = isRequest || !priced;

  const certifications = product.certifications || [];
  const functions = product.functions || [];

  return (
    <section className="r-wrap r-product-detail">
      <ProductMedia product={product} variantImageUrl={variant?.imageUrl || null} />

      <div className="r-detail-copy">
        <span className="r-product-source">{product.brand || 'COCOJOJO collection'}</span>
        <h1>{product.name}</h1>
        {product.inciName && <p className="r-inci">{product.inciName}</p>}
        {product.shortDescription && <p className="r-description">{product.shortDescription}</p>}

        {(functions.length > 0 || certifications.length > 0) && (
          <div className="r-product-traits">
            {functions.map((f) => (
              <Link key={f.id} href={`/functions/${f.slug}`}>
                {f.name}
              </Link>
            ))}
            {certifications.map((c) => {
              // A certification with its certificate attached links to the
              // proof; otherwise it stays a plain label.
              const proof = (product.documents || []).find(
                (d) => d.type === 'CERTIFICATE' && d.certificationId === c.id,
              );
              return proof ? (
                <a
                  key={c.id}
                  href={proof.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View the ${c.name} certificate (opens in a new tab)`}
                >
                  <FileText size={12} aria-hidden /> {c.name}
                </a>
              ) : (
                <span key={c.id}>{c.name}</span>
              );
            })}
          </div>
        )}

        <div className="r-purchase">
          <div className="r-price">
            {priced ? formatUsd(price as number) : 'Price on request'}
            {priced && variant?.isOnSale && (
              <s className="g-cat-was" aria-label={`Was ${formatUsd(variant.price)}`}>
                {formatUsd(variant.price)}
              </s>
            )}
            <span>
              {priced ? 'USD · before shipping and tax' : 'Pricing confirmed with your quote'}
            </span>
          </div>

          <label className="r-field" htmlFor="pack-size">
            Pack size
            <select id="pack-size" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {variants.map((v) => {
                const p = unitPrice(v);
                return (
                  <option key={v.id} value={v.id} disabled={v.stockStatus === 'OUT_OF_STOCK'}>
                    {v.label || v.sku}
                    {p > 0 ? ` · ${formatUsd(p)}` : ''}
                    {v.stockStatus === 'OUT_OF_STOCK' ? ' · out of stock' : ''}
                  </option>
                );
              })}
              <option value={REQUEST}>Request a size</option>
            </select>
          </label>

          {isRequest && (
            <label className="r-field" htmlFor="preferred-size">
              Preferred size
              <input
                id="preferred-size"
                value={preferredSize}
                onChange={(e) => setPreferredSize(e.target.value)}
                placeholder="For example, 25 kg or 5 gallons"
                maxLength={120}
              />
            </label>
          )}

          <div className="r-stock">
            <Package size={16} aria-hidden />
            {variant ? (
              <span>
                {stockLabel(variant)} · SKU {variant.sku}
                {variant.limitPerOrder && variant.maxOrderQuantity
                  ? ` · Limit ${variant.maxOrderQuantity} per order`
                  : ''}
              </span>
            ) : (
              <span>Availability and pack size confirmed on request</span>
            )}
          </div>

          {notYetAvailable && (
            <p className="r-fine g-cat-notice">
              Available starting {availableFromLabel}. You can browse now, but it can’t be added to
              your cart until then.
            </p>
          )}
          {minQuantity > 1 && (
            <p className="r-fine g-cat-notice">
              Minimum order: <strong>{minQuantity}</strong> × {variant?.label}
            </p>
          )}

          <div className="r-buy-row">
            <Quantity value={quantity} onChange={setQuantity} min={minQuantity} max={maxQuantity} />
            {mainIsQuote ? (
              <button
                type="button"
                className="r-btn r-primary"
                disabled={busy !== null}
                onClick={handleQuote}
              >
                <ClipboardList size={18} aria-hidden />
                {busy === 'quote' ? 'Adding…' : 'Add to cart · price to confirm'}
              </button>
            ) : (
              <button
                type="button"
                className="r-btn r-primary"
                disabled={!canAddToCart || busy !== null}
                onClick={handleCart}
              >
                <ShoppingBag size={18} aria-hidden />
                {busy === 'cart'
                  ? 'Adding…'
                  : notYetAvailable
                    ? 'Not yet available'
                    : variant?.stockStatus === 'OUT_OF_STOCK'
                      ? 'Out of stock'
                      : 'Add to cart'}
              </button>
            )}
          </div>

          {priced && quantity > minQuantity && (
            <p className="r-fine g-cat-subtotal">
              <span>
                {quantity} × {formatUsd(price as number)}
                {variant?.label ? ` per ${variant.label}` : ''}
              </span>
              <strong>{formatUsd((price as number) * quantity)}</strong>
            </p>
          )}

          {!mainIsQuote && (
            <button
              type="button"
              className="r-btn r-outline g-cat-quote"
              disabled={busy !== null}
              onClick={handleQuote}
            >
              <ClipboardList size={17} aria-hidden />
              {busy === 'quote' ? 'Adding…' : 'Add to cart · price to confirm'}
            </button>
          )}

          <p className="r-fine">
            {mainIsQuote
              ? 'Our team confirms your selected size, grade, price and delivery timing.'
              : 'Shipping is calculated at checkout by weight and destination.'}
          </p>

          <div className="r-secondary-actions">
            <WishlistToggle product={product} labelled />
            <CompareToggle product={product} labelled />
          </div>
        </div>

        <div className="r-detail-assurance">
          <span>
            <FileText size={16} aria-hidden />
            <a href="#documents">Technical documents</a>
          </span>
          <span>
            <Package size={16} aria-hidden />
            <Link href="/shipping-returns">Shipping &amp; returns</Link>
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * The image pane (`r-detail-image`) plus a thumbnail strip when there is more
 * than one photo. Without a photo it shows the category's representative
 * image and says so, like the prototype. A variant photo takes over the pane.
 */
function ProductMedia({
  product,
  variantImageUrl,
}: {
  product: Product;
  variantImageUrl: string | null;
}) {
  const images = useMemo(() => productImages(product), [product]);
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [variantImageUrl]);

  const fallback = categoryImage(product.category?.slug || product.category?.name);
  const own = variantImageUrl || images[active]?.url || null;
  const src = own || fallback;
  const alt = own
    ? (!variantImageUrl && images[active]?.alt) || product.name
    : `${product.category?.name || 'Ingredient'} representative ingredient texture`;
  const step = (d: number) => setActive((i) => (i + d + images.length) % images.length);
  const showArrows = images.length > 1 && !variantImageUrl;

  return (
    <div className="g-cat-media">
      <div className="r-detail-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={740} height={740} fetchPriority="high" />
        {!own && <span>Representative category image</span>}
        {showArrows ? (
          <>
            <button
              type="button"
              className="g-cat-arrow g-cat-prev"
              aria-label="Previous image"
              onClick={() => step(-1)}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="g-cat-arrow g-cat-next"
              aria-label="Next image"
              onClick={() => step(1)}
            >
              <ChevronRight size={20} />
            </button>
          </>
        ) : (
          <div>
            <FlaskConical size={22} aria-hidden />
            <strong>Start with the right ingredient.</strong>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="g-cat-thumbs">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={!variantImageUrl && i === active}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" width={80} height={80} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
