'use client';

import { useEffect, useState } from 'react';
import { clearCompare, getCompare, notify, removeFromCompare, toggleCompare, useCompare } from '@/lib/gloss/stores';
import type { ProductMini } from '@/lib/ocean/store-types';
import { ComparisonWorkspace } from './ComparisonWorkspace';

/**
 * The reference `Comparison()` (store-client.tsx), on our compare store:
 * localStorage + window event, synced to the signed-in account by
 * workspaceSync. Items are {slug, name}; the workspace loads the rest from
 * /api/compare.
 */
export function Comparison() {
  const list = useCompare();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);

  const selected: ProductMini[] = list.map((item) => ({
    slug: item.slug,
    name: item.name,
    inci: '',
    category: '',
    categoryId: '',
    source: '',
    image: '',
    packSizes: [],
    offers: [],
  }));

  return (
    <ComparisonWorkspace
      selected={selected}
      loaded={loaded}
      workspaceError=""
      saving={false}
      onRetry={() => window.location.reload()}
      onAdd={(p) => (getCompare().some((i) => i.slug === p.slug) ? false : toggleCompare({ slug: p.slug, name: p.name }))}
      onRemove={(p) => {
        removeFromCompare(p.slug);
        notify('Removed from comparison');
      }}
      onClear={() => {
        clearCompare();
        notify('Comparison cleared');
      }}
    />
  );
}
