import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | CocoJojoChem',
  description: 'The terms and conditions governing wholesale purchases from CocoJojoChem.',
};

const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    body: [
      'These Terms of Service ("Terms") govern access to and use of the CocoJojoChem website and the purchase of products through our wholesale platform. By creating an account, submitting a wholesale application, placing an order, or otherwise using this site, you agree to be bound by these Terms.',
      'If you do not agree to these Terms, you must not use this site or place an order with CocoJojoChem.',
    ],
  },
  {
    heading: '2. Wholesale Eligibility & Accounts',
    body: [
      'CocoJojoChem sells exclusively to businesses purchasing for resale, formulation, manufacturing, or professional use. This is not a retail or consumer storefront.',
      'New accounts are subject to review before wholesale pricing and ordering privileges are granted. We may request business documentation (such as a resale certificate, business license, or EIN) to verify eligibility, and may approve, reject, or suspend any account at our discretion.',
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
    ],
  },
  {
    heading: '3. Product Information',
    body: [
      'Product descriptions, specifications, and images are provided for general reference. We make reasonable efforts to keep this information accurate and current, but formulations, packaging, and availability may change without notice.',
      'Safety Data Sheets (SDS), Certificates of Analysis (COA), and other technical documentation, where available, are provided to support your own formulation and compliance review. It remains your responsibility to determine whether a given product is suitable, compliant, and safe for your intended use and jurisdiction.',
      'Nothing on this site constitutes medical, cosmetic-safety, or regulatory advice.',
    ],
  },
  {
    heading: '4. Pricing & Payment',
    body: [
      'Wholesale prices are shown per unit/variant at time of order and are subject to change without notice. Prices displayed at checkout are the prices that apply to your order.',
      'Payment terms currently supported on this site are limited to order placement for invoicing; card payment processing may be introduced at a later date and will be clearly presented at checkout when available. Any additional payment terms extended to specific accounts (e.g. net terms) are governed by a separate agreement with that account.',
    ],
  },
  {
    heading: '5. Order Acceptance & Cancellation',
    body: [
      'Submitting an order is an offer to purchase, not a guaranteed acceptance. We reserve the right to refuse, limit, or cancel any order — including for suspected fraud, pricing errors, insufficient stock, or failure to meet wholesale eligibility requirements.',
      'You will be notified if an order is cancelled or modified after submission.',
    ],
  },
  {
    heading: '6. Shipping & Delivery',
    body: [
      'Estimated shipping timelines are provided for convenience only and are not guaranteed. Some products may be subject to additional handling, packaging, or carrier requirements (including hazardous-materials shipping rules) that affect cost or delivery method.',
      'Risk of loss and title for products pass to you upon our delivery to the carrier, unless otherwise agreed in writing.',
    ],
  },
  {
    heading: '7. Returns & Damaged Goods',
    body: [
      'Because many products are sold in bulk and may be custom-portioned, returns are handled on a case-by-case basis. Please contact us promptly if an order arrives damaged, incorrect, or does not match its confirmed specification, so we can investigate and make it right.',
    ],
  },
  {
    heading: '8. Intellectual Property',
    body: [
      'All content on this site — including text, graphics, logos, and product photography — is owned by or licensed to CocoJojoChem and may not be copied, reproduced, or used commercially without prior written permission.',
    ],
  },
  {
    heading: '9. Prohibited Uses',
    body: [
      'You agree not to use this site to violate any applicable law, misrepresent your identity or business, interfere with the site\'s security or operation, or resell products in a manner that violates applicable safety, labeling, or regulatory requirements.',
    ],
  },
  {
    heading: '10. Disclaimer of Warranties & Limitation of Liability',
    body: [
      'Products are sold "as is" and, unless expressly stated in a product\'s technical documentation, without additional warranties beyond those required by law. To the fullest extent permitted by law, CocoJojoChem is not liable for indirect, incidental, or consequential damages arising from the use of products purchased through this site.',
      'Nothing in these Terms limits liability that cannot be limited under applicable law.',
    ],
  },
  {
    heading: '11. Changes to These Terms',
    body: [
      'We may update these Terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised Terms. Material changes affecting active accounts will be communicated where practical.',
    ],
  },
  {
    heading: '12. Contact Us',
    body: [
      'Questions about these Terms can be sent to our support team through the contact details provided on this site.',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-soft">Last updated: August 2026</p>

      <div className="mt-6 space-y-6 text-sm leading-6 text-ink-soft">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 font-display text-lg text-ink">{section.heading}</h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className="mb-2">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-sand-200 pt-6 text-xs text-ink-soft/70">
        See also our{' '}
        <Link href="/privacy-policy" className="text-olive-700 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
