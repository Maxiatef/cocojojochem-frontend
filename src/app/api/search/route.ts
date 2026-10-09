import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/serverFetch';
import { productImage } from '@/lib/gloss/images';
import type { Product } from '@/lib/types';
import { referenceCatalog } from '@/lib/ocean/references';
import { categoryImage } from '@/lib/ocean/catalog-data';
import { packagingCatalog } from '@/lib/ocean/packaging-data';
import { sourceName } from '@/lib/ocean/supplier-names';
import type { SearchSuggestion } from '@/components/ocean/OceanSearchBox';

/**
 * Suggestions for the ocean search box (reference app/api/search): up to 7
 * matches, our own products first, then supplier references.
 *
 *   ?q=      at least 2 characters
 *   ?scope=  packaging | ingredients | all (default)
 *
 * Ranking as in the reference: exact name, name prefix, name contains, then
 * a match on INCI / CAS / functions / specifications.
 */
const LIMIT = 7;

function rank(name: string, extra: string, q: string) {
  const n = name.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.includes(q)) return 2;
  return extra.toLowerCase().includes(q) ? 3 : 9;
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim().slice(0, 100).toLowerCase();
  if (q.length < 2) return NextResponse.json({ products: [] });
  const scope = req.nextUrl.searchParams.get('scope') || 'all';

  const ours: SearchSuggestion[] = [];
  if (scope !== 'packaging') {
    const res = await serverFetch<{ data: Product[] }>(
      `/wholesale/products?search=${encodeURIComponent(q)}&limit=${LIMIT}`,
      { revalidate: 60 },
    );
    for (const p of res?.data || [])
      ours.push({ slug: p.slug, name: p.name, image: productImage(p), href: '/products/' + p.slug, label: 'COCOJOJO ingredient' });
  }

  const scored: { s: SearchSuggestion; n: number }[] = [];
  if (scope !== 'ingredients')
    for (const p of packagingCatalog) {
      const n = rank(p.name, [p.subtype, ...Object.values(p.specifications), sourceName(p.source)].join(' '), q);
      if (n < 9)
        scored.push({
          n,
          s: { slug: p.slug, name: p.name, image: p.image, href: '/packaging/' + p.slug, label: 'Packaging · ' + sourceName(p.source) },
        });
    }
  if (scope !== 'packaging')
    for (const p of referenceCatalog) {
      const n = rank(p.name, [p.inci, p.facts?.cas, p.manufacturer, p.supplierProductId, ...(p.functions || [])].join(' '), q);
      if (n < 9)
        scored.push({
          n,
          s: { slug: p.slug, name: p.name, image: categoryImage(p.categoryId), href: '/products/' + p.slug, label: sourceName(p.source) + ' reference' },
        });
    }
  scored.sort((a, b) => a.n - b.n);

  const seen = new Set(ours.map((s) => s.slug));
  const products = [...ours, ...scored.map((x) => x.s).filter((s) => !seen.has(s.slug))].slice(0, LIMIT);
  return NextResponse.json({ products }, { headers: { 'Cache-Control': 'public, max-age=60' } });
}
