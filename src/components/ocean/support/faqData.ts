/**
 * Questions and answers for /faq and /shipping-returns, in the reference's
 * order and tone ("Your questions, answered.").
 *
 * The reference describes an "order request" flow where the store confirms
 * every price. Ours differs, so the answers are rewritten from OUR facts:
 *  - priced items are "Ready to pay" and paid on Stripe's hosted checkout;
 *  - unpriced sizes ("Request a size") and supplier references join the cart
 *    under "Price to confirm" and are quoted by our team;
 *  - shipping / returns / cancellation: `@/lib/legalPolicies` (the /legal pages);
 *  - wholesale minimum, US-only online checkout, guest checkout:
 *    `src/app/(scientific)/checkout/page.tsx`.
 *
 * `answer` is plain text because it also feeds the FAQPage JSON-LD, which must
 * match what the page shows.
 */

export type SupportFaqItem = { id: string; question: string; answer: string };

const FAQ = {
  order: {
    id: 'order',
    question: 'How do I place an order?',
    answer:
      'Add ingredients and preferred sizes to your cart. Items with a listed price are ready to pay: checkout calculates shipping and any applicable tax from your delivery address, and payment is taken on Stripe’s secure hosted checkout. Items marked “Price to confirm” are sent from the same checkout as a request; our team confirms pricing and availability before you pay for them.',
  },
  library: {
    id: 'library',
    question: 'Are all library ingredients stocked by COCOJOJO?',
    answer:
      'No. The A–Z library includes externally sourced catalog references, identified by supplier. Public coverage varies by source. Add a reference to your cart and it joins “Price to confirm”, so our team can confirm whether we can source the ingredient and grade you need.',
  },
  minimum: {
    id: 'minimum',
    question: 'Is there a minimum order?',
    answer:
      'Yes. Online orders are subject to a wholesale minimum order value. If your cart is below it, checkout shows how much more you need to add before shipping and tax are applied.',
  },
  size: {
    id: 'size',
    question: 'Can I request a small quantity?',
    answer:
      'Yes. Use “Request a size” on an ingredient page and enter your preferred amount. It joins your cart under “Price to confirm”. Pack sizes and minimum quantities are confirmed individually.',
  },
  payment: {
    id: 'payment',
    question: 'How is payment handled?',
    answer:
      'Card payments are processed on Stripe’s secure hosted checkout. Your full card number is entered with Stripe and is not stored by this site. No payment is taken for items marked “Price to confirm” until their price is agreed.',
  },
  account: {
    id: 'account',
    question: 'Do I need an account to order?',
    answer:
      'No. You can check out as a guest and choose to create an account at checkout. With an account you can review your orders and requests and keep a wishlist.',
  },
  documents: {
    id: 'documents',
    question: 'Where can I find an SDS or certificate of analysis?',
    answer:
      'Where we have published them, documents such as the SDS, COA and technical data sheet are listed on the ingredient page. For a document that isn’t shown there, or a batch-specific COA for material you have purchased, contact us with the product and lot number.',
  },
  shipping: {
    id: 'shipping',
    question: 'How does shipping work?',
    answer:
      'Shipping cost is calculated from your delivery address and order at checkout. Our shipping policy generally allows 2–4 business days for processing and estimates 7–14 business days in transit. Holidays and high-volume periods can add time.',
  },
  international: {
    id: 'international',
    question: 'Do you ship internationally?',
    answer:
      'Online checkout currently ships to addresses in the United States. For international or large-quantity orders, contact us for a custom shipping quote. International customers are responsible for customs duties, import taxes, brokerage fees and destination-country requirements.',
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
      'Contact support@cocojojo.com within 30 days. If we cannot resolve the issue, we may provide return instructions and a return authorization. Products must be unused and in their original packaging, shipping fees are not refunded, and a restocking fee of up to 15% may apply. Custom, special and private label orders cannot be returned unless defective. Read the full policy before ordering.',
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
      'Category and ingredient texture images are representative illustrations. They do not establish the appearance, packaging or grade of a supplied batch.',
  },
  tools: {
    id: 'tools',
    question: 'What do the formulation tools do?',
    answer:
      'Use the batch worksheet and calculators for scaling, concentrations, emulsions, laboratory math, production and quality planning. Calculations use your inputs and do not validate safety, preservation or finished-product performance.',
  },
} satisfies Record<string, SupportFaqItem>;

/** Everything on /faq, in the reference's reading order plus our extra facts. */
export const FAQ_PAGE_ITEMS: SupportFaqItem[] = [
  FAQ.order,
  FAQ.library,
  FAQ.minimum,
  FAQ.size,
  FAQ.payment,
  FAQ.account,
  FAQ.documents,
  FAQ.shipping,
  FAQ.international,
  FAQ.returns,
  FAQ.cancel,
  FAQ.pictures,
  FAQ.tools,
];

/** The ordering, delivery and returns subset on /shipping-returns. */
export const SHIPPING_PAGE_ITEMS: SupportFaqItem[] = [
  FAQ.order,
  FAQ.size,
  FAQ.minimum,
  FAQ.shipping,
  FAQ.international,
  FAQ.signature,
  FAQ.lost,
  FAQ.returns,
  FAQ.cancel,
];
