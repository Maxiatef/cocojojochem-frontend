'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  CheckCircle2,
  FlaskConical,
  GitCompareArrows,
  Headphones,
  Heart,
  Menu,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { useCartDrawerOpener, useCompare, useToastMessage } from '@/lib/gloss/stores';
import { useWorkspaceSync } from '@/lib/gloss/workspaceSync';
import { useCartTotalCount } from '@/components/gloss/CartLines';
import { CartDrawer } from '@/components/gloss/CartDrawer';
import BrandLogo from './motion/brand-logo';
import CinematicIntro from './motion/cinematic-intro';
import InteractiveFinale from './motion/interactive-finale';
import ServicesFinale from './motion/services-finale';
import BlueFooterArt from './motion/blue-footer-art';
import FooterLogoAssembly from './motion/footer-logo-assembly';
import { OceanSearchBox } from './OceanSearchBox';
import { NewsletterSignup } from './Newsletter';

/**
 * The storefront chrome of the COCOJOJO ocean design (IT handoff 2026-10-09,
 * app/store-client.tsx `StoreShell`), markup and class names unchanged.
 *
 * What differs is only what sits behind the controls: the cart, request list,
 * accepted quotes, compare and wishlist are ours (useCartTotalCount,
 * useCompare, …), and the drawer is our CartDrawer with its two groups.
 */
const NAV: [string, string][] = [
  ['/shop', 'Shop ingredients'],
  ['/categories', 'Categories'],
  ['/packaging', 'Packaging'],
  ['/ingredients-a-z', 'A–Z library'],
  ['/formulation-tools', 'Formulation tools'],
  ['/services', 'Services'],
  ['/about', 'About COCOJOJO'],
];

const MOBILE_NAV: [string, string][] = [
  ['/shop', 'Shop ingredients'],
  ['/categories', 'Categories'],
  ['/packaging', 'Packaging'],
  ['/ingredients-a-z', 'A–Z ingredient library'],
  ['/formulation-tools', 'Formulation tools'],
  ['/services', 'Services'],
  ['/compare', 'Compare ingredients'],
  ['/saved', 'Wishlist'],
  ['/account', 'My account'],
  ['/about', 'About COCOJOJO'],
  ['/contact', 'Need help?'],
];

/** Pages that open with the cinematic intro, and its variant. */
const INTRO: Record<string, 'home' | 'packaging' | 'services' | 'studio' | 'about' | 'library'> = {
  '/': 'home',
  '/packaging': 'packaging',
  '/services': 'services',
  '/formulation-tools': 'studio',
  '/about': 'about',
  '/ingredients-a-z': 'library',
};

/** The wrapper class each page's scenes and theme layer hang off. */
const SHELL: Record<string, string> = {
  '/': 'lusion-home-shell',
  '/packaging': 'packaging-entry-shell',
  '/formulation-tools': 'studio-entry-shell',
  '/ingredients-a-z': 'library-entry-shell',
  '/services': 'lusion-home-shell e-company-shell services-entry-shell',
  '/about': 'lusion-home-shell e-company-shell about-entry-shell',
};

const isCurrent = (path: string, url: string) => path === url || path.startsWith(url + '/');

export function OceanShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || '/';
  const cart = useCartTotalCount();
  const compare = useCompare();
  const toast = useToastMessage();
  useWorkspaceSync();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);

  const openDrawer = useCallback(() => setDrawer(true), []);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  useCartDrawerOpener(openDrawer);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(false);
        menuToggle.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);

  const intro = INTRO[path];
  const brandFooter = path === '/' || path === '/services' || path === '/about';

  return (
    <>
      {intro && <CinematicIntro key={path} variant={intro} />}
      <div className={SHELL[path]}>
        <a className="r-skip" href="#main">
          Skip to content
        </a>
        <div className="r-announcement">
          <span>The art of formulation. The science of ingredients.</span>
          <a href="/shipping-returns">Shipping &amp; returns</a>
        </div>
        <header className="r-header r-header-modern">
          <div className="r-wrap r-header-main">
            <a className="r-logo" href="/" aria-label="COCOJOJO Chemical home">
              <BrandLogo />
            </a>
            <OceanSearchBox compact />
            <div className="r-header-actions">
              <a
                className="r-header-compare"
                href="/compare"
                title="Compare ingredients"
                aria-label={`Compare ingredients (${compare.length})`}
                aria-current={path === '/compare' ? 'page' : undefined}
              >
                <GitCompareArrows size={20} />
                <span>Compare</span>
              </a>
              <a
                className="r-header-wishlist"
                href="/saved"
                title="Wishlist"
                aria-label="Wishlist"
                aria-current={path === '/saved' ? 'page' : undefined}
              >
                <Heart size={20} />
                <span>Wishlist</span>
              </a>
              <a
                className="r-header-account"
                href="/account"
                title="My account"
                aria-label="My account"
                aria-current={path === '/account' ? 'page' : undefined}
              >
                <UserRound size={20} />
                <span>Account</span>
              </a>
              <button
                onClick={openDrawer}
                className="r-cart-button"
                aria-label={`Open shopping cart (${cart.count} items)`}
              >
                <ShoppingBag size={20} />
                <span>Cart</span>
                <b>{cart.count}</b>
              </button>
              <button
                ref={menuToggle}
                className="r-menu-button"
                aria-expanded={menu}
                aria-controls="mobile-menu"
                aria-label={menu ? 'Close menu' : 'Open menu'}
                onClick={() => setMenu(!menu)}
              >
                {menu ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
          <nav className="r-nav r-wrap" aria-label="Main navigation">
            <div className="r-nav-links">
              {NAV.map(([url, label]) => (
                <a href={url} key={url} aria-current={isCurrent(path, url) ? 'page' : undefined}>
                  {url === '/shop' && <FlaskConical size={17} />}
                  <span>{label}</span>
                </a>
              ))}
            </div>
            <a className="r-header-help" href="/contact" aria-current={path === '/contact' ? 'page' : undefined}>
              <Headphones size={18} />
              <span>Need help?</span>
            </a>
          </nav>
          {menu && (
            <nav id="mobile-menu" className="r-mobile-nav" aria-label="Mobile navigation" onClick={() => setMenu(false)}>
              {MOBILE_NAV.map(([url, label]) => (
                <a key={url} href={url} aria-current={isCurrent(path, url) ? 'page' : undefined}>
                  <span>{label}</span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              ))}
            </nav>
          )}
        </header>
        <main id="main">{children}</main>
        {path === '/' ? (
          <InteractiveFinale />
        ) : path === '/services' ? (
          <ServicesFinale />
        ) : (
          <section className="r-help-band r-wrap">
            <FlaskConical size={32} />
            <div>
              <h2>Your next formula starts here.</h2>
              <p>Find the right ingredient, compare the details and plan your next batch.</p>
            </div>
            <a className="r-btn r-primary" href="/shop">
              Explore the shop
            </a>
            <a className="r-btn r-outline" href="/contact">
              Ask an ingredient question
            </a>
          </section>
        )}
        {path !== '/email-preferences' && <NewsletterSignup key={path} />}
        <footer className="r-footer" id="site-footer">
          <div className="r-footer-upper">
            {brandFooter && <BlueFooterArt />}
            <div className="r-wrap r-footer-grid">
              <div>
                <BrandLogo />
                <p>
                  Ingredients for the things
                  <br />
                  you want to create.
                </p>
                <small>California, United States</small>
              </div>
              <div>
                <h3>Shop &amp; discover</h3>
                <a href="/shop">COCOJOJO ingredients</a>
                <a href="/categories">Ingredient categories</a>
                <a href="/ingredients-a-z">Ingredients A–Z</a>
                <a href="/packaging">Packaging</a>
                <a href="/documents">Technical documents</a>
              </div>
              <div>
                <h3>Your workspace</h3>
                <a href="/cart">Shopping cart</a>
                <a href="/saved">Wishlist</a>
                <a href="/projects">My projects</a>
                <a href="/account">Requests &amp; account</a>
                <a href="/formulation-tools">Formulation tools</a>
              </div>
              <div>
                <h3>Here to help</h3>
                <a href="/services">Services</a>
                <a href="/contact">Contact us</a>
                <a href="/shipping-returns">Shipping &amp; returns</a>
                <a href="/faq">Common questions</a>
                <a href="mailto:support@cocojojo.com">support@cocojojo.com</a>
                <a href="tel:+19496107164">+1 949 610 7164</a>
              </div>
            </div>
          </div>
          {brandFooter && (
            <div className="r-wrap b-footer-brand-area" aria-hidden="true">
              <FooterLogoAssembly key={path} />
            </div>
          )}
          <div className="r-wrap r-footer-bottom">
            <span>© {new Date().getFullYear()} COCOJOJO. All rights reserved.</span>
            <div>
              <a href="/legal/privacy-policy">Privacy</a>
              <a href="/legal/terms-of-service">Terms</a>
              <a href="/accessibility">Accessibility</a>
            </div>
          </div>
        </footer>
        {toast && (
          <div className="r-toast" role="status">
            <CheckCircle2 size={19} />
            {toast}
          </div>
        )}
        {drawer && <CartDrawer close={closeDrawer} />}
      </div>
    </>
  );
}
