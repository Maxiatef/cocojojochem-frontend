import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Product } from '@/lib/types';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';
import { ProductCard } from '@/components/storefront/ProductCard';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await serverFetch<Product>(`/wholesale/products/${params.slug}`, { cache: 'no-store' });
  if (!product) return { title: 'Product — CocoJojoChem Wholesale' };
  return {
    title: `${product.name} — CocoJojoChem Wholesale`,
    description: product.shortDescription || `Wholesale ${product.name} — bulk pricing and sizes.`,
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await serverFetch<Product>(`/wholesale/products/${params.slug}`, { cache: 'no-store' });
  if (!product) notFound();

  const related = await serverFetch<Product[]>(`/wholesale/products/${params.slug}/related?limit=4`, {
    cache: 'no-store',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <nav className="mb-6 text-xs text-ink-soft">
        <a href="/products" className="hover:text-olive-700">Products</a> / {product.name}
      </nav>

      <ProductDetailClient product={product} />

      {related && related.length > 0 && (
        <section className="mt-20 border-t border-sand-200 pt-12">
          <h2 className="mb-8 font-display text-2xl text-ink">You May Also Need</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
