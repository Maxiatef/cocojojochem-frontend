import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Category } from '@/lib/types';
import { ProductFilterGrid } from '@/components/storefront/ProductFilterGrid';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await serverFetch<Category>(`/wholesale/categories/${params.slug}`);
  if (!category) return { title: 'Category — CocoJojoChem Wholesale' };
  return {
    title: `${category.name} — CocoJojoChem Wholesale`,
    description: category.description || `Shop wholesale ${category.name} ingredients.`,
  };
}

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const category = await serverFetch<Category>(`/wholesale/categories/${params.slug}`);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <nav className="mb-3 text-xs text-ink-soft">
        <a href="/categories" className="hover:text-olive-700">Categories</a> / {category.name}
      </nav>
      <h1 className="font-display text-4xl text-ink">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-sm text-ink-soft">{category.description}</p>}

      <div className="mt-8">
        <ProductFilterGrid fixedCategoryId={category.id} />
      </div>
    </div>
  );
}
