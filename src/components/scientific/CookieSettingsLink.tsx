'use client';

import { reopenConsent } from '@/lib/consent';

/**
 * Reopens the storage notice.
 *
 * Consent that cannot be withdrawn as easily as it was given is not consent,
 * so this sits in the footer beside the policies — the place people look for
 * it, and reachable from every page.
 *
 * Its own client component because the footer is a server component: only
 * this one control needs to run in the browser.
 */
export function CookieSettingsLink({ className = '' }: { className?: string }) {
  return (
    <button type="button" onClick={reopenConsent} className={className}>
      Cookie settings
    </button>
  );
}
