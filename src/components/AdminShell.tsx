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
  TeamIcon,
  SettingsIcon,
  GlobeIcon,
  ClockIcon,
} from '@/components/icons';

// Each entry names the permission that its page's own list endpoint requires,
// so the sidebar shows exactly what the account can actually open. The nav is
// presentation only — the server enforces the same permission on every call.
const NAV: {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  permission?: string;
}[] = [
  { href: '/admin', label: 'Overview', icon: DashboardIcon, permission: 'canViewDashboard' },
  { href: '/admin/messages', label: 'Messages', icon: MailIcon, permission: 'canViewContactMessages' },
  { href: '/admin/quote-requests', label: 'Quote Requests', icon: InboxIcon, permission: 'canViewQuoteRequests' },
  { href: '/admin/products', label: 'Products', icon: BottleIcon, permission: 'canViewProducts' },
  { href: '/admin/categories', label: 'Categories', icon: GridIcon, permission: 'canViewCategories' },
  { href: '/admin/functions', label: 'Functions', icon: TagIcon, permission: 'canViewFunctions' },
  { href: '/admin/orders', label: 'Orders', icon: BoxIcon, permission: 'canViewOrders' },
  { href: '/admin/companies', label: 'Companies', icon: BuildingIcon, permission: 'canViewCompanies' },
  { href: '/admin/coupons', label: 'Sales & Coupons', icon: TicketIcon, permission: 'canViewCoupons' },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartIcon, permission: 'canViewAnalytics' },
  { href: '/admin/users', label: 'Users', icon: UsersIcon, permission: 'canViewUsers' },
  // Sits next to Users because it is the same subject from the other side:
  // Users is every account, My Team is the handful this person is over.
  { href: '/admin/my-team', label: 'My Team', icon: TeamIcon, permission: 'canViewOwnTeam' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ClockIcon, permission: 'canViewAuditLog' },
  { href: '/admin/seo', label: 'SEO', icon: GlobeIcon, permission: 'canViewSeoPages' },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon, permission: 'canViewSiteSettings' },
];

/**
 * The signed-in staff account, read from the server rather than from the JWT.
 *
 * Permissions live on the role row and an admin can change them at any time,
 * so the token is deliberately not the source of truth — it carries only
 * `roleId`. Cached for a minute so the sidebar and every page gate share one
 * request rather than issuing their own.
 */
export function useMe() {
  return useQuery({
    queryKey: ['auth-me'],
    queryFn: () => api.get<MeResponse>('/auth/me'),
    staleTime: 60_000,
    retry: false,
  });
}

type MeResponse = {
  id: number;
  email: string;
  roleId: number | null;
  role: { id: number; name: string; permissions: Record<string, boolean> } | null;
};

/** `undefined` while loading — callers must treat that as "not yet allowed". */
export function usePermissions(): Record<string, boolean> | undefined {
  const { data, isLoading } = useMe();
  if (isLoading) return undefined;
  return data?.role?.permissions ?? {};
}

/** True only once permissions have loaded AND the permission is granted. */
export function useCan(permission: string): boolean {
  const permissions = usePermissions();
  return permissions?.[permission] === true;
}

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
  const permissions = usePermissions();
  const nav = NAV.filter((item) => !item.permission || permissions?.[item.permission] === true);

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

  const { data: me, isLoading: meLoading, isError: meError } = useMe();

  // Staff-ness is "holds a role", decided by the server, because the token no
  // longer carries a role name — only a roleId whose meaning lives in the
  // roles table and can be edited at any time.
  useEffect(() => {
    if (!getToken()) {
      setDenied('not-logged-in');
      return;
    }
    if (meLoading) return;
    if (meError || !me) {
      setDenied('not-logged-in');
      return;
    }
    if (me.roleId == null) {
      setDenied('wrong-role');
      return;
    }
    setEmail(me.email);
    setRole(me.role?.name ?? null);
    setReady(true);
  }, [me, meLoading, meError]);

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
// pages call is guarded server-side by PermissionGuard, which is what actually
// enforces access.
function PermissionGate({
  children,
  permission,
  deniedMessage,
}: {
  children: React.ReactNode;
  /** Omitted means "any staff account", i.e. anyone holding a role at all. */
  permission?: string;
  deniedMessage: string;
}) {
  const { data, isLoading, isError } = useMe();

  if (!getToken()) {
    return <AccessDenied reason="not-logged-in" backHref="/admin" backLabel="Back to dashboard" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
      </div>
    );
  }

  // A failed /auth/me means the session is gone or unreadable — treat it as
  // not signed in rather than silently rendering an empty page.
  if (isError || !data) {
    return <AccessDenied reason="not-logged-in" backHref="/admin" backLabel="Back to dashboard" />;
  }

  const allowed = permission ? data.role?.permissions?.[permission] === true : data.roleId != null;

  if (!allowed) {
    return (
      <AccessDenied
        reason="wrong-role"
        message={deniedMessage}
        backHref="/admin"
        backLabel="Back to dashboard"
      />
    );
  }

  return <>{children}</>;
}

/**
 * Gate a page on one permission. Replaces the old RequireAdmin, which could
 * only ask "is this account the ADMIN enum value" — a question that no longer
 * has an answer now that an admin can define any role they like.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  return (
    <PermissionGate
      permission={permission}
      deniedMessage="Your role doesn't include permission to view this section."
    >
      {children}
    </PermissionGate>
  );
}

// Any staff account — anyone holding a role at all. Customers hold none.
export function RequireStaff({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGate deniedMessage="This section is restricted to staff accounts.">
      {children}
    </PermissionGate>
  );
}

/** The signed-in account's role name, or null for a customer / while loading. */
export function useAdminRole(): string | null {
  const { data } = useMe();
  return data?.role?.name ?? null;
}
