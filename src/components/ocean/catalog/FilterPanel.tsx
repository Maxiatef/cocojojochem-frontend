'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';

/** Reference store-client.tsx `FilterPanel`: open on desktop, collapsed on phones. */
export function FilterPanel({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    setOpen(window.matchMedia('(min-width: 851px)').matches);
  }, []);
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <SlidersHorizontal size={18} />
        Filter ingredients
      </summary>
      {children}
    </details>
  );
}
