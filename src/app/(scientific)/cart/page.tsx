'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { getCustomerToken } from '@/lib/customerAuth';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { useCart, LocalCartItem } from '@/lib/cartStore';
import { formatUsd } from '@/lib/pricing';
import { ServerCart, ServerCartItem } from '@/lib/types';
import { CloseIcon, ImagePlaceholderIcon } from '@/components/icons';
import { Container, Eyebrow } from '@/components/scientific/primitives';

/**
 * The cart, in the Scientific edition.
 *
 * A restyle. The two-view split is untouched: a signed-in customer gets the
 * server cart (`/cart`, persisted against their account), a guest gets the
 * localStorage one, and `isAuthed === null` renders nothing on the first pass
 * so the wrong cart never flashes before the token is read.
 *
 * The row layout is the one real change. It was a single flex row, which at
 * phone widths squeezed the product name into about ten characters between
 * the thumbnail and the stepper. It is a grid now that drops the controls
 * onto their own line below `sm`.
 */

/** Confirm popup shown when decrementing a line item would take it to zero. */
function RemoveItemConfirm({
  itemName,
  onConfirm,
  onCancel,
}: {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sci-deep/50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <p className="font-sci-body text-sci-body text-sci-navy">
          Remove <span className="font-medium">{itemName}</span> from your cart?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-sci-border px-4 py-2 font-sci-body text-sci-label font-medium text-sci-navy transition hover:bg-sci-pale"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 font-sci-body text-sci-label font-medium text-white transition hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/** Quantity stepper, shared by both row types. */
function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center rounded-md border border-sci-border bg-white">
      <button
        onClick={onDecrement}
        aria-label="Decrease quantity"
        title="Decrease quantity"
        className="px-3 py-2 text-sci-muted transition hover:text-sci-navy"
      >
        −
      </button>
      <span className="w-9 text-center font-sci-body text-sci-label font-medium text-sci-navy">
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        title="Increase quantity"
        className="px-3 py-2 text-sci-muted transition hover:text-sci-navy"
      >
        +
      </button>
    </div>
  );
}

/**
 * One cart line. Both views render the same shape from different data, so the
 * layout lives here once rather than being kept in step across two copies.
 */
function CartRow({
  href,
  imageUrl,
  productName,
  meta,
  quantity,
  lineTotal,
  onDecrement,
  onIncrement,
  onRemove,
}: {
  href: string;
  imageUrl: string | null;
  productName: string;
  meta: string;
  quantity: number;
  lineTotal: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-sci-border py-5 last:border-0 sm:grid-cols-[64px_1fr_auto_auto_auto]">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sci-pale">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholderIcon className="h-6 w-6 text-sci-border" />
        )}
      </div>

      <div className="min-w-0">
        <Link
          href={href}
          className="block truncate font-sci-heading text-[17px] font-semibold leading-6 text-sci-navy transition hover:text-sci-blue"
        >
          {productName}
        </Link>
        <p className="truncate font-sci-body text-sci-label text-sci-muted">{meta}</p>
      </div>

      <button
        onClick={onRemove}
        aria-label={`Remove ${productName} from your cart`}
        title={`Remove ${productName} from your cart`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-sci-muted transition hover:bg-red-50 hover:text-red-600 sm:order-last"
      >
        <CloseIcon className="h-4 w-4" />
      </button>

      {/* Below `sm` these two wrap onto their own row, spanning the full grid
          width, rather than competing with the name for horizontal space. */}
      <div className="col-span-3 flex items-center justify-between gap-4 sm:col-span-1 sm:justify-start">
        <QuantityStepper
          quantity={quantity}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
        />
        <p className="font-sci-heading text-[17px] font-semibold text-sci-navy sm:hidden">
          {formatUsd(lineTotal)}
        </p>
      </div>

      <p className="hidden w-24 text-right font-sci-heading text-[17px] font-semibold text-sci-navy sm:block">
        {formatUsd(lineTotal)}
      </p>
    </div>
  );
}

function GuestCartView() {
  const cart = useCart();

  return (
    <CartShell isEmpty={cart.items.length === 0} subtotal={cart.subtotal}>
      {cart.items.map((item) => (
        <GuestCartRow
          key={item.variantId}
          item={item}
          onUpdate={cart.updateQuantity}
          onRemove={cart.remove}
        />
      ))}
    </CartShell>
  );
}

function GuestCartRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: LocalCartItem;
  onUpdate: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  return (
    <>
      <CartRow
        href={`/products/${item.productSlug}`}
        imageUrl={item.imageUrl || null}
        productName={item.productName}
        meta={`${item.variantLabel} · ${item.sku}`}
        quantity={item.quantity}
        lineTotal={item.price * item.quantity}
        onDecrement={() => {
          if (item.quantity <= 1) {
            setConfirmingRemove(true);
            return;
          }
          onUpdate(item.variantId, item.quantity - 1);
        }}
        onIncrement={() => onUpdate(item.variantId, item.quantity + 1)}
        onRemove={() => onRemove(item.variantId)}
      />

      {confirmingRemove && (
        <RemoveItemConfirm
          itemName={item.productName}
          onCancel={() => setConfirmingRemove(false)}
          onConfirm={() => {
            onRemove(item.variantId);
            setConfirmingRemove(false);
          }}
        />
      )}
    </>
  );
}

function CustomerCartView() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['customer-cart'],
    queryFn: () => customerApi.get<ServerCart>('/cart'),
  });

  const updateQuantity = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      customerApi.patch(`/cart/items/${id}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-cart'] });
      window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => customerApi.delete(`/cart/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-cart'] });
      window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  if (isLoading) return <CartSpinner />;

  const items = data?.items || [];
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-5 border border-red-200 bg-red-50 px-4 py-3 font-sci-body text-sci-label text-red-700"
        >
          {error}
        </p>
      )}
      <CartShell isEmpty={items.length === 0} subtotal={subtotal}>
        {items.map((item) => (
          <ServerCartRow
            key={item.id}
            item={item}
            onUpdateQuantity={(quantity) => updateQuantity.mutate({ id: item.id, quantity })}
            onRemove={() => removeItem.mutate(item.id)}
          />
        ))}
      </CartShell>
    </>
  );
}

function ServerCartRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: ServerCartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const productName = item.variant.product?.name || 'this item';

  return (
    <>
      <CartRow
        href={`/products/${item.variant.product?.slug}`}
        imageUrl={item.variant.imageUrl || item.variant.product?.imageUrl || null}
        productName={productName}
        meta={`${item.variant.label} · ${item.variant.sku}`}
        quantity={item.quantity}
        lineTotal={Number(item.price) * item.quantity}
        onDecrement={() => {
          if (item.quantity <= 1) {
            setConfirmingRemove(true);
            return;
          }
          onUpdateQuantity(item.quantity - 1);
        }}
        onIncrement={() => onUpdateQuantity(item.quantity + 1)}
        onRemove={onRemove}
      />

      {confirmingRemove && (
        <RemoveItemConfirm
          itemName={productName}
          onCancel={() => setConfirmingRemove(false)}
          onConfirm={() => {
            onRemove();
            setConfirmingRemove(false);
          }}
        />
      )}
    </>
  );
}

function CartSpinner() {
  return (
    <div className="flex justify-center py-24" aria-busy="true">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
    </div>
  );
}

function CartShell({
  children,
  isEmpty,
  subtotal,
}: {
  children: React.ReactNode;
  isEmpty: boolean;
  subtotal: number;
}) {
  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-sci-border py-20 text-center">
        <p className="font-sci-body text-sci-body text-sci-muted">Your cart is empty.</p>
        <Link
          href="/products"
          className="mt-4 inline-block font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
        >
          Browse the catalog →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-sci-border bg-white px-6">{children}</div>

      {/* Sticky on desktop: with a long cart the checkout button would
          otherwise be somewhere above the fold you have scrolled past. */}
      <div className="h-fit rounded-xl border border-sci-border bg-sci-pale p-6 xl:sticky xl:top-6">
        <h2 className="font-sci-heading text-[17px] font-semibold text-sci-navy">Order summary</h2>

        <div className="mt-4 flex items-baseline justify-between border-t border-sci-border pt-4">
          <span className="font-sci-body text-sci-body text-sci-muted">Subtotal</span>
          <span className="font-sci-heading text-[22px] font-semibold text-sci-navy">
            {formatUsd(subtotal)}
          </span>
        </div>

        <p className="mt-2 font-sci-body text-sci-label text-sci-muted">
          Shipping and taxes calculated at checkout.
        </p>

        <Link
          href="/checkout"
          className="mt-6 block rounded-md bg-sci-accent px-6 py-4 text-center font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95"
        >
          Proceed to checkout →
        </Link>

        <Link
          href="/products"
          className="mt-3 block text-center font-sci-body text-sci-label font-medium text-sci-blue hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthed(!!getCustomerToken());
  }, []);

  return (
    <>
      <section className="bg-sci-pale py-12">
        <Container className="flex flex-col gap-4">
          <Eyebrow>Cart</Eyebrow>
          <h1 className="font-sci-heading text-[40px] font-semibold leading-[48px] text-sci-navy md:text-[56px] md:leading-[64px]">
            Your cart
          </h1>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          {/* The sign-in check needs localStorage, so the first render can't
              know which cart to show. Rendering nothing here let the footer
              paint high and then get pushed down (0.12 CLS). The spinner is
              the same size as the loading state and close to the empty-cart
              box, so whichever arrives, nothing below it moves. */}
          {isAuthed === null ? <CartSpinner /> : isAuthed ? <CustomerCartView /> : <GuestCartView />}
        </Container>
      </section>
    </>
  );
}
