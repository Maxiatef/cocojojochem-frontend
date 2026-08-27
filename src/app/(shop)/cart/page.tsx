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

// Small storefront-styled confirm popup (not a native browser alert) used
// whenever decrementing a line item's quantity would take it to zero.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-xs bg-white p-5 shadow-xl">
        <p className="text-sm text-ink">
          Remove <span className="font-semibold">{itemName}</span> from your cart?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="border border-sand-300 px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function GuestCartView() {
  const cart = useCart();

  return (
    <CartShell
      isEmpty={cart.items.length === 0}
      subtotal={cart.subtotal}
      checkoutHref="/checkout"
      checkoutLabel="Proceed to Checkout"
    >
      {cart.items.map((item) => (
        <GuestCartRow key={item.variantId} item={item} onUpdate={cart.updateQuantity} onRemove={cart.remove} />
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
  onUpdate: (variantId: number, quantity: number) => void;
  onRemove: (variantId: number) => void;
}) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  return (
    <div className="flex items-center gap-4 border-b border-sand-200 py-4 last:border-0">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-sand-100">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholderIcon className="h-6 w-6 text-sand-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${item.productSlug}`} className="truncate font-medium text-ink hover:text-olive-700">
          {item.productName}
        </Link>
        <p className="text-xs text-ink-soft">{item.variantLabel} · {item.sku}</p>
      </div>
      <div className="flex items-center border border-sand-300">
        <button
          onClick={() => {
            if (item.quantity <= 1) {
              setConfirmingRemove(true);
              return;
            }
            onUpdate(item.variantId, item.quantity - 1);
          }}
          className="px-2.5 py-1.5 text-ink-soft"
        >
          −
        </button>
        <span className="w-8 text-center text-sm text-ink">{item.quantity}</span>
        <button onClick={() => onUpdate(item.variantId, item.quantity + 1)} className="px-2.5 py-1.5 text-ink-soft">+</button>
      </div>
      <p className="w-20 text-right text-sm font-semibold text-ink">{formatUsd(item.price * item.quantity)}</p>
      <button onClick={() => onRemove(item.variantId)} className="text-ink-soft hover:text-red-600">
        <CloseIcon className="h-4 w-4" />
      </button>

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
    </div>
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
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      customerApi.patch(`/cart/items/${id}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-cart'] });
      window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: (id: number) => customerApi.delete(`/cart/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-cart'] });
      window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  const items = data?.items || [];
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}
      <CartShell isEmpty={items.length === 0} subtotal={subtotal} checkoutHref="/checkout" checkoutLabel="Proceed to checkout">
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
    <div className="flex items-center gap-4 border-b border-sand-200 py-4 last:border-0">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-sand-100">
        {item.variant.imageUrl || item.variant.product?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.variant.imageUrl || item.variant.product?.imageUrl || ''}
            alt={productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholderIcon className="h-6 w-6 text-sand-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${item.variant.product?.slug}`}
          className="truncate font-medium text-ink hover:text-olive-700"
        >
          {productName}
        </Link>
        <p className="text-xs text-ink-soft">{item.variant.label} · {item.variant.sku}</p>
      </div>
      <div className="flex items-center border border-sand-300">
        <button
          onClick={() => {
            if (item.quantity <= 1) {
              setConfirmingRemove(true);
              return;
            }
            onUpdateQuantity(item.quantity - 1);
          }}
          className="px-2.5 py-1.5 text-ink-soft"
        >
          −
        </button>
        <span className="w-8 text-center text-sm text-ink">{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.quantity + 1)} className="px-2.5 py-1.5 text-ink-soft">
          +
        </button>
      </div>
      <p className="w-20 text-right text-sm font-semibold text-ink">
        {formatUsd(Number(item.price) * item.quantity)}
      </p>
      <button onClick={onRemove} className="text-ink-soft hover:text-red-600">
        <CloseIcon className="h-4 w-4" />
      </button>

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
    </div>
  );
}

function CartShell({
  children,
  isEmpty,
  subtotal,
  checkoutHref,
  checkoutLabel,
}: {
  children: React.ReactNode;
  isEmpty: boolean;
  subtotal: number;
  checkoutHref: string;
  checkoutLabel: string;
}) {
  if (isEmpty) {
    return (
      <div className="border border-dashed border-sand-300 py-20 text-center">
        <p className="text-sm text-ink-soft">Your cart is empty.</p>
        <Link href="/products" className="mt-3 inline-block font-medium text-olive-700 hover:underline">
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
      <div className="bg-white px-5">{children}</div>
      <div className="h-fit bg-white p-5">
        <div className="flex justify-between text-sm text-ink-soft">
          <span>Subtotal</span>
          <span className="font-semibold text-ink">{formatUsd(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-soft/70">Shipping and taxes calculated at checkout.</p>
        <Link
          href={checkoutHref}
          className="mt-4 block bg-olive-800 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-olive-700"
        >
          {checkoutLabel}
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
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Cart</p>
      <h1 className="mb-8 mt-1 font-display text-4xl text-ink">Your Cart</h1>
      {isAuthed === null ? null : isAuthed ? <CustomerCartView /> : <GuestCartView />}
    </div>
  );
}
