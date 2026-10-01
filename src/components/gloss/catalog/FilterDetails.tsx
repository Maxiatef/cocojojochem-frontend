'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

/**
 * The prototype's collapsible filter panel (store-client fn `j`): open on
 * desktop, folded shut below 851px so the first products are not pushed two
 * screens down on a phone. Server-rendered open, then corrected on mount.
 */
export function FilterDetails({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    setOpen(window.matchMedia('(min-width: 851px)').matches);
  }, []);
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <SlidersHorizontal size={18} aria-hidden />
        Filter ingredients
      </summary>
      {children}
    </details>
  );
}
