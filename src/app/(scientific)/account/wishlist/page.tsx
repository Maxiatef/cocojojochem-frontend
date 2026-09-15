'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { addToCart } from '@/lib/cartStore';
import { useWishlistState } from '@/lib/useWishlistState';
import { useWishlist } from '@/lib/wishlistStore';
import { Product } from '@/lib/types';
import { formatUsd, getDefaultVariant, getPriceRange } from '@/lib/pricing';
import { Container, Eyebrow, SciButton } from '@/components/scientific/primitives';
import { ImagePlaceholderIcon } from '@/components/icons';
import { useToast } from '@/components/ui';

/**
 * Saved products.
 *
 * Unlike the rest of /account this page does NOT require a session — a guest
 * has a wishlist too, held in localStorage, and bouncing them to a login
 * screen to see something they already saved would be the wrong answer. It
 * reads from whichever side of the sign-in line the visitor is on, and tells
 * a guest what signing in would buy them.
 */

type ServerWishlistItem = { id: number; productId: number; savedAt: string; product: Product };

export default function WishlistPage() {
  const signedIn = typeof window !== 'undefined' && !!getCustomerToken();
  const { ids: localIds } = useWishlist();

  const { data: serverItems, isLoading: loadingServer } = useQuery({
    queryKey: ['customer-wishlist'],
    queryFn: () => customerApi.get<ServerWishlistItem[]>('/wishlist'),
    enabled: signedIn,
  });

  // Guests hold ids only, so the products are resolved in one call. The ids
  // are part of the query key, so removing one re-renders from cache at once.
  const { data: guestProducts, isLoading: loadingGuest } = useQuery({
    queryKey: ['guest-wishlist-products', localIds.join(',')],
    queryFn: () =>
      customerApi.get<Product[]>(`/wholesale/products/by-ids?ids=${localIds.join(',')}`),
    enabled: !signedIn && localIds.length > 0,
  });

  const products: Product[] = signedIn
    ? (serverItems || []).map((item) => item.product)
    : guestProducts || [];
  const loading = signedIn ? loadingServer : loadingGuest;

  return (
    <>
      <section className="bg-sci-navy py-12 text-white">
        <Container className="flex flex-col gap-4">
          <Eyebrow tone="accent">Saved products</Eyebrow>
          <h1 className="font-sci-heading text-[36px] font-semibold leading-[44px] md:text-[48px] md:leading-[56px]">
            Your shortlist.
          </h1>
          <p className="max-w-[720px] font-sci-body text-sci-body text-[#adc6d8]">
            {products.length > 0
              ? `${products.length} ${products.length === 1 ? 'product' : 'products'} saved. Prices and stock are live — a saved product shows what it costs today, not what it cost when you saved it.`
              : 'Nothing saved yet. Use the heart on any product to keep it here while you work through a formulation.'}
          </p>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container className="flex flex-col gap-6">
          {!signedIn && localIds.length > 0 && (
            <p className="rounded-lg border border-sci-border bg-sci-pale p-4 font-sci-body text-sci-label text-sci-navy">
              These are saved in this browser only.{' '}
              <Link
                href="/account/login?redirect=/account/wishlist"
                className="text-sci-blue underline"
              >
                Sign in
              </Link>{' '}
              to keep them across your devices — anything saved here moves to your account
              automatically.
            </p>
          )}

          {loading ? (
            <p className="font-sci-body text-sci-body text-sci-muted">Loading saved products…</p>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-start gap-5">
              <p className="font-sci-body text-sci-body text-sci-muted">Your saved list is empty.</p>
              <SciButton href="/products" variant="navy">
                Browse the catalogue →
              </SciButton>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {products.map((product) => (
                <WishlistRow key={product.id} product={product} />
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}

function WishlistRow({ product }: { product: Product }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { toggle } = useWishlistState();

  const variants = product.variants || [];
  const [variantId, setVariantId] = useState(() => getDefaultVariant(variants)?.id ?? 0);
  const variant = variants.find((v) => v.id === variantId) || variants[0];
  const range = getPriceRange(variants);

  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [removing, setRemoving] = useState(false);

  const image = variant?.imageUrl || product.imageUrl;
  const outOfStock = variants.length > 0 && variants.every((v) => v.stockStatus !== 'IN_STOCK');

  async function handleAddToCart() {
    if (!variant) return;
    setBusy(true);
    try {
      // Same split as the product page: a signed-in customer's cart lives on
      // the server, a guest's in localStorage.
      if (getCustomerToken()) {
        await customerApi.post('/cart/items', { productVariantId: variant.id, quantity: 1 });
        window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
      } else {
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
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      toast.show(getFriendlyErrorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await toggle(product.id);
      queryClient.invalidateQueries({ queryKey: ['customer-wishlist'] });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-sci-border bg-white p-4 sm:flex-row sm:items-center">
      <Link
        href={`/products/${product.slug}`}
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sci-pale"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholderIcon className="h-6 w-6 text-sci-border" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {product.category && (
          <span className="font-sci-body text-sci-eyebrow font-medium uppercase text-sci-blue">
            {product.category.name}
          </span>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="font-sci-heading text-[17px] font-semibold leading-6 text-sci-navy hover:text-sci-blue"
        >
          {product.name}
        </Link>
        <span className="font-sci-body text-sci-label text-sci-muted">
          {range
            ? range.min === range.max
              ? formatUsd(range.min)
              : `${formatUsd(range.min)} – ${formatUsd(range.max)}`
            : 'Price on request'}
          {outOfStock && ' · Out of stock'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* The pack size is chosen here rather than saved with the product — a
            wishlist entry is the material, not a quantity decision. With a
            single size there is nothing to choose, so the select is dropped. */}
        {variants.length > 1 && (
          <select
            value={variantId}
            onChange={(e) => setVariantId(Number(e.target.value))}
            aria-label={`Pack size for ${product.name}`}
            className="rounded-md border border-sci-border bg-white px-3 py-2.5 font-sci-body text-sci-label text-sci-navy outline-none transition focus:border-sci-blue"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!variant || busy || variant?.stockStatus === 'OUT_OF_STOCK'}
          className="rounded-md bg-sci-accent px-5 py-2.5 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Adding…' : added ? 'Added' : 'Add to cart'}
        </button>

        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="rounded-md border border-sci-border px-4 py-2.5 font-sci-body text-sci-label font-medium text-sci-muted transition hover:border-sci-blue hover:text-sci-navy disabled:opacity-60"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
