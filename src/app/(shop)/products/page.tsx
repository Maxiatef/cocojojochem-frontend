import { Metadata } from 'next';
import { ProductFilterGrid } from '@/components/storefront/ProductFilterGrid';
import { serverFetch } from '@/lib/serverFetch';
import { SeoPage } from '@/lib/types';

const DEFAULT_METADATA: Metadata = {
  title: 'All Products — CocoJojoChem Wholesale',
  description: 'Browse the full wholesale ingredient catalog with search, filters, and sorting.',
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/products')}`, {
    cache: 'no-store',
  });
  if (!seo || !seo.metaTitle) return DEFAULT_METADATA;
  return {
    title: seo.metaTitle,
    description: seo.metaDescription || DEFAULT_METADATA.description,
    ...(seo.ogImageUrl ? { openGraph: { images: [seo.ogImageUrl] } } : {}),
  };
}

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Catalog</p>
      <h1 className="mb-8 mt-1 font-display text-4xl text-ink">All Products</h1>
      <ProductFilterGrid />
    </div>
  );
}
