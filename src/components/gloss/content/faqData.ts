/**
 * Questions and answers for /faq and /shipping-returns.
 *
 * Every answer is written from OUR policies and code, not the prototype's:
 *  - shipping, returns, cancellations: `@/lib/legalPolicies` (shipping-policy,
 *    refund-policy), which is the text the /legal pages publish;
 *  - checkout facts (address-based shipping and tax, wholesale minimum,
 *    US-only online checkout, guest checkout with optional account, Stripe
 *    hosted payment): `src/app/(scientific)/checkout/page.tsx`.
 *
 * `answer` is plain text because it also feeds the FAQPage JSON-LD, which must
 * match what the page shows. A `link` is rendered after the text on the page.
 */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  link?: { href: string; label: string };
};

export const FAQ: Record<string, FaqItem> = {
  order: {
    id: 'order',
    question: 'How do I place an order?',
    answer:
      'Choose an ingredient and pack size, add it to your cart and go to checkout. Shipping and any applicable tax are calculated from your delivery address at checkout, and payment is taken on Stripe’s secure hosted checkout page.',
    link: { href: '/products', label: 'Browse ingredients' },
  },
  minimum: {
    id: 'minimum',
    question: 'Is there a minimum order?',
    answer:
      'Yes. Online orders are subject to a wholesale minimum order value. If your cart is below it, checkout shows how much more you need to add before shipping and tax are applied.',
  },
  bulk: {
    id: 'bulk',
    question: 'How do I get pricing for bulk quantities?',
    answer:
      'Add ingredients to your quote list and send a quote request with the quantities and pack sizes you need. Our team replies with trade pricing and lead times, usually within one business day.',
    link: { href: '/quote-request', label: 'Open your quote list' },
  },
  size: {
    id: 'size',
    question: 'Can I request a size that isn’t listed?',
    answer:
      'Yes. Ingredients are sold in the pack sizes listed on each ingredient page. For a different amount, add the ingredient to your quote list or contact us with the quantity you need. Availability and pricing are confirmed individually.',
    link: { href: '/contact?subject=Custom%20pack%20size', label: 'Ask about a pack size' },
  },
  documents: {
    id: 'documents',
    question: 'Where can I find an SDS or certificate of analysis?',
    answer:
      'Where we have published them, documents such as the SDS, COA and technical data sheet are listed on the ingredient page. For a document that isn’t shown there, or a batch-specific COA for material you have purchased, contact us with the product and lot number.',
    link: { href: '/contact?subject=Documentation%20request', label: 'Request a document' },
  },
  payment: {
    id: 'payment',
    question: 'How is payment handled?',
    answer:
      'Card payments are processed on Stripe’s secure hosted checkout. Your full card number is entered with Stripe and is not stored by this site.',
  },
  account: {
    id: 'account',
    question: 'Do I need an account to order?',
    answer:
      'No. You can check out as a guest and choose to create an account at checkout. With an account you can review your orders and keep a wishlist.',
    link: { href: '/account/register', label: 'Create an account' },
  },
  shipping: {
    id: 'shipping',
    question: 'How does shipping work?',
    answer:
      'Shipping cost is calculated from your delivery address and order at checkout. Under our Shipping Policy, orders generally take 2–4 business days to process and 7–14 business days in transit. Holidays and high-volume periods can add time.',
    link: { href: '/legal/shipping-policy', label: 'Read the Shipping Policy' },
  },
  international: {
    id: 'international',
    question: 'Do you ship internationally?',
    answer:
      'Online checkout currently ships to addresses in the United States. For international or large-quantity orders, contact us for a custom shipping quote. International customers are responsible for customs duties, import taxes, brokerage fees and destination-country requirements.',
    link: {
      href: '/contact?subject=International%20shipping%20quote',
      label: 'Request an international quote',
    },
  },
  signature: {
    id: 'signature',
    question: 'Can I get signature confirmation?',
    answer:
      'Yes. Add a note when you place your order to request it. On orders of $600 or more, signature confirmation may be applied automatically.',
  },
  lost: {
    id: 'lost',
    question: 'What if my package is lost or stolen?',
    answer:
      'If a package is lost or stolen after the carrier marks it delivered, file a claim with the carrier directly. Contact us with your order number and we will assist where reasonably possible.',
  },
  returns: {
    id: 'returns',
    question: 'How do returns work?',
    answer:
      'Contact support@cocojojo.com within 30 days. If we cannot resolve the issue, we may provide return instructions and a return authorization. Products must be unused and in their original packaging, shipping fees are not refunded, and a restocking fee of up to 15% may apply. Custom, special and private label orders cannot be returned unless defective.',
    link: { href: '/legal/refund-policy', label: 'Read the Refund Policy' },
  },
  cancel: {
    id: 'cancel',
    question: 'Can I change or cancel my order?',
    answer:
      'Orders are processed quickly, so a confirmed order may not be changeable or cancellable. Contact us as soon as possible with your order number. Once an order has shipped, the shipping address cannot be changed.',
  },
  pictures: {
    id: 'pictures',
    question: 'Are the pictures photographs of the supplied batch?',
    answer:
      'No. Category and ingredient texture images are representative illustrations. They do not establish the appearance, packaging or grade of a supplied batch.',
  },
  calculator: {
    id: 'calculator',
    question: 'What does the batch calculator do?',
    answer:
      'It converts your formula percentages into ingredient weights. It does not validate safety, compatibility, preservation or performance.',
    link: { href: '/formulation-tools', label: 'Open the batch calculator' },
  },
};

/** Everything on /faq, in reading order. */
export const FAQ_PAGE_ITEMS: FaqItem[] = [
  FAQ.order,
  FAQ.minimum,
  FAQ.bulk,
  FAQ.size,
  FAQ.documents,
  FAQ.payment,
  FAQ.account,
  FAQ.shipping,
  FAQ.international,
  FAQ.returns,
  FAQ.cancel,
  FAQ.pictures,
  FAQ.calculator,
];

/** The ordering, delivery and returns subset on /shipping-returns. */
export const SHIPPING_PAGE_ITEMS: FaqItem[] = [
  FAQ.order,
  FAQ.minimum,
  FAQ.shipping,
  FAQ.international,
  FAQ.signature,
  FAQ.lost,
  FAQ.returns,
  FAQ.cancel,
];
