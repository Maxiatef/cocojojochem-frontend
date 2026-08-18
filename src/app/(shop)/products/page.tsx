import { ProductFilterGrid } from '@/components/storefront/ProductFilterGrid';

export const metadata = {
  title: 'All Products — CocoJojoChem Wholesale',
  description: 'Browse the full wholesale ingredient catalog with search, filters, and sorting.',
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Catalog</p>
      <h1 className="mb-8 mt-1 font-display text-4xl text-ink">All Products</h1>
      <ProductFilterGrid />
    </div>
  );
}
