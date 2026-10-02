'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CircleCheck, FlaskConical, GitCompareArrows, Heart, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { GLOSS_LOGO } from '@/lib/gloss/images';
import { useCartDrawerOpener, useCompare, useToastMessage } from '@/lib/gloss/stores';
import { useWorkspaceSync } from '@/lib/gloss/workspaceSync';
import { useCartTotalCount } from './CartLines';
import { useStorefrontSession } from '@/lib/useStorefrontSession';
import { CookieSettingsLink } from '@/components/scientific/CookieSettingsLink';
import { CartDrawer } from './CartDrawer';
import { HeaderSearch } from './HeaderSearch';

/**
 * The storefront chrome, ported from the Gloss Studio prototype: announcement
 * bar, sticky header with search and workspace actions, main navigation, the
 * "next formula" help band, footer, cart drawer and toast.
 *
 * Routes are ours, not the prototype's, where the two differ: the shop is
 * /products (the URL search engines already know), and the quote list sits
 * beside the cart because this is a wholesale business.
 */
const NAV: [string, string][] = [
  ['/products', 'Shop ingredients'],
  ['/categories', 'Categories'],
  ['/ingredients-a-z', 'A–Z library'],
  ['/formulation-tools', 'Formulation tools'],
  ['/services', 'Our services'],
  ['/about', 'About COCOJOJO'],
];

const MOBILE_NAV: [string, string][] = [
  ['/products', 'Shop ingredients'],
  ['/categories', 'Categories'],
  ['/ingredients-a-z', 'A–Z ingredient library'],
  ['/formulation-tools', 'Formulation tools'],
  ['/compare', 'Compare ingredients'],
  ['/quote-request', 'Quote list'],
  ['/services', 'Services'],
  ['/contact', 'Contact us'],
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

export function GlossShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const { customerEmail, quoteListCount } = useStorefrontSession();
  const cart = useCartTotalCount();
  useWorkspaceSync();
  const compare = useCompare();
  const toast = useToastMessage();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);

  const openDrawer = useCallback(() => setDrawer(true), []);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  useCartDrawerOpener(openDrawer);

  // A route change closes the mobile menu, or it stays open over the new page.
  useEffect(() => setMenu(false), [pathname]);

  return (
    <>
      <a className="r-skip" href="#main">
        Skip to content
      </a>
      <div className="r-announcement">
        <span>The art of formulation. The science of ingredients.</span>
        <Link href="/shipping-returns">Shipping &amp; returns</Link>
      </div>

      <header className="r-header">
        <div className="r-wrap r-header-main">
          <Link className="r-logo" href="/" aria-label="COCOJOJO Chemical home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GLOSS_LOGO} width={184} height={60} alt="COCOJOJO Chemical" />
          </Link>
          <HeaderSearch compact />
          <div className="r-header-actions">
            <Link href="/compare" aria-label={`Compare ingredients (${compare.length})`}>
              <GitCompareArrows size={21} />
              <span>Compare</span>
            </Link>
            <Link href="/saved" aria-label="Wishlist">
              <Heart size={21} />
              <span>Wishlist</span>
            </Link>
            <Link
              href={customerEmail ? '/account' : '/account/login'}
              aria-label={customerEmail ? `My account (${customerEmail})` : 'Sign in'}
              title={customerEmail || 'Sign in or create an account'}
            >
              <UserRound size={21} />
              <span>{customerEmail ? 'Account' : 'Sign in'}</span>
            </Link>
            <button className="r-cart-button" onClick={openDrawer} aria-label={`Open shopping cart (${cart.count} items)`}>
              <ShoppingBag size={22} />
              <b>{cart.count}</b>
              <span>Cart</span>
            </button>
            <button
              className="r-menu-button"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? 'Close menu' : 'Open menu'}
              onClick={() => setMenu((m) => !m)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <nav className="r-nav r-wrap" aria-label="Main navigation">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} aria-current={isActive(pathname, href) ? 'page' : undefined}>
              {label}
            </Link>
          ))}
          <Link href="/quote-request" aria-current={isActive(pathname, '/quote-request') ? 'page' : undefined}>
            Quote list{quoteListCount > 0 ? ` (${quoteListCount})` : ''}
          </Link>
          <Link href="/contact">Need help?</Link>
        </nav>
        {menu && (
          <nav id="mobile-menu" className="r-mobile-nav" aria-label="Mobile navigation">
            {MOBILE_NAV.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main id="main">{children}</main>

      <section className="r-help-band r-wrap">
        <FlaskConical size={32} />
        <div>
          <h2>Your next formula starts here.</h2>
          <p>Find the right ingredient, compare the details and plan your next batch.</p>
        </div>
        <Link className="r-btn r-primary" href="/products">
          Explore the shop
        </Link>
        <Link className="r-btn r-outline" href="/contact">
          Ask an ingredient question
        </Link>
      </section>

      <footer className="r-footer">
        <div className="r-wrap r-footer-grid">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GLOSS_LOGO} width={190} height={65} alt="COCOJOJO Chemical" />
            <p>
              Ingredients for the things
              <br />
              you want to create.
            </p>
            <small>California, United States</small>
          </div>
          <div>
            <h3>Shop &amp; discover</h3>
            <Link href="/products">COCOJOJO ingredients</Link>
            <Link href="/categories">Ingredient categories</Link>
            <Link href="/functions">Ingredients by function</Link>
            <Link href="/ingredients-a-z">Ingredients A–Z</Link>
            <Link href="/documents">Technical documents</Link>
          </div>
          <div>
            <h3>Your workspace</h3>
            <Link href="/cart">Shopping cart</Link>
            <Link href="/quote-request">Quote list</Link>
            <Link href="/saved">Wishlist</Link>
            <Link href="/projects">My projects</Link>
            <Link href="/account">Orders &amp; account</Link>
            <Link href="/formulation-tools">Batch calculator</Link>
          </div>
          <div>
            <h3>Here to help</h3>
            <Link href="/contact">Contact us</Link>
            <Link href="/shipping-returns">Shipping &amp; returns</Link>
            <Link href="/faq">Common questions</Link>
            <a href="mailto:support@cocojojo.com">support@cocojojo.com</a>
            <a href="tel:+19496107164">+1 949 610 7164</a>
          </div>
        </div>
        <div className="r-wrap r-footer-bottom">
          <span>© {new Date().getFullYear()} COCOJOJO. All rights reserved.</span>
          <div>
            <Link href="/legal/privacy-policy">Privacy</Link>
            <Link href="/legal/terms-of-service">Terms</Link>
            <Link href="/accessibility">Accessibility</Link>
            <CookieSettingsLink />
          </div>
        </div>
      </footer>

      {toast && (
        <div className="r-toast" role="status">
          <CircleCheck size={19} />
          {toast}
        </div>
      )}
      {drawer && <CartDrawer close={closeDrawer} />}
    </>
  );
}
