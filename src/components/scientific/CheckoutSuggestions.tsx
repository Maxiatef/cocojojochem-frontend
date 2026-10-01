'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Product, ProductVariant } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { customerApi } from '@/lib/customerApi';
import { ImagePlaceholderIcon, CheckCircleIcon } from '@/components/icons';

/**
 * The checkout cross-sell.
 *
 * It is a form section, not a banner: same shell and heading as the sections
 * above it, sitting just before the terms checkbox. Names and images open the
 * product in a new tab so the half-filled form is never lost.
 *
 * **It never runs dry.** Three cards are shown. When one is added it shows
 * "Added" for a moment and is then replaced by a fresh suggestion from a
 * queue, which is refilled from the server (skipping everything already
 * shown) before it empties. When the catalogue is exhausted the shown-list is
 * reset, so the panel starts over rather than disappearing.
 *
 * **Different sizes count.** A product already in the cart can come back with
 * a size that is not, so each card offers the first in-stock variant that is
 * not in the cart yet.
 *
 * Only the slot that was clicked changes — the other cards hold still, so
 * nothing moves under the cursor.
 */
const SLOTS = 3;
const BATCH = 9;

export function pickVariant(product: Product, inCart: string[]): ProductVariant | undefined {
  const fresh = product.variants.filter((v) => !inCart.includes(v.id));
  return (
    fresh.find((v) => v.stockStatus !== 'OUT_OF_STOCK') ||
    fresh[0] ||
    product.variants.find((v) => v.stockStatus !== 'OUT_OF_STOCK') ||
    product.variants[0]
  );
}

export function CheckoutSuggestions({
  cartVariantIds,
  enabled,
  onAdd,
}: {
  cartVariantIds: string[];
  enabled: boolean;
  onAdd: (product: Product, variant: ProductVariant) => Promise<void> | void;
}) {
  const [slots, setSlots] = useState<Product[]>([]);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const queue = useRef<Product[]>([]);
  const shown = useRef<string[]>([]);
  const fetching = useRef<Promise<void> | null>(null);
  const cartRef = useRef(cartVariantIds);
  cartRef.current = cartVariantIds;

  const refill = useCallback(() => {
    if (fetching.current) return fetching.current;
    const run = async () => {
      const ask = (exclude: string[]) =>
        customerApi.get<Product[]>(
          `/wholesale/products/cart-suggestions?limit=${BATCH}` +
            `&variantIds=${cartRef.current.join(',')}&exclude=${exclude.slice(-200).join(',')}`,
        );
      let fresh = await ask(shown.current).catch(() => [] as Product[]);
      if (!fresh.length && shown.current.length) {
        // Everything has been shown once: start over, keeping only what is on screen.
        shown.current = [];
        fresh = await ask(queue.current.map((p) => p.id)).catch(() => [] as Product[]);
      }
      const known = new Set([...shown.current, ...queue.current.map((p) => p.id)]);
      const add = fresh.filter((p) => !known.has(p.id));
      queue.current.push(...add);
    };
    fetching.current = run().finally(() => {
      fetching.current = null;
    });
    return fetching.current;
  }, []);

  const take = useCallback((exclude: string[]) => {
    const i = queue.current.findIndex((p) => !exclude.includes(p.id));
    if (i < 0) return undefined;
    const [next] = queue.current.splice(i, 1);
    shown.current.push(next.id);
    return next;
  }, []);

  // First fill, once the cart has arrived (a tick after mount).
  const hasCart = cartVariantIds.length > 0;
  useEffect(() => {
    if (!enabled || !hasCart || slots.length) return;
    let cancelled = false;
    refill().then(() => {
      if (cancelled) return;
      const first: Product[] = [];
      for (let n = 0; n < SLOTS; n++) {
        const p = take(first.map((x) => x.id));
        if (p) first.push(p);
      }
      setSlots(first);
      refill();
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, hasCart, slots.length, refill, take]);

  if (slots.length === 0) return null;

  async function handleAdd(product: Product) {
    const variant = pickVariant(product, cartRef.current);
    if (!variant) return;
    setBusyId(product.id);
    try {
      await onAdd(product, variant);
      setAddedIds((ids) => [...ids, product.id]);
    } finally {
      setBusyId(null);
    }
    // Let the confirmation register, then swap in a fresh card for this slot.
    window.setTimeout(async () => {
      if (queue.current.length < SLOTS) await refill();
      setSlots((current) => {
        const next = take(current.map((p) => p.id));
        return next ? current.map((p) => (p.id === product.id ? next : p)) : current;
      });
      setAddedIds((ids) => ids.filter((id) => id !== product.id));
      if (queue.current.length < SLOTS) refill();
    }, 900);
  }

  const products = slots;

  return (
    <div className="rounded-xl border border-sci-border bg-white p-6 md:p-8">
      <h2 className="font-sci-heading text-[20px] font-semibold text-sci-navy">
        Often ordered together
      </h2>
      <p className="mb-5 mt-1 text-sm text-sci-muted">
        From the same categories and functions as your cart, including other sizes. Add one and another takes its place.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {products.map((product) => {
          const variant = pickVariant(product, cartVariantIds);
          const price = variant ? Number(variant.effectivePrice ?? variant.price) : null;
          const image = variant?.imageUrl || product.imageUrl;
          const added = addedIds.includes(product.id);

          return (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-lg border border-sci-border transition hover:border-sci-blue"
            >
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-sci-pale"
              >
                {variant?.isOnSale && (
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-sci-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sci-navy">
                    Sale
                  </span>
                )}
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <ImagePlaceholderIcon className="h-6 w-6 text-sci-border" />
                )}
              </Link>

              <div className="flex flex-1 flex-col p-3">
                <h3 className="text-sm font-medium leading-5">
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${product.name} — opens in a new tab`}
                    className="line-clamp-2 text-sci-navy transition hover:text-sci-blue hover:underline"
                  >
                    {product.name}
                  </Link>
                </h3>

                {/* mt-auto pins the price and button to the bottom, so a
                    two-line name on one card does not leave its neighbours'
                    buttons sitting at three different heights. */}
                <div className="mt-auto pt-2.5">
                  {price != null && (
                    <p className="text-sm font-semibold text-sci-navy">
                      {formatUsd(price)}
                      {variant?.label && (
                        <span className="ml-1 text-xs font-normal text-sci-muted">
                          / {variant.label}
                        </span>
                      )}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    disabled={!variant || busyId === product.id}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-sci-blue px-3 py-2 text-xs font-medium text-sci-blue transition hover:bg-sci-pale disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {added && <CheckCircleIcon className="h-3.5 w-3.5" />}
                    {busyId === product.id ? 'Adding…' : added ? 'Added' : 'Add to order'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
