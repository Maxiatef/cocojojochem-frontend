import type { ReactNode } from 'react';
import { FileText, PackageCheck, RotateCcw } from 'lucide-react';

/**
 * The frame every sign-in style page shares: the prototype's r-page-intro
 * (which holds the page's one <h1>), then the form card beside a short panel
 * on what an account is for.
 *
 * Server-safe on purpose (no hooks), so the intro and panel are in the HTML
 * the server sends and nothing shifts when the form hydrates.
 */
export function AuthLayout({
  eyebrow = 'Your account',
  title,
  intro,
  aside = true,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro: ReactNode;
  aside?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      <section className="r-wrap r-section">
        <div className="ga-auth">
          <div>{children}</div>
          {aside && <AccountBenefits />}
        </div>
      </section>
    </>
  );
}

function AccountBenefits() {
  return (
    <aside className="ga-auth-aside" aria-label="What your account keeps">
      <span className="r-eyebrow">Your formulation workspace</span>
      <h2>Everything in one place.</h2>
      <ul>
        <li>
          <RotateCcw size={20} aria-hidden />
          <span>
            <strong>Reorder in a click</strong>
            Every order is kept with its pack sizes, so a repeat batch is one step.
          </span>
        </li>
        <li>
          <PackageCheck size={20} aria-hidden />
          <span>
            <strong>Track each shipment</strong>
            Follow orders from payment to delivery, with tracking when they ship.
          </span>
        </li>
        <li>
          <FileText size={20} aria-hidden />
          <span>
            <strong>Keep your quote list</strong>
            Your cart, quote list and wishlist follow you across devices.
          </span>
        </li>
      </ul>
    </aside>
  );
}
