'use client';

import Link from 'next/link';
import { useCan } from '@/components/AdminShell';

/**
 * Links a product name to the product editor — but only for admins.
 *
 * The editor at /admin/products/[id]/edit is ADMIN-only (creating and editing
 * products is an admin-only operation server-side). Several staff-visible
 * pages list product names — the dashboard's low-stock table, the analytics
 * best-sellers tables, the category detail view — and each of them linked
 * straight into that editor, so a sales user clicking a product name landed on
 * "Access denied".
 *
 * Centralised here rather than repeating the conditional at each call site, so
 * a new product listing can't reintroduce the same dead end.
 */
export function ProductEditLink({
  productSlug,
  className = '',
  children,
}: {
  /**
   * The editor is addressed by slug, so its URL reads as the product rather
   * than a uuid. Every payload that lists products carries one; a row without
   * it renders as plain text rather than a link to nowhere.
   */
  productSlug?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  const isAdmin = useCan('canEditProduct');

  if (!isAdmin || !productSlug) {
    // Plain text, not a disabled link — nothing here hints at an action a
    // sales user can't take.
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={`/admin/products/${productSlug}/edit`} className={className}>
      {children}
    </Link>
  );
}
