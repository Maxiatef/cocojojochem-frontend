'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { addToCart } from '@/lib/cartStore';
import { CheckCircleIcon, ImagePlaceholderIcon } from '@/components/icons';

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const inStockVariants = product.variants.filter((v) => v.stockStatus !== 'OUT_OF_STOCK');
  const [variantId, setVariantId] = useState(
    (inStockVariants[0] || product.variants[0])?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) || null;
  const price = variant ? Number(variant.effectivePrice ?? variant.price) : null;
  const notYetAvailable = !!variant?.availableFrom && new Date(variant.availableFrom) > new Date();
  const availableFromLabel =
    variant?.availableFrom &&
    new Date(variant.availableFrom).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Clamp quantity down if switching to a variant with a stricter (or newly
  // set) per-order limit than the quantity already selected.
  useEffect(() => {
    if (variant?.limitPerOrder && variant.maxOrderQuantity && quantity > variant.maxOrderQuantity) {
      setQuantity(variant.maxOrderQuantity);
    }
  }, [variant, quantity]);

  function handleAddToCart() {
    if (!variant) return;
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

  return (
    <>
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-sand-100">
        {variant?.imageUrl || product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={variant?.imageUrl || product.imageUrl || ''}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholderIcon className="h-14 w-14 text-sand-400" />
        )}
      </div>

      <div>
        {product.category && (
          <a
            href={`/categories/${product.category.slug}`}
            className="text-xs font-semibold uppercase tracking-[0.15em] text-olive-600 hover:underline"
          >
            {product.category.name}
          </a>
        )}
        <h1 className="mt-2 font-display text-3xl text-ink">{product.name}</h1>
        {product.inciName && (
          <p className="mt-1.5 text-sm text-ink-soft">INCI: {product.inciName}</p>
        )}
        {product.casNumber && (
          <p className="mt-0.5 text-xs text-ink-soft/70">CAS: {product.casNumber}</p>
        )}

        {product.shortDescription && (
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.shortDescription}</p>
        )}

        {(product.functions?.length || product.certifications?.length) ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {product.functions?.map((f) => (
              <span key={f.id} className="bg-sand-100 px-2.5 py-1 text-xs text-ink-soft">
                {f.name}
              </span>
            ))}
            {product.certifications?.map((c) => (
              <span key={c.id} className="bg-olive-100 px-2.5 py-1 text-xs text-olive-800">
                {c.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 border-t border-sand-200 pt-6">
          <ProductFactsTable product={product} />
        </div>

        <div className="mt-7 border-t border-sand-200 pt-7">
          {product.variants.length > 0 ? (
            <>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stockStatus === 'OUT_OF_STOCK'}
                    onClick={() => setVariantId(v.id)}
                    className={`border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      variantId === v.id
                        ? 'border-olive-700 bg-olive-50 text-olive-800'
                        : 'border-sand-300 text-ink hover:border-ink-soft'
                    }`}
                  >
                    {v.label || v.sku}
                  </button>
                ))}
              </div>

              {price != null && (
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-2xl text-ink">{formatUsd(price)}</span>
                  {variant?.isOnSale && (
                    <span className="text-sm text-ink-soft/60 line-through">{formatUsd(variant.price)}</span>
                  )}
                </div>
              )}

              {variant && (
                <p className="mt-1 text-xs text-ink-soft">
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
                <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                  Available starting {availableFromLabel} — you can browse now, but it can&apos;t be added to your
                  cart until then.
                </p>
              )}

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center border border-sand-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-ink-soft hover:text-ink"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-ink">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        variant?.limitPerOrder && variant.maxOrderQuantity
                          ? Math.min(variant.maxOrderQuantity, q + 1)
                          : q + 1,
                      )
                    }
                    disabled={
                      !!variant?.limitPerOrder &&
                      !!variant.maxOrderQuantity &&
                      quantity >= variant.maxOrderQuantity
                    }
                    className="px-3 py-2 text-ink-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!variant || variant.stockStatus === 'OUT_OF_STOCK' || notYetAvailable}
                  className="flex flex-1 items-center justify-center gap-1.5 bg-olive-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-olive-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {added && <CheckCircleIcon className="h-4 w-4" />}
                  {added ? 'Added' : notYetAvailable ? 'Not Yet Available' : 'Add to Cart'}
                </button>
              </div>

              {added && (
                <button
                  onClick={() => router.push('/cart')}
                  className="mt-3 text-sm font-medium text-olive-700 hover:underline"
                >
                  View cart →
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-soft">This product has no purchasable sizes yet.</p>
          )}
        </div>

        {(product.chemicalDescriptions || product.botanicalName) && (
          <div className="mt-6 border-t border-sand-200 pt-6">
            <button
              onClick={() => setDescOpen((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-medium text-ink"
            >
              Chemical Details
              <span className="text-ink-soft">{descOpen ? '−' : '+'}</span>
            </button>
            {descOpen && (
              <div className="mt-3 space-y-2 text-sm text-ink-soft">
                {product.botanicalName && <p>Botanical name: {product.botanicalName}</p>}
                {product.chemicalDescriptions && <p>{product.chemicalDescriptions}</p>}
              </div>
            )}
          </div>
        )}

      </div>
    </div>

    {product.description && (
      <div className="mt-10 border-t border-sand-200 pt-8">
        <h2 className="mb-3 text-sm font-medium text-ink">Product Details</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{product.description}</p>
      </div>
    )}
    </>
  );
}

// Compact facts table under the buy box — brand, category, stock, and every
// admin-entered spec row (pH, appearance, etc.), WooCommerce "Additional
// Information" style.
function ProductFactsTable({ product }: { product: Product }) {
  const prices = product.variants.map((v) => Number(v.effectivePrice ?? v.price)).filter((n) => !isNaN(n));
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
      value: minPrice === maxPrice ? formatUsd(minPrice) : `${formatUsd(minPrice)} – ${formatUsd(maxPrice as number)}`,
    });
  }
  rows.push({ label: 'Stock', value: overallStock });
  for (const spec of product.specs || []) {
    rows.push({ label: spec.key, value: spec.value });
  }

  if (rows.length === 0) return null;

  return (
    <dl className="divide-y divide-sand-200 text-sm">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-2 gap-4 py-2">
          <dt className="text-ink-soft">{r.label}</dt>
          <dd className="text-ink">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
