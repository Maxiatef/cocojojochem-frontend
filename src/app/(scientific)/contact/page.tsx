'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { customerApi } from '@/lib/customerApi';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { CheckCircleIcon, GlobeIcon, MailIcon, PhoneIcon } from '@/components/icons';
import { Container, Eyebrow, SciButton, SectionHeading } from '@/components/scientific/primitives';
import { FollowUs } from '@/components/scientific/FollowUs';
import { HeroMedia } from '@/components/scientific/HeroMedia';
import { HERO_IMAGES } from '@/lib/heroImages';

/**
 * Contact, rebuilt to the "Scientific edition" design
 * (Figma rj57PsDgSsbo86iG4RC1SA, nodes 16:318 desktop / 16:319 mobile).
 *
 * The form is untouched in substance — same fields, same validation, same
 * `POST /wholesale/contact-messages`, same consent checkbox. Everything around
 * it is the design's: the pale introduction and the three inquiry-topic cards.
 *
 * The design has no form at all; its three "Start this inquiry →" cards are
 * dead ends in a prototype. Here they do something real — each one fills in
 * the subject line and moves focus to the message field, so choosing a topic
 * actually starts the inquiry it names.
 *
 * The design's navy "a few details make a better brief" panel (19:482) and the
 * external cocojojo.com link below it were dropped at the client's request.
 * The checklist that panel carried survives as the message field's
 * placeholder, which is where it is actually useful anyway.
 */

/**
 * The contact details, matching the ones published on the retail site.
 *
 * A line may be marked `strong` to render in the navy body colour rather than
 * the muted one — the address card needs "Locations:" to read as a label for
 * the regions under it, and a second heading level inside a card would be a
 * lie about the document outline.
 */
const INFO_CARDS: {
  icon: (props: { className?: string }) => React.ReactElement;
  title: string;
  lines: (string | { text: string; strong?: true })[];
}[] = [
  {
    icon: PhoneIcon,
    title: 'Call Us',
    lines: [
      { text: '(+1) 949-610-7164', strong: true },
      'Monday - Friday, 9:00 AM - 6:00 PM PST',
    ],
  },
  {
    icon: MailIcon,
    title: 'Email Address',
    lines: [{ text: 'support@cocojojo.com', strong: true }, "Typically, we'll respond within 24 hours. In fact, most replies arrive even sooner."],
  },
  {
    icon: GlobeIcon,
    title: 'Our Locations',
    lines: [
      { text: 'Locations:', strong: true },
      'USA, EUROPE, ASIA, AFRICA',
      'California, United States',
    ],
  },
];

/** The design's three inquiry topics (19:469), wired to the form below. */
const TOPICS = [
  {
    title: 'Ingredient sourcing',
    body: 'For example, request a quote for a named ingredient, grade and volume. Importantly, specify your required pack size and delivery timeline. Furthermore, include your estimated annual volume.',
    subject: 'Ingredient sourcing enquiry',
  },
  {
    title: 'Project development',
    body: 'In addition, share a formulation, private label or manufacturing brief. Moreover, tell us about your production goals and specifications. Similarly, describe your timeline and regulatory requirements.',
    subject: 'Project development enquiry',
  },
  {
    title: 'Documentation',
    body: 'Additionally, request an SDS, TDS or batch-specific COA. Finally, specify the exact material and lot number you need. Also, include any certification or compliance standards required.',
    subject: 'Documentation request',
  },
];

const FIELD_CLASS =
  'w-full border border-sci-border bg-white p-4 font-sci-body text-sci-body text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="font-sci-body text-sci-label font-medium text-sci-navy">{children}</span>;
}

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const messageRef = useRef<HTMLTextAreaElement>(null);

  function startInquiry(topicSubject: string) {
    setSubject(topicSubject);
    // Focus rather than just scroll: the subject is filled in, so the next
    // thing to type is the message itself.
    messageRef.current?.focus();
    messageRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to send your message.');
      return;
    }
    setStatus('loading');
    try {
      await customerApi.post('/wholesale/contact-messages', {
        fullName,
        email,
        phone: phone || undefined,
        subject,
        message,
      });
      setStatus('done');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      setStatus('idle');
    }
  }

  return (
    <>
      {/* Page introduction — 19:463, reversed onto navy. The eyebrow goes teal
          rather than blue: sci-blue on sci-navy is too close in value to read
          as a separate element. */}
      <section className="relative isolate overflow-hidden bg-sci-navy py-16 text-white">
        <HeroMedia
          src={HERO_IMAGES.contact.src}
          alt={HERO_IMAGES.contact.alt}
          tone="dark"
          priority
        />
        <Container className="flex flex-col gap-6">
          <Eyebrow tone="accent">Let’s talk chemistry</Eyebrow>
          <h1 className="max-w-[1150px] font-sci-heading text-[40px] font-semibold leading-[48px] md:text-[64px] md:leading-[72px]">
            Tell us what you’re making.
          </h1>
          <p className="max-w-[940px] font-sci-body text-sci-body text-[#adc6d8]">
            For wholesale ingredient sourcing inquiries, first share your ingredient, application, destination and volume. Subsequently, we’ll help you prepare a
            clear sourcing or project inquiry.
          </p>
        </Container>
      </section>

      {/* Page content — 19:467 */}
      <section className="bg-white py-16">
        <Container className="flex flex-col gap-10">
          <SectionHeading>Wholesale Ingredient Sourcing Inquiry Types</SectionHeading>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TOPICS.map((topic) => (
              <div key={topic.title} className="flex flex-col gap-6 bg-sci-pale p-8">
                <h3 className="font-sci-heading text-sci-subheading font-semibold text-sci-navy">
                  {topic.title}
                </h3>
                <p className="font-sci-body text-sci-body text-sci-muted">{topic.body}</p>
                <button
                  type="button"
                  onClick={() => startInquiry(topic.subject)}
                  className="group mt-auto inline-flex w-fit items-center gap-2 font-sci-body text-sci-label font-medium text-sci-blue"
                >
                  Start this inquiry
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* The form itself. Not in the design, which stops at the topic cards —
          but it is the actual point of the page, so it keeps its own section. */}
      <section className="bg-sci-pale py-16">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div className="bg-white p-8 md:p-10">
            <h2 className="font-sci-heading text-[28px] font-semibold leading-[36px] text-sci-navy">
              Send Your Wholesale Ingredient Sourcing Inquiry
            </h2>
            <p className="mt-3 font-sci-body text-sci-body text-sci-muted">
              In brief, we reply by email within one business day. Consequently, you'll hear back quickly with next steps and recommendations. Indeed, our team reads every message carefully.
            </p>

            {status === 'done' ? (
              <div className="mt-6 flex items-center gap-3 border border-sci-border bg-sci-pale px-5 py-4 font-sci-body text-sci-body text-sci-navy">
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-sci-blue" />
                Thanks — your message has been sent. Promptly, we&rsquo;ll get back to you within 1 business
                day. Meanwhile, our team is reviewing your request. Specifically, we&rsquo;ll confirm receipt and outline next steps.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <FieldLabel>Name *</FieldLabel>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className={FIELD_CLASS}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <FieldLabel>Email *</FieldLabel>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={FIELD_CLASS}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <FieldLabel>Phone</FieldLabel>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Where we can reach you"
                    className={FIELD_CLASS}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <FieldLabel>Subject *</FieldLabel>
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this regarding?"
                    className={FIELD_CLASS}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <FieldLabel>Message *</FieldLabel>
                  <textarea
                    ref={messageRef}
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ingredient or project, application, required grade, estimated volume, delivery destination, documentation needs…"
                    className={FIELD_CLASS}
                  />
                </label>

                <label className="flex items-start gap-3 font-sci-body text-sci-label text-sci-muted">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-sci-border text-sci-blue focus:ring-sci-blue"
                  />
                  <span>
                    I agree to the{' '}
                    <Link
                      href="/legal/terms-of-service"
                      target="_blank"
                      className="font-medium text-sci-blue hover:underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/legal/privacy-policy"
                      target="_blank"
                      className="font-medium text-sci-blue hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {error && (
                  <p className="border border-red-200 bg-red-50 px-4 py-3 font-sci-body text-sci-label text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !agreed}
                  className="inline-flex w-full items-center justify-center rounded-md bg-sci-accent px-6 py-4 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95 disabled:opacity-60 sm:w-auto"
                >
                  {status === 'loading' ? 'Sending…' : 'Submit message →'}
                </button>

                <p className="font-sci-body text-sci-label text-sci-muted">
                  By submitting this form, you agree to our Privacy Policy. Furthermore, we will never share
                  your information with third parties. Essentially, your data is secure and used only to respond to your inquiry. As a result, you can share freely without concern.
                </p>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {INFO_CARDS.map((card) => (
              <div key={card.title} className="flex flex-col gap-3 border border-sci-border bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sci-pale text-sci-blue">
                  <card.icon className="h-5 w-5" />
                </span>
                <h3 className="font-sci-body text-[17px] font-medium leading-6 text-sci-navy">
                  {card.title}
                </h3>
                <div className="flex flex-col gap-0.5">
                  {card.lines.map((line) => {
                    const text = typeof line === 'string' ? line : line.text;
                    const strong = typeof line !== 'string' && line.strong;
                    // A phone number and an email address on a contact page
                    // exist to be acted on — on a phone especially, a tel:
                    // link is the difference between one tap and retyping.
                    const href = text.includes('@')
                      ? `mailto:${text}`
                      : text.startsWith('(+')
                        ? `tel:${text.replace(/[^+\d]/g, '')}`
                        : null;

                    const className = `font-sci-body text-sci-label ${
                      strong ? 'font-medium text-sci-navy' : 'text-sci-muted'
                    }`;

                    return (
                      <p key={text} className={className}>
                        {href ? (
                          <a href={href} className="transition hover:text-sci-blue">
                            {text}
                          </a>
                        ) : (
                          text
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}

            <FollowUs />
          </div>
        </Container>
      </section>

      {/* Contact / Request a quote — 19:488 */}
      <section className="bg-white py-16">
        <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-6">
            <Eyebrow>Let’s move your next idea forward</Eyebrow>
            <p className="font-sci-heading text-[32px] font-semibold leading-[40px] text-sci-navy md:text-sci-heading">
              The next great formula
              <br />
              starts with a conversation.
            </p>
            <p className="font-sci-body text-sci-body text-sci-muted max-w-[500px]">
              Ready to discuss your project? Meanwhile, explore detailed product specifications. Eventually, we’ll help scale your formula from concept to production.
            </p>
          </div>
          <SciButton href="/quote-request" className="shrink-0">
            Request a quote →
          </SciButton>
        </Container>
      </section>
    </>
  );
}
