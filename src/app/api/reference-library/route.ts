import { NextRequest, NextResponse } from 'next/server';
import { getReferenceCategories, getReferenceLibrary, referenceCategoryId } from '@/lib/gloss/referenceLibrary';

/**
 * The supplier reference library, filtered and paged for the catalog's
 * "Supplier reference library" view and the "All ingredients" strip.
 *
 * A route handler so the ~250 KB list stays on the server: the browser only
 * receives the page it shows. The data is static, so responses cache well.
 *
 *   ?search=  name / INCI / item code
 *   ?category= category id (see referenceCategoryId)
 *   ?letter=  A–Z or "#"
 *   ?sort=    az (default) | za
 *   ?page= & ?limit= (max 48)
 */
export function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const search = (params.get('search') || '').trim().toLowerCase();
  const category = params.get('category') || '';
  const letter = (params.get('letter') || '').toUpperCase();
  const sort = params.get('sort') === 'za' ? 'za' : 'az';
  const limit = Math.min(Math.max(Number(params.get('limit')) || 24, 1), 48);
  const page = Math.max(Number(params.get('page')) || 1, 1);

  let rows = getReferenceLibrary().filter((e) => {
    if (category && referenceCategoryId(e.category) !== category) return false;
    if (letter) {
      const first = e.name.charAt(0).toUpperCase();
      if (letter === '#' ? /[A-Z]/.test(first) : first !== letter) return false;
    }
    if (search) {
      const hay = `${e.name} ${e.inci || ''} ${e.slug}`.toLowerCase();
      if (!search.split(/\s+/).every((word) => hay.includes(word))) return false;
    }
    return true;
  });

  rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'za') rows.reverse();

  const total = rows.length;
  return NextResponse.json(
    {
      data: rows.slice((page - 1) * limit, page * limit),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      categories: getReferenceCategories(),
    },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=86400' } },
  );
}
