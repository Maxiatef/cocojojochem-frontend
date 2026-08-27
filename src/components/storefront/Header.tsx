'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCart, clearCart } from '@/lib/cartStore';
import { useQuoteList } from '@/lib/quoteListStore';
import { customerApi } from '@/lib/customerApi';
import {
  clearCustomerToken,
  decodeCustomerToken,
  getCustomerRefreshToken,
  getCustomerToken,
} from '@/lib/customerAuth';
import { CartIcon, MenuIcon, CloseIcon, ReceiptIcon, LogoutIcon, LeafLogoIcon, QuoteIcon } from '@/components/icons';
import { AccountMenu } from '@/components/storefront/AccountMenu';

const NAV = [
  { href: '/categories', label: 'Categories' },
  { href: '/products', label: 'Products' },
  { href: '/functions', label: 'Functions' },
  { href: '/a-z', label: 'A-Z' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function StorefrontHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { itemCount: localItemCount } = useCart();
  const { count: quoteListCount } = useQuoteList();
  const [search, setSearch] = useState('');
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function syncAuth() {
      const token = getCustomerToken();
      const payload = token ? decodeCustomerToken(token) : null;
      setCustomerEmail(payload?.email || null);
    }
    syncAuth();
    window.addEventListener('customer-auth-changed', syncAuth);
    return () => window.removeEventListener('customer-auth-changed', syncAuth);
  }, []);

  // Logged-in customers have a server-persisted cart — reflect that count
  // here instead of the guest localStorage cart, and refresh whenever any
  // page adds/updates/removes a server cart item.
  const { data: serverCartSummary } = useQuery({
    queryKey: ['customer-cart-summary'],
    queryFn: () => customerApi.get<{ itemCount: number }>('/cart/summary'),
    enabled: !!customerEmail,
  });

  useEffect(() => {
    if (!customerEmail) return;
    function onServerCartChanged() {
      queryClient.invalidateQueries({ queryKey: ['customer-cart-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-cart'] });
    }
    window.addEventListener('cocojojochem-server-cart-changed', onServerCartChanged);
    return () => window.removeEventListener('cocojojochem-server-cart-changed', onServerCartChanged);
  }, [customerEmail, queryClient]);

  const itemCount = customerEmail ? serverCartSummary?.itemCount || 0 : localItemCount;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  function handleLogout() {
    const refreshToken = getCustomerRefreshToken();
    if (refreshToken) {
      // Fire-and-forget — revoke the refresh token server-side, but don't
      // block sign-out on the network round trip.
      customerApi.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    clearCustomerToken();
    // Clear any leftover local (guest) cart so the next person on this device
    // doesn't see this customer's items after they've signed out.
    clearCart();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-6 sm:px-6">
        <div className="flex items-center">
          <nav className="hidden items-center gap-3.5 xl:flex">
            {NAV.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative whitespace-nowrap pb-1 text-[11px] font-medium uppercase tracking-[0.08em] transition ${
                    active ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-olive-600" />
                  )}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center text-ink xl:hidden"
          >
            {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        >
          <LeafLogoIcon className="h-9 w-10" />
          <span className="mt-0.5 text-center text-[11px] font-medium uppercase leading-tight tracking-[0.15em] text-ink">
            cocojojo
            <br />
            wholesale
          </span>
        </Link>

        <div className="flex items-center justify-end gap-3">
          <form onSubmit={handleSearch} className="hidden xl:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, CAS, ingredient…"
              className="w-36 border-b border-sand-300 bg-transparent py-1.5 text-xs text-ink outline-none placeholder:text-ink-soft/60 focus:border-olive-600"
            />
          </form>

          {customerEmail ? (
            <div className="hidden sm:block">
              <AccountMenu email={customerEmail} />
            </div>
          ) : (
            <Link
              href="/account/login"
              className="hidden text-xs font-medium uppercase tracking-[0.1em] text-ink-soft hover:text-ink sm:block"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/quote-request"
            className="relative flex h-9 w-9 items-center justify-center text-ink"
            title="Quote List"
          >
            <QuoteIcon className="h-5 w-5" />
            {quoteListCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive-700 px-1 text-[10px] font-semibold text-white">
                {quoteListCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center text-ink">
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive-700 px-1 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-sand-200 px-4 py-3 xl:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-sand-300 bg-sand-50 px-3.5 py-2 text-sm text-ink outline-none"
            />
          </form>
          <div className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium ${
                    active ? 'bg-sand-50 text-olive-700' : 'text-ink hover:bg-sand-50'
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-olive-600" />}
                  {item.label}
                </Link>
              );
            })}
            {customerEmail ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-sand-50"
                >
                  My Account
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-sand-50"
                >
                  <ReceiptIcon className="h-4 w-4 text-ink-soft" />
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm font-medium text-ink-soft hover:bg-sand-50"
                >
                  <LogoutIcon className="h-4 w-4 text-ink-soft" />
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/account/login" className="rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-sand-50">
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
