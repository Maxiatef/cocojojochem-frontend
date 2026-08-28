'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/visitorTracking';

// Mounted once in the storefront layout only — admin pages are never
// tracked, so this never counts staff activity as site traffic. Tracks the
// path only (no query string) — usePathname alone doesn't need a Suspense
// boundary the way useSearchParams does, and the query string isn't needed
// for a simple visits/unique-visitors count.
export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
