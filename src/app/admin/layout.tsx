'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { SCI_FONT_VARS } from '@/lib/fonts';

/**
 * `/admin` sits outside the `(scientific)` route group, so the design
 * system's font variables are declared here too — without them the dashboard
 * would fall back to system-ui while using sci type scales and colours.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The login page must render outside AdminShell's auth guard — otherwise a
  // logged-out user hitting /admin/login would get bounced into an "Access
  // denied" screen instead of ever seeing the login form.
  const content = pathname === '/admin/login' ? children : <AdminShell>{children}</AdminShell>;

  return <div className={`${SCI_FONT_VARS} font-sci-body`}>{content}</div>;
}
