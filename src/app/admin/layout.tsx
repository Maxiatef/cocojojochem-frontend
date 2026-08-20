'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The login page must render outside AdminShell's auth guard — otherwise a
  // logged-out user hitting /admin/login would get bounced into an "Access
  // denied" screen instead of ever seeing the login form.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
