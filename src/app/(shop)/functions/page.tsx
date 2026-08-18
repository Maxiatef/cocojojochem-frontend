import Link from 'next/link';
import { serverFetch } from '@/lib/serverFetch';
import { ProductFunction } from '@/lib/types';

export const metadata = {
  title: 'Shop by Function — CocoJojoChem Wholesale',
  description: 'Find ingredients by what they do — anti-aging, antioxidant, humectant, and more.',
};

export default async function FunctionsPage() {
  const functions = (await serverFetch<ProductFunction[]>('/wholesale/functions')) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Targeted Formulation</p>
      <h1 className="mt-1 font-display text-4xl text-ink">Shop by Function</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Find ingredients by what they do, not just what they're called.
      </p>

      {functions.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No functions found.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-px bg-sand-200 sm:grid-cols-2 md:grid-cols-3">
          {functions.map((f) => (
            <Link
              key={f.id}
              href={`/products?functionSlug=${f.slug}`}
              className="flex items-center justify-between bg-white px-5 py-4 transition hover:bg-sand-50"
            >
              <span className="font-medium text-ink">{f.name}</span>
              {typeof f.productCount === 'number' && (
                <span className="text-xs text-ink-soft">{f.productCount} products</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
