'use client';

import { useState } from 'react';
import { useWishlistState } from '@/lib/useWishlistState';
import { HeartIcon } from '@/components/icons';
import { useToast } from '@/components/ui';

/**
 * The save toggle.
 *
 * `icon` sits in the corner of a product tile; `labelled` goes on the product
 * page, where there is room to say what it does — a bare heart beside a price
 * and a buy button is easy to read as "favourite this brand" or a rating.
 */
export function WishlistButton({
  productId,
  variant = 'icon',
  className = '',
}: {
  productId: number;
  variant?: 'icon' | 'labelled';
  className?: string;
}) {
  const { has, toggle } = useWishlistState();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const saved = has(productId);

  async function onClick(e: React.MouseEvent) {
    // Tiles are links; without this, saving also navigates.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const nowSaved = await toggle(productId);
      // Confirmed after the toggle resolves, using its result rather than the
      // pre-click state: on a signed-in account the write can fail, and a
      // toast that says "Saved" over a heart that snapped back would be a
      // lie. Removal is confirmed too — undoing something silently leaves
      // people wondering whether the click registered at all.
      toast.show(
        nowSaved ? 'Saved to your list' : 'Removed from your list',
        nowSaved ? 'success' : 'info',
      );
    } catch {
      toast.show('Could not update your saved list. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  const label = saved ? 'Remove from saved products' : 'Save this product';

  if (variant === 'labelled') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 font-sci-body text-sci-label font-medium transition disabled:opacity-60 ${
          saved
            ? 'border-sci-blue bg-sci-pale text-sci-blue'
            : 'border-sci-border bg-white text-sci-navy hover:border-sci-blue hover:text-sci-blue'
        } ${className}`}
        disabled={busy}
      >
        <HeartIcon className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        {saved ? 'Saved' : 'Save product'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      disabled={busy}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-sci-border bg-white/90 backdrop-blur transition hover:border-sci-blue disabled:opacity-60 ${
        saved ? 'text-sci-blue' : 'text-sci-muted hover:text-sci-blue'
      } ${className}`}
    >
      <HeartIcon className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
}
