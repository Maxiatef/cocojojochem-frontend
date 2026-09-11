'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, SciButton } from '@/components/scientific/primitives';
import { useStorefrontSession } from '@/lib/useStorefrontSession';
import { CartIcon, QuoteIcon, UserCircleIcon } from '@/components/icons';

/**
 * COCOJOJO "Scientific edition" header — utility bar, wordmark + search, and
 * the primary navigation row (Figma 33:217).
 *
 * The design only specifies desktop and a separate mobile menu frame, so the
 * breakpoint behaviour here is an interpretation: the nav row collapses into a
 * disclosure below `md`, and the search field drops out of the top row onto its
 * own line rather than shrinking to unusable width.
 */

// The site's real routes, matching src/components/storefront/Header.tsx.
// The Figma design's labels (Industries / Solutions & services / Technical
// resources) describe pages that do not exist yet; using them would have left
// three of six nav items pointing somewhere they don't name.
const NAV = [
  { label: 'Categories', href: '/categories' },
  { label: 'Products', href: '/products' },
  { label: 'Functions', href: '/functions' },
  { label: 'A-Z', href: '/a-z' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * An icon link carrying a count badge — the cart and the quote list differ
 * only in icon and destination.
 *
 * Lives in the navy utility bar next to the account, so it is drawn in white:
 * on the white band below it the same icons read as faint grey marks and are
 * easy to miss entirely.
 *
 * The label sits beside the icon from `sm` up rather than relying on the glyph
 * alone — a cart is unambiguous, a quote list is not. Below `sm` the label is
 * dropped for room, and `aria-label` carries the name and the count either way.
 */
function BadgeLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative flex items-center gap-1.5 rounded-md px-2 py-1 font-sci-body text-xs font-medium leading-5 text-white transition hover:bg-white/10"
    >
      <span className="relative flex items-center">
        {children}
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sci-accent px-1 font-sci-body text-[10px] font-semibold text-sci-navy">
            {count}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export function ScientificHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { customerEmail, itemCount, quoteListCount } = useStorefrontSession();

  return (
    <header className="bg-white">
      {/* Utility navigation */}
      <div className="bg-sci-navy text-white">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-1.5">
          <p className="font-sci-body text-[10px] font-medium leading-4">
            Your ingredient partner. From concept to scale.
          </p>
          <div className="ml-auto flex items-center gap-6 sm:gap-8">
            <Link href="/about" className="font-sci-body text-xs font-medium leading-5 hover:underline">
              About COCOJOJO
            </Link>
            <Link href="/contact" className="font-sci-body text-xs font-medium leading-5 hover:underline">
              Contact us
            </Link>
            {/* Signed-out state is a plain link; signed-in shows the account
                area. The old header's AccountMenu dropdown is styled in the
                sand/olive palette, so it is not reused here — the account page
                itself carries the same actions. */}
            <Link
              href={customerEmail ? '/account' : '/account/login'}
              className="flex items-center gap-1.5 font-sci-body text-xs font-medium leading-5 hover:underline"
            >
              <UserCircleIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[180px] truncate">
                {customerEmail ? customerEmail : 'Sign in'}
              </span>
            </Link>

            <BadgeLink href="/quote-request" label="Quote list" count={quoteListCount}>
              <QuoteIcon className="h-4 w-4" />
            </BadgeLink>

            <BadgeLink href="/cart" label="Cart" count={itemCount}>
              <CartIcon className="h-4 w-4" />
            </BadgeLink>
          </div>
        </Container>
      </div>

      {/* Brand, search, primary CTA */}
      <Container className="flex flex-wrap items-center justify-between gap-4 py-5">
        <Link href="/" className="flex flex-col gap-1">
          <span className="font-sci-heading text-[34px] font-extrabold leading-[42px] text-sci-navy">
            COCOJOJO
          </span>
          <span className="font-sci-body text-[8px] font-medium leading-4 tracking-[2px] text-sci-blue">
            CHEMICALS &amp; INGREDIENTS
          </span>
        </Link>

        <Link
          href="/products"
          className="order-last w-full rounded-lg border border-sci-border bg-sci-pale p-4 font-sci-body text-sci-body text-sci-muted transition hover:border-sci-blue md:order-none md:w-[650px]"
        >
          Search products, ingredients or categories ↗
        </Link>

        <div className="flex items-center gap-3">
          <SciButton href="/quote-request" variant="navy">
            Request a quote →
          </SciButton>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="rounded-md border border-sci-border p-3 text-sci-navy md:hidden"
          >
            <span aria-hidden className="block h-0.5 w-5 bg-current" />
            <span aria-hidden className="mt-1 block h-0.5 w-5 bg-current" />
            <span aria-hidden className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
        </div>
      </Container>

      {/* Primary navigation */}
      <nav className={`border-t border-sci-border md:border-t-0 ${open ? 'block' : 'hidden md:block'}`}>
        <Container className="flex flex-col gap-4 py-3.5 md:flex-row md:items-center md:gap-9">
          {NAV.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`font-sci-body text-sci-label font-medium leading-5 transition ${
                  active
                    ? 'text-sci-blue md:border-b-2 md:border-sci-accent md:pb-1'
                    : 'text-sci-navy hover:text-sci-blue'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </Container>
      </nav>
    </header>
  );
}
