'use client';

import { useEffect, useState } from 'react';

/**
 * What the visitor has agreed we may store on their device.
 *
 * Kept in localStorage rather than a cookie, which is also where the things
 * it governs live (the visitor id, the guest cart). A cookie would be the
 * shorter-lived choice of the two: Chrome caps every cookie at 400 days and
 * Safari caps a script-written one at 7, while localStorage persists until
 * the visitor clears site data. The notice says "cookies and similar
 * technologies" for that reason — the law covers storage on the device, not
 * one particular mechanism, and naming only cookies would be inaccurate.
 */
const CONSENT_KEY = 'cocojojochem_consent';
export const CONSENT_EVENT = 'cocojojochem-consent-changed';

/**
 * Raised when the choices on offer change, so a decision made against an
 * older notice is not treated as agreement to something added later.
 */
const CONSENT_VERSION = 1;

export interface ConsentState {
  v: number;
  /** The only optional category today: the visitor id used to count unique visits. */
  analytics: boolean;
  decidedAt: string;
}

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    // A decision against a previous version of the notice is not a decision
    // about this one.
    if (parsed?.v !== CONSENT_VERSION) return null;
    if (typeof parsed.analytics !== 'boolean') return null;
    return parsed;
  } catch {
    // Storage blocked or the value is corrupt. Treated as "not asked yet",
    // which is the safe reading: nothing optional gets stored.
    return null;
  }
}

export function writeConsent(analytics: boolean): void {
  const state: ConsentState = {
    v: CONSENT_VERSION,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    // Private browsing with storage blocked. The choice holds for this page
    // load via the event below; we simply have to ask again next visit.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/** Clears the decision so the notice is shown again. Backs "Cookie settings". */
export function reopenConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* nothing to clear */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

/** True only on an explicit yes — never by default, and never by ignoring the notice. */
export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

/**
 * Current decision, kept in step with the other tabs.
 *
 * `undefined` while the first render is still on the server or before the
 * effect runs, so a caller can tell "not decided" apart from "not read yet"
 * and avoid flashing the notice at someone who already answered it.
 */
export function useConsent(): ConsentState | null | undefined {
  const [consent, setConsent] = useState<ConsentState | null | undefined>(undefined);

  useEffect(() => {
    setConsent(readConsent());
    const sync = () => setConsent(readConsent());
    window.addEventListener(CONSENT_EVENT, sync);
    // Fires in the OTHER tabs, so answering in one settles all of them.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return consent;
}
