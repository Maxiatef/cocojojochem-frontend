'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useConsent, writeConsent } from '@/lib/consent';

/**
 * The storage notice.
 *
 * A docked card rather than the usual full-width dark bar: the bar is the
 * default answer to this problem and it fights everything else on these
 * pages — a slab across a light, airy catalogue reads as something bolted
 * on. A card in the corner leaves the catalogue visible, which is also the
 * honest arrangement, since browsing is not gated on answering. Only the
 * optional storage is.
 *
 * Both buttons carry the same weight. A prominent "Accept" beside a faint
 * "Reject" is the pattern regulators act on, and it is a dark pattern
 * whatever the law says — the choice is real, so it should look real.
 *
 * There is deliberately no dismiss control. Closing without choosing would
 * have to mean "no", and something that silently declines on your behalf is
 * worse than asking again on the next visit.
 */
export function ConsentNotice() {
  const consent = useConsent();
  const [expanded, setExpanded] = useState(false);
  // Separate from `consent` so the entrance plays after mount rather than
  // snapping in during hydration.
  const [entered, setEntered] = useState(false);

  // `undefined` means the decision has not been read from storage yet — the
  // notice must not flash at someone who answered it months ago.
  const undecided = consent === null;

  useEffect(() => {
    if (!undecided) return;
    const id = window.setTimeout(() => setEntered(true), 600);
    return () => window.clearTimeout(id);
  }, [undecided]);

  if (!undecided) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-heading"
      aria-describedby="consent-body"
      className={`fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:px-0 sm:pb-0 motion-safe:transition motion-safe:duration-300 motion-safe:ease-out ${
        entered ? 'translate-y-0 opacity-100' : 'motion-safe:translate-y-2 motion-safe:opacity-0'
      }`}
    >
      <div className="w-full rounded-[22px] bg-white p-7 shadow-[0_18px_50px_-18px_rgba(11,41,69,0.45)] sm:w-[440px]">
        <h2
          id="consent-heading"
          className="font-sci-heading text-[26px] font-bold leading-8 tracking-[-0.3px] text-sci-navy"
        >
          Choose your cookies
        </h2>

        <p id="consent-body" className="mt-3 font-sci-body text-[15px] leading-6 text-sci-muted">
          We use cookies and similar browser storage. Some keep your cart working;
          the rest just help us count visits.
        </p>

        {/* "Manage" has to mean something, so this opens the itemised list
            rather than navigating away. With one optional category the two
            buttons below already are the controls — what was missing was
            being told what you are agreeing to. */}
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls="consent-details"
          className="mt-2.5 inline-block font-sci-body text-[15px] text-sci-navy underline underline-offset-[3px] transition hover:text-sci-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-sci-blue focus-visible:ring-offset-2"
        >
          {expanded ? 'Hide details' : 'Learn more and manage'}
        </button>

        {expanded && (
          <dl
            id="consent-details"
            className="mt-4 divide-y divide-sci-border border-y border-sci-border"
          >
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-3 py-3">
              <div>
                <dt className="font-sci-body text-sci-label font-semibold text-sci-navy">
                  Essential
                </dt>
                <dd className="mt-0.5 font-sci-body text-[13px] leading-5 text-sci-muted">
                  Your cart, and this choice.
                </dd>
              </div>
              <span className="whitespace-nowrap font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
                Always on
              </span>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-baseline gap-3 py-3">
              <div>
                <dt className="font-sci-body text-sci-label font-semibold text-sci-navy">
                  Analytics
                </dt>
                <dd className="mt-0.5 font-sci-body text-[13px] leading-5 text-sci-muted">
                  A random ID so we can count unique visits. Not linked to you,
                  your account or your orders.
                </dd>
              </div>
              <span className="whitespace-nowrap font-sci-body text-sci-eyebrow font-semibold uppercase text-sci-muted">
                Optional
              </span>
            </div>

            <p className="py-3 font-sci-body text-[13px] leading-5 text-sci-muted">
              Full detail in the{' '}
              <Link
                href="/legal/cookie-policy"
                className="font-medium text-sci-blue underline-offset-2 hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </dl>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => writeConsent(true)}
            className="rounded-full bg-sci-navy px-5 py-3.5 font-sci-body text-[15px] font-semibold text-white transition hover:bg-sci-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-sci-blue focus-visible:ring-offset-2"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => writeConsent(true)}
            className="rounded-full border border-sci-navy bg-sci-pale px-5 py-3.5 font-sci-body text-[15px] font-semibold text-sci-navy transition hover:bg-sci-border/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sci-blue focus-visible:ring-offset-2"
          >
            Reject non-essential
          </button>
        </div>
      </div>
    </div>
  );
}
