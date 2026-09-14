'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
  ClockIcon,
} from '@/components/icons';

type AdminRole = 'ADMIN' | 'SALES';

const NAV: { href: string; label: string; icon: (props: { className?: string }) => React.ReactElement; roles?: AdminRole[] }[] = [
  { href: '/admin', label: 'Overview', icon: DashboardIcon },
  { href: '/admin/messages', label: 'Messages', icon: MailIcon },
  { href: '/admin/quote-requests', label: 'Quote Requests', icon: InboxIcon },
  { href: '/admin/products', label: 'Products', icon: BottleIcon },
  { href: '/admin/categories', label: 'Categories', icon: GridIcon },
  { href: '/admin/functions', label: 'Functions', icon: TagIcon },
  { href: '/admin/orders', label: 'Orders', icon: BoxIcon },
  { href: '/admin/companies', label: 'Companies', icon: BuildingIcon },
  { href: '/admin/coupons', label: 'Coupons', icon: TicketIcon },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartIcon },
  { href: '/admin/users', label: 'Users', icon: UsersIcon, roles: ['ADMIN'] },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ClockIcon, roles: ['ADMIN'] },
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
    <div className="flex min-h-screen items-center justify-center bg-sci-pale px-4">
      <div className="w-full max-w-sm border border-sci-border bg-white p-8 text-center">
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
        <h1 className="font-sci-heading text-[20px] font-semibold text-sci-navy">Access denied</h1>
        <p className="mt-2 font-sci-body text-sci-label text-sci-muted">
          {message ||
            (reason === 'not-logged-in'
              ? 'You need to sign in with a staff account to view the admin dashboard.'
              : "Your account doesn't have permission to access the admin dashboard.")}
        </p>
        <a
          href={reason === 'not-logged-in' ? '/admin/login' : backHref}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-sci-accent px-5 py-3 font-sci-body text-sci-label font-medium text-sci-navy transition hover:brightness-95"
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
      <div className="flex flex-col gap-2 border-b border-white/10 px-6 py-6">
        <Link href="/" aria-label="COCOJOJO Chemical — storefront home" className="w-fit">
          <Image
            src="/brand/cocojojo-logo.png"
            alt="COCOJOJO Chemical"
            width={999}
            height={400}
            sizes="300px"
            className="h-11 w-auto brightness-0 invert"
          />
        </Link>

      </div>

      <nav className="scrollbar-slim flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          let badgeCount = 0;
          const badgeColor = 'bg-sci-accent text-sci-navy';
          if (item.href === '/admin/messages') {
            badgeCount = messageStats?.unread ?? 0;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 font-sci-body text-sci-label font-medium transition ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-[#adc6d8] hover:bg-white/5 hover:text-white'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-sci-accent" />
              )}
              <Icon
                className={`h-[18px] w-[18px] shrink-0 ${
                  active ? 'text-sci-accent' : 'text-[#7e9cb4] group-hover:text-[#adc6d8]'
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${badgeColor}`}
                >
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-sci-accent">
            {email ? initialsFromEmail(email) : ''}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-sci-body text-xs font-medium text-white">{email}</p>
            {role && <p className="font-sci-body text-[11px] uppercase tracking-wide text-[#7e9cb4]">{role}</p>}
          </div>
          <button
            onClick={onLogout}
            aria-label="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#7e9cb4] transition hover:bg-white/10 hover:text-white"
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
      <div className="flex min-h-screen items-center justify-center bg-sci-pale">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-sci-pale font-sci-body text-sci-navy md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-sci-navy px-4 py-3 md:hidden">
        <Image
          src="/brand/cocojojo-logo.png"
          alt="COCOJOJO Chemical"
          width={991}
          height={396}
          sizes="130px"
          className="h-7 w-auto brightness-0 invert"
        />
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile off-canvas drawer + backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-sci-deep/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col bg-sci-navy shadow-xl">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-md text-[#7e9cb4] hover:bg-white/10 hover:text-white"
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
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:bg-sci-navy">
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

// Client-side route gate. This is a UX guard only — it stops a page flashing
// before redirect — and is NEVER the security boundary: every endpoint these
// pages call is guarded server-side by RolesGuard, which is what actually
// enforces access.
function RoleGate({
  children,
  allow,
  deniedMessage,
}: {
  children: React.ReactNode;
  allow: AdminRole[];
  deniedMessage: string;
}) {
  const [allowed, setAllowed] = useState(false);
  const [denied, setDenied] = useState<'not-logged-in' | 'wrong-role' | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setDenied('not-logged-in');
      return;
    }
    const payload = decodeToken(token);
    if (!payload || !allow.includes(payload.role as AdminRole)) {
      setDenied('wrong-role');
      return;
    }
    setAllowed(true);
    // `allow` is a literal array at every call site, so a deps entry would
    // re-run this on every render; the role can't change without a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (denied) {
    return (
      <AccessDenied
        reason={denied}
        message={denied === 'wrong-role' ? deniedMessage : undefined}
        backHref="/admin"
        backLabel="Back to dashboard"
      />
    );
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

// ADMIN only — settings, staff, SEO, analytics.
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={['ADMIN']} deniedMessage="This section is restricted to admin accounts.">
      {children}
    </RoleGate>
  );
}

// ADMIN + SALES — sections sales can view but not modify (catalog, coupons).
// The read/write split is enforced server-side: the list endpoints allow both
// roles, while create/edit/delete stay ADMIN-only, so a sales user reaching
// one of these pages can browse it and nothing more.
export function RequireStaff({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={['ADMIN', 'SALES']} deniedMessage="This section is restricted to staff accounts.">
      {children}
    </RoleGate>
  );
}

// Current staff role from the access token, for hiding write controls a sales
// user isn't allowed to use. Returns null until the token is read on mount
// (and on the server), so treat null as "not admin" and render read-only.
export function useAdminRole(): AdminRole | null {
  const [role, setRole] = useState<AdminRole | null>(null);
  useEffect(() => {
    const token = getToken();
    const payload = token ? decodeToken(token) : null;
    setRole((payload?.role as AdminRole) || null);
  }, []);
  return role;
}

export function useIsAdmin(): boolean {
  return useAdminRole() === 'ADMIN';
}
