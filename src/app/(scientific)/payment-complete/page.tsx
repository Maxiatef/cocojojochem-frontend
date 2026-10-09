import { permanentRedirect } from 'next/navigation';

/**
 * The reference site's return page after payment. Our Stripe checkout returns
 * to /checkout/success, so this address only forwards there — anyone holding
 * the reference's link still lands on the payment confirmation.
 */
export default function PaymentCompletePage() {
  permanentRedirect('/checkout/success');
}
