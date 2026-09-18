'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/types';
import { formatUsd } from '@/lib/pricing';
import { customerApi } from '@/lib/customerApi';
import { ImagePlaceholderIcon, CheckCircleIcon } from '@/components/icons';

/**
 * The checkout cross-sell.
 *
 * Four decisions are worth stating, because each of them had an obvious
 * alternative:
 *
 * **It is a form section, not a banner.** Same `rounded-xl border bg-white`
 * shell and same 20px heading as Contact Information and Shipping Address
 * above it, so it reads as the last step of the form rather than an advert
 * dropped into it. It sits directly above the terms checkbox and the
 * Continue to Payment button — the last thing seen before committing, which
 * is the only place in a checkout an upsell is still useful.
 *
 * **Three cards, not four or six.** Three reads as a recommendation; six
 * reads as a second catalogue, and the honest description of a catalogue at
 * checkout is an exit. Three also divides cleanly into one column on a phone
 * and three in the form's column on a desktop, with no orphan row between.
 *
 * **Two actions, and neither one loses the form.** The image and the name
 * link through to the product, because three thumbnails are not enough to
 * decide on a raw material — an INCI name, a pack size and a spec sheet are.
 * That link opens in a new tab: a customer who has already typed an address
 * into the form above and navigates away has to come back and find their
 * place, and some of them will not. The Add button beside it is for the case
 * where they already know the material, and adds it without leaving at all.
 *
 * **The order is random, and fixed for the visit.** The server shuffles, so
 * two orders do not get the same three rows — a panel that never changes
 * stops being looked at. But it shuffles once, on mount: not on window focus,
 * and not when the cart changes (see `seedVariantIds` below). Cards that
 * rearrange themselves while someone is tabbing out to their email for a VAT
 * number, or the moment they click Add, are the more annoying failure.
 */
export function CheckoutSuggestions({
  cartVariantIds,
  enabled,
  onAdd,
}: {
  cartVariantIds: string[];
  enabled: boolean;
  onAdd: (product: Product) => Promise<void> | void;
}) {
  // Which cards have been added, so the button can confirm rather than look
  // like it did nothing. Keyed by product id — the card stays on screen, so
  // the state has to survive alongside it.
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // The cart as it was when this panel first saw it, and not after.
  //
  // Keying the query on the live cart looks right and is not: adding a
  // suggestion changes the cart, which changes the key, which re-fetches —
  // so the three cards reshuffle the instant one of them is clicked, the
  // card that was just added disappears under the cursor, and the "Added"
  // confirmation is unmounted before anyone can read it. Pinning the seed
  // means the panel a customer is interacting with holds still.
  //
  // The cart arrives a tick after mount (localStorage for a guest, a fetch
  // for a signed-in customer), which is why this is an effect guarded on
  // "still empty" rather than a useState initialiser.
  const [seedVariantIds, setSeedVariantIds] = useState<string[]>([]);
  useEffect(() => {
    if (seedVariantIds.length === 0 && cartVariantIds.length > 0) {
      setSeedVariantIds(cartVariantIds);
    }
  }, [cartVariantIds, seedVariantIds]);

  const { data: suggestions } = useQuery({
    queryKey: ['checkout-suggestions', [...seedVariantIds].sort().join(',')],
    queryFn: () =>
      customerApi.get<Product[]>(
        `/wholesale/products/cart-suggestions?limit=3&variantIds=${seedVariantIds.join(',')}`,
      ),
    enabled: enabled && seedVariantIds.length > 0,
    // See the note above about re-shuffling under the customer.
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const products = suggestions || [];
  if (products.length === 0) return null;

  async function handleAdd(product: Product) {
    setBusyId(product.id);
    try {
      await onAdd(product);
      setAddedIds((ids) => (ids.includes(product.id) ? ids : [...ids, product.id]));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-xl border border-sci-border bg-white p-6 md:p-8">
      <h2 className="font-sci-heading text-[20px] font-semibold text-sci-navy">
        Often ordered together
      </h2>
      <p className="mb-5 mt-1 text-sm text-sci-muted">
        From the same categories and functions as your cart. Adding one keeps you on this page.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {products.map((product) => {
          const variant =
            product.variants.find((v) => v.stockStatus !== 'OUT_OF_STOCK') || product.variants[0];
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
