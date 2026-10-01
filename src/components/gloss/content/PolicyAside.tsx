import Link from 'next/link';
import { Package } from 'lucide-react';

/**
 * "Read the complete policies." — the prototype's `r-reading-aside` beside the
 * FAQ. The prototype linked out to cocojojo.com; our policies are published
 * on this site under /legal, so the links stay here.
 */
export function PolicyAside() {
  return (
    <aside className="r-reading-aside">
      <Package size={28} aria-hidden="true" />
      <h3>Read the complete policies.</h3>
      <p>
        These summaries do not replace the full policies. Your order confirmation and any written
        quote set out order-specific details.
      </p>
      <Link href="/legal/shipping-policy">Shipping policy</Link>
      <Link href="/legal/refund-policy">Refund policy</Link>
      <Link href="/legal/terms-of-purchase-and-sale">Terms of purchase &amp; sale</Link>
      <Link href="/contact">Contact customer support</Link>
    </aside>
  );
}
