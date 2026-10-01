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
      className={`ga-consent${entered ? '' : ' is-pending'}`}
    >
      <div className="ga-consent-card r-glass">
        <span className="r-eyebrow">Your privacy</span>
        <h2 id="consent-heading">Choose your cookies</h2>

        <p id="consent-body">
          We use cookies and similar browser storage. Some keep your cart working; the rest just help us count
          visits.
        </p>

        {/* The itemised "Learn more and manage" list was removed to keep the
            card short. The two buttons below are the only controls anyway
            (one optional category), and the policy link keeps the full
            explanation one click away. */}
        <Link href="/legal/cookie-policy">Read the Cookie Policy</Link>

        {/* Equal weight on purpose: same size, side by side, both solid
            enough to read as a real choice. */}
        <div className="ga-consent-actions">
          <button type="button" onClick={() => writeConsent(true)} className="r-btn r-primary">
            Accept all
          </button>
          {/* false: this records a refusal. It wrote `true` until 2026-10,
              so "reject" silently opted visitors in to analytics. */}
          <button type="button" onClick={() => writeConsent(false)} className="r-btn r-outline">
            Reject non-essential
          </button>
        </div>
      </div>
    </div>
  );
}
