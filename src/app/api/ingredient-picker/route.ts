import { NextRequest, NextResponse } from 'next/server';
import { catalogCategories, categoryImage, type CatalogProduct } from '@/lib/ocean/catalog-data';
import { referenceCatalog } from '@/lib/ocean/references';
import { sourceName } from '@/lib/ocean/supplier-names';
import type { ProductMini } from '@/lib/ocean/store-types';

/**
 * Ingredient picker for the comparison workspace (reference app/api/ingredient-picker).
 * Pages through the supplier references only — the reference site's own
 * "cocojojo" products are excluded (ours come from our backend).
 *
 *   ?q=        name / INCI / CAS / supplier / function (max 100 chars)
 *   ?category= category id
 *   ?letter=   A–Z or "#"
 *   ?page=     1-based, 12 per page
 */
const pageSize = 12;

const categories = catalogCategories
  .map((category) => ({ ...category, count: referenceCatalog.filter((p) => p.categoryId === category.id).length }))
  .filter((category) => category.count);

function mini(p: CatalogProduct): ProductMini {
  return {
    slug: p.slug,
    name: p.name,
    inci: p.inci,
    category: p.category,
    categoryId: p.categoryId,
    source: p.source,
    image: categoryImage(p.categoryId),
    packSizes: p.packSizes,
    // The reference reads store offers from its own database; supplier
    // references carry no price on our store ("Price to confirm").
    offers: [],
    facts: p.facts,
    identityReference: p.identityReference,
    identityReview: p.identityReview,
    supplierIdentityReference: p.supplierIdentityReference,
    phase: p.extra.phase,
    application: p.extra.applications || [],
  };
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get('q') || '').trim().slice(0, 100).toLowerCase();
  const category = params.get('category') || '';
  const letter = (params.get('letter') || '').toUpperCase();
  const matches = referenceCatalog
    .filter((p) => {
      const first = /^[a-z]/i.test(p.name) ? p.name[0].toUpperCase() : '#';
      return (
        (!category || p.categoryId === category) &&
        (!letter || first === letter) &&
        (!query ||
          [p.name, p.inci, p.facts.cas, sourceName(p.source), ...p.functions].join(' ').toLowerCase().includes(query))
      );
    })
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name, 'en', { numeric: true }) ||
        sourceName(a.source).localeCompare(sourceName(b.source)),
    );
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.max(1, Math.min(pages, Math.floor(Number(params.get('page')) || 1)));
  return NextResponse.json(
    {
      products: matches.slice((page - 1) * pageSize, page * pageSize).map(mini),
      total: matches.length,
      page,
      pages,
      categories,
    },
    { headers: { 'Cache-Control': 'public, max-age=60' } },
  );
}
