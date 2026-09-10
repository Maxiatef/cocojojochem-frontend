import Link from 'next/link';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated } from '@/lib/types';

/**
 * Server-rendered strip of category tiles with images.
 *
 * Exists for two concrete reasons beyond navigation:
 *
 * 1. `/products`, `/functions` and `/a-z` render their listings client-side
 *    (ProductFilterGrid owns the filter URL state), so their server HTML
 *    contained ZERO images and almost no outbound product/category links.
 *    Crawlers saw a near-empty page, and the SEO analyzer scored 0 for
 *    imagery on all three.
 * 2. It's genuinely useful — a buyer landing on a bare filter grid gets an
 *    obvious way into the catalog.
 *
 * Every tile carries real alt text, which is what the analyzer's
 * MISSING_ALT_TEXT check looks for.
 */
export async function CategoryStrip({
  limit = 8,
  heading = 'Browse by Category',
  description,
}: {
  limit?: number;
  heading?: string;
  description?: string;
}) {
  const res = await serverFetch<Paginated<Category>>(`/wholesale/categories?page=1&limit=${limit * 3}`);

  // Only categories that actually have published products — an empty tile is
  // a dead end for a buyer and a soft-404 for a crawler.
  const categories = (res?.data || []).filter((c) => (c.productCount ?? 0) > 0).slice(0, limit);

  if (categories.length === 0) return null;

  return (
    <section className="mt-16 border-t border-sand-200 pt-10">
      <h2 className="font-display text-2xl text-ink">{heading}</h2>
      {description && <p className="mt-2 max-w-3xl text-sm text-ink-soft">{description}</p>}

      <div className="mt-6 grid grid-cols-2 gap-px bg-sand-200 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex items-center gap-3 bg-white px-4 py-3.5 transition hover:bg-sand-50"
          >
            {category.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.imageUrl}
                alt={`${category.name} — wholesale cosmetic ingredients`}
                loading="lazy"
                className="h-12 w-12 shrink-0 object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center bg-sand-100 text-xs font-semibold text-olive-700"
              >
                {category.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink group-hover:text-olive-700">
                {category.name}
              </span>
              <span className="block text-xs text-ink-soft">
                {category.productCount} {category.productCount === 1 ? 'ingredient' : 'ingredients'}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
