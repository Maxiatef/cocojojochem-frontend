'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { customerApi } from '@/lib/customerApi';
import { ApiError } from '@/lib/api';
import { Order } from '@/lib/types';
import { useToast } from '@/components/ui';

/**
 * Puts every line of a past order back in the cart at its original quantity.
 * Shared by the account overview and the orders page so both behave the same.
 */
export function ReorderButton({ order }: { order: Order }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handleReorder() {
    setBusy(true);
    const added: string[] = [];
    const skipped: string[] = [];

    for (const item of order.items) {
      if (!item.productVariantId) {
        skipped.push(`${item.productName} (${item.sku}) is no longer available`);
        continue;
      }
      try {
        await customerApi.post('/cart/items', {
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        });
        added.push(item.productName);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'could not be added';
        skipped.push(`${item.productName} (${item.sku}) — ${message}`);
      }
    }

    setBusy(false);

    if (added.length > 0) {
      window.dispatchEvent(new Event('cocojojochem-server-cart-changed'));
      toast.success(
        `${added.length} item${added.length === 1 ? '' : 's'} added to cart${skipped.length ? '' : '.'}`,
      );
    }
    if (skipped.length > 0) {
      toast.error(`Skipped: ${skipped.join('; ')}`);
    }
    if (added.length === 0 && skipped.length === 0) {
      toast.error('This order has no items to reorder.');
    }
  }

  return (
    <button type="button" onClick={handleReorder} disabled={busy} className="r-btn r-outline">
      <RotateCcw size={15} aria-hidden />
      {busy ? 'Adding to cart…' : 'Reorder'}
    </button>
  );
}
