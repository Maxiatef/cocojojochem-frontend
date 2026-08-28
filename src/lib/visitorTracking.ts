'use client';

// Lightweight in-house visitor tracking — no third-party analytics SDK.
// visitorId is a random id generated once per browser and persisted in
// localStorage, purely to de-duplicate "unique visitors" from raw page-view
// counts; it isn't tied to any real identity or account.
const VISITOR_ID_KEY = 'cocojojochem_visitor_id';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage unavailable (private browsing, blocked storage) — fall
    // back to a per-load id rather than skipping tracking entirely; this
    // page load just won't be de-duplicated against the visitor's others.
    return crypto.randomUUID();
  }
}

// Fire-and-forget — a tracking failure must never affect the page. Uses
// `keepalive` so the request survives a fast route change/unload.
export function trackPageView(path: string) {
  try {
    const visitorId = getOrCreateVisitorId();
    fetch(`${API_URL}/track/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, visitorId }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never let a tracking error surface to the page.
  }
}
