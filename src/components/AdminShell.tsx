'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { clearToken, decodeToken, getRefreshToken, getToken } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  BoxIcon,
  BuildingIcon,
  BottleIcon,
  ChartIcon,
  DashboardIcon,
  GridIcon,
  InboxIcon,
  LogoutIcon,
  MailIcon,
  MenuIcon,
  CloseIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
  SettingsIcon,
  GlobeIcon,
} from '@/components/icons';

type AdminRole = 'ADMIN' | 'SALES';

const NAV: { href: string; label: string; icon: (props: { className?: string }) => React.ReactElement; roles?: AdminRole[] }[] = [
  { href: '/admin', label: 'Overview', icon: DashboardIcon },
  { href: '/admin/messages', label: 'Messages', icon: MailIcon },
  { href: '/admin/quote-requests', label: 'Quote Requests', icon: InboxIcon },
  { href: '/admin/products', label: 'Products', icon: BottleIcon, roles: ['ADMIN'] },
  { href: '/admin/categories', label: 'Categories', icon: GridIcon, roles: ['ADMIN'] },
  { href: '/admin/functions', label: 'Functions', icon: TagIcon, roles: ['ADMIN'] },
  { href: '/admin/orders', label: 'Orders', icon: BoxIcon },
  { href: '/admin/companies', label: 'Companies', icon: BuildingIcon },
  { href: '/admin/coupons', label: 'Coupons', icon: TicketIcon, roles: ['ADMIN'] },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartIcon, roles: ['ADMIN'] },
  { href: '/admin/users', label: 'Users', icon: UsersIcon, roles: ['ADMIN'] },
  { href: '/admin/seo', label: 'SEO', icon: GlobeIcon, roles: ['ADMIN'] },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon, roles: ['ADMIN'] },
];

function initialsFromEmail(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function AccessDenied({
  reason,
  message,
  backHref = '/',
  backLabel = 'Back to homepage',
}: {
  reason: 'not-logged-in' | 'wrong-role';
  message?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-red-600">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 003 19.5h18a1 1 0 00.87-1.46L13.71 3.86a1 1 0 00-1.72 0z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-base font-semibold text-slate-900">Access denied</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {message ||
            (reason === 'not-logged-in'
              ? 'You need to sign in with a staff account to view the admin dashboard.'
              : "Your account doesn't have permission to access the admin dashboard.")}
        </p>
        <a
          href={reason === 'not-logged-in' ? '/admin/login' : backHref}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          {reason === 'not-logged-in' ? 'Go to login' : backLabel}
        </a>
      </div>
    </div>
  );
}

function SidebarContent({
  email,
  role,
  pathname,
  onNavigate,
  onLogout,
}: {
  email: string | null;
  role: string | null;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const nav = NAV.filter((item) => !item.roles || (role && item.roles.includes(role as AdminRole)));

  const { data: messageStats } = useQuery({
    queryKey: ['contact-messages-stats'],
    queryFn: () => api.get<{ total: number; unread: number }>('/wholesale/contact-messages/stats'),
    refetchInterval: 30_000,
  });

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-6 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          CJ
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">CocoJojoChem</p>
          <p className="text-xs text-slate-500">Wholesale Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main
        </p>
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          let badgeCount = 0;
          const badgeColor = 'bg-brand-600';
          if (item.href === '/admin/messages') {
            badgeCount = messageStats?.unread ?? 0;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand-600" />
              )}
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white ${badgeColor}`}
                >
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {email ? initialsFromEmail(email) : ''}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-700">{email}</p>
            {role && <p className="text-[11px] text-slate-400">{role}</p>}
          </div>
          <button
            onClick={onLogout}
            aria-label="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogoutIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState<'not-logged-in' | 'wrong-role' | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setDenied('not-logged-in');
      return;
    }
    const payload = decodeToken(token);
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SALES')) {
      setDenied('wrong-role');
      return;
    }
    setEmail(payload.email);
    setRole(payload.role);
    setReady(true);
  }, []);

  // Close the drawer automatically whenever the route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function handleLogout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Fire-and-forget — revoke the refresh token server-side, but don't
      // block sign-out on the network round trip.
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    clearToken();
    router.replace('/admin/login');
  }

  if (denied) {
    return <AccessDenied reason={denied} />;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            CJ
          </div>
          <p className="text-sm font-semibold text-slate-900">CocoJojoChem</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile off-canvas drawer + backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-xl">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <CloseIcon className="h-[18px] w-[18px]" />
            </button>
            <SidebarContent
              email={email}
              role={role}
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar — sticky to the viewport so the logout button stays
          reachable without scrolling, no matter how tall the page content is. */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-slate-200 md:bg-white">
        <SidebarContent
          email={email}
          role={role}
          pathname={pathname}
          onNavigate={() => {}}
          onLogout={handleLogout}
        />
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}

// Wrap ADMIN-only pages with this so a SALES user hitting the URL directly gets
// bounced back to the dashboard instead of seeing the page flash before redirect.
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [denied, setDenied] = useState<'not-logged-in' | 'wrong-role' | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setDenied('not-logged-in');
      return;
    }
    const payload = decodeToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      setDenied('wrong-role');
      return;
    }
    setAllowed(true);
  }, []);

  if (denied) {
    return (
      <AccessDenied
        reason={denied}
        message={denied === 'wrong-role' ? 'This section is restricted to admin accounts.' : undefined}
        backHref="/admin"
        backLabel="Back to dashboard"
      />
    );
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
