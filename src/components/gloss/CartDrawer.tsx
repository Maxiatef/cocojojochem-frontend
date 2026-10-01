'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useUnifiedCart } from '@/lib/gloss/useUnifiedCart';
import { CartLines, CartTotals } from './CartLines';

/**
 * The prototype's slide-in cart (`r-drawer`). Opened from the header's Cart
 * button and after every "Add to cart". Escape and the backdrop close it, and
 * focus is trapped inside while it is open.
 */
export function CartDrawer({ close }: { close: () => void }) {
  const cart = useUnifiedCart();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab') return;
      const nodes = ref.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled)');
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!ref.current?.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [close]);

  return (
    <div
      className="r-drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="r-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-heading" ref={ref}>
        <div className="r-drawer-head">
          <h2 id="cart-heading">
            Your shopping cart <span>{cart.count}</span>
          </h2>
          <button className="r-icon-button" onClick={close} aria-label="Close cart">
            <X />
          </button>
        </div>
        <div className="r-drawer-body">
          <CartLines />
        </div>
        {cart.lines.length > 0 && (
          <div className="r-drawer-foot">
            <CartTotals />
            <button
              className="r-btn r-primary"
              disabled={cart.saving}
              onClick={() => {
                close();
                router.push('/cart');
              }}
            >
              Review cart
            </button>
            <button className="r-text-button" onClick={close}>
              Continue shopping
            </button>
            {cart.saving && <small role="status">Saving cart…</small>}
          </div>
        )}
      </div>
    </div>
  );
}
