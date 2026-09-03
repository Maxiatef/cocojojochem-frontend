'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApi';
import { clearCustomerToken, getCustomerRefreshToken } from '@/lib/customerAuth';
import { clearCart } from '@/lib/cartStore';
import { clearQuoteList } from '@/lib/quoteListStore';
import { CustomerProfile } from '@/lib/types';
import { UserCircleIcon, ChevronDownIcon, ReceiptIcon, LogoutIcon } from '@/components/icons';

export function AccountMenu({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => customerApi.get<CustomerProfile>('/auth/me'),
    enabled: open,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function handleLogout() {
    const refreshToken = getCustomerRefreshToken();
    if (refreshToken) {
      // Fire-and-forget — revoke the refresh token server-side, but don't
      // block sign-out on the network round trip.
      customerApi.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    clearCustomerToken();
    // Clear any leftover local (guest) cart/quote list so the next person on
    // this device doesn't see this customer's items after they've signed out.
    clearCart();
    clearQuoteList();
    setOpen(false);
    router.push('/');
  }

  const displayName = profile?.fullName || email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 text-ink transition hover:text-olive-700"
      >
        <UserCircleIcon className="h-5 w-5" />
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right border border-sand-200 bg-white p-1.5 shadow-lg">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-700 text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
              <p className="truncate text-xs text-ink-soft">{email}</p>
            </div>
          </div>

          <div className="my-1 border-t border-sand-200" />

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink hover:bg-sand-50"
          >
            <UserCircleIcon className="h-4 w-4 text-ink-soft" />
            My Account
          </Link>
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-ink hover:bg-sand-50"
          >
            <ReceiptIcon className="h-4 w-4 text-ink-soft" />
            My Orders
          </Link>

          <div className="my-1 border-t border-sand-200" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-ink-soft hover:bg-sand-50"
          >
            <LogoutIcon className="h-4 w-4 text-ink-soft" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
