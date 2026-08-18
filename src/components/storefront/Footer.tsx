'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { decodeCustomerToken, getCustomerToken } from '@/lib/customerAuth';

export function StorefrontFooter() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    function syncAuth() {
      const token = getCustomerToken();
      setIsAuthed(!!(token && decodeCustomerToken(token)));
    }
    syncAuth();
    window.addEventListener('customer-auth-changed', syncAuth);
    return () => window.removeEventListener('customer-auth-changed', syncAuth);
  }, []);

  return (
    <footer className="mt-16 bg-olive-950 text-sand-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-xl italic text-white">(cocojojochem)</p>
            <p className="mt-3 text-sm text-sand-100/50">
              Wholesale cosmetic ingredients, sourced and supplied at scale.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-sand-100/40">Shop</p>
            <ul className="space-y-2.5 text-sm text-sand-100/70">
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/functions" className="hover:text-white">Functions</Link></li>
              <li><Link href="/a-z" className="hover:text-white">A-Z Index</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-sand-100/40">Account</p>
            <ul className="space-y-2.5 text-sm text-sand-100/70">
              {isAuthed ? (
                <li><Link href="/account" className="hover:text-white">My Account</Link></li>
              ) : (
                <>
                  <li><Link href="/account/login" className="hover:text-white">Sign in</Link></li>
                  <li><Link href="/account/register" className="hover:text-white">Create account</Link></li>
                </>
              )}
              <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-sand-100/40">Company</p>
            <ul className="space-y-2.5 text-sm text-sand-100/70">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-sand-100/40">
          © {new Date().getFullYear()} CocoJojoChem. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
