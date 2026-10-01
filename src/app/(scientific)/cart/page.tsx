import type { Metadata } from 'next';
import { CartView } from '@/components/gloss/workspace/CartView';

// robots noindex comes from ./layout.tsx.
export const metadata: Metadata = { title: 'Your Shopping Cart' };

/**
 * The cart, in the Gloss Studio design. Guest vs signed-in carts are handled
 * by `useUnifiedCart` (localStorage vs the server `/cart`), and both go on to
 * /checkout exactly as before.
 */
export default function CartPage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Your ingredient collection</span>
        <h1>Your shopping cart.</h1>
        <p>Review your selections, pack sizes and quantities.</p>
      </div>
      <section className="r-wrap r-section">
        <CartView />
      </section>
    </>
  );
}
