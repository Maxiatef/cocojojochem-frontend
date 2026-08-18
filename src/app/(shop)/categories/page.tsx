import Link from 'next/link';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated } from '@/lib/types';
import { FlaskIcon } from '@/components/icons';

export const metadata = {
  title: 'Categories — CocoJojoChem Wholesale',
  description: 'Browse the full wholesale ingredient catalog by category.',
};

export default async function CategoriesPage() {
  const res = await serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=100');
  const categories = res?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Catalog</p>
      <h1 className="mt-1 font-display text-4xl text-ink">All Categories</h1>
      <p className="mt-2 text-sm text-ink-soft">{categories.length} categories</p>

      {categories.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No categories found.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-px bg-sand-200 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group flex flex-col bg-white transition hover:bg-sand-50"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-sand-100">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <FlaskIcon className="h-8 w-8 text-sand-400" />
                )}
              </div>
              <div className="p-5">
                <p className="font-display text-lg text-ink group-hover:text-olive-700">{c.name}</p>
                {typeof c.productCount === 'number' && (
                  <p className="mt-0.5 text-xs text-ink-soft">{c.productCount} products</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
