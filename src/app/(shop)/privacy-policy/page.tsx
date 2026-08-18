import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | CocoJojoChem',
  description: 'How CocoJojoChem collects, uses, and protects your information.',
};

const SECTIONS = [
  {
    heading: '1. Overview',
    body: [
      'This Privacy Policy explains what information CocoJojoChem collects when you use this website or place a wholesale order, how we use it, and the choices available to you. By using this site, you agree to the practices described here.',
    ],
  },
  {
    heading: '2. Information We Collect',
    body: [
      'Account & business information: name, email, phone number, company name, and business details you provide when registering or applying for a wholesale account.',
      'Order information: shipping address, billing details, order contents, and order history.',
      'Guest checkout information: if you check out without an account, we collect the contact and shipping details you provide to fulfill that order.',
      'Usage information: pages visited, products viewed, and general device/browser information, collected automatically to help us operate and improve the site.',
    ],
  },
  {
    heading: '3. How We Use Information',
    body: [
      'We use the information we collect to: process and fulfill orders; verify wholesale eligibility; communicate with you about your account or orders; maintain the security of our systems; and improve our catalog, pricing, and site experience.',
      'We do not sell your personal information to third parties.',
    ],
  },
  {
    heading: '4. Cookies & Similar Technologies',
    body: [
      'We use essential cookies and similar local storage to keep you signed in, remember items in your cart, and understand basic site usage. You can control cookies through your browser settings; disabling them may affect site functionality such as staying logged in or retaining your cart.',
    ],
  },
  {
    heading: '5. How We Share Information',
    body: [
      'We share information only as needed to run the business: with service providers who help us host the site, process orders, or ship products, and when required by law or to protect our rights and the security of our platform.',
      'We do not share your information with third parties for their own marketing purposes.',
    ],
  },
  {
    heading: '6. Data Retention',
    body: [
      'We retain account and order information for as long as your account is active or as needed to comply with legal, tax, and accounting obligations, resolve disputes, and enforce our agreements.',
    ],
  },
  {
    heading: '7. Your Rights & Choices',
    body: [
      'You may review and update your account information at any time by signing in. You may also contact us to request access to, correction of, or deletion of your personal information, subject to our legitimate business and legal recordkeeping needs.',
    ],
  },
  {
    heading: '8. Data Security',
    body: [
      'We use reasonable administrative and technical safeguards designed to protect your information, including encrypted password storage and access controls on internal systems. No method of storage or transmission is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '9. Children\'s Privacy',
    body: [
      'This site is intended for business use by adults and is not directed to children. We do not knowingly collect personal information from children.',
    ],
  },
  {
    heading: '10. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Material changes will be reflected by updating the date at the top of this page.',
    ],
  },
  {
    heading: '11. Contact Us',
    body: [
      'Questions about this Privacy Policy or how your information is handled can be sent to our support team through the contact details provided on this site.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Privacy Policy</h1>
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
        <Link href="/terms-of-service" className="text-olive-700 hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
