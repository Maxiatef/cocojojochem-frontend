import { Metadata } from 'next';
import { ProductFilterGrid } from '@/components/storefront/ProductFilterGrid';
import { SeoIntro } from '@/components/storefront/SeoIntro';
import { serverFetch } from '@/lib/serverFetch';
import { SeoPage } from '@/lib/types';

const HIGHLIGHTS = [
  { icon: 'flask' as const, label: 'INCI-Accurate Listings' },
  { icon: 'shield' as const, label: 'SDS & COA on Request' },
  { icon: 'check' as const, label: 'Live Stock Status' },
  { icon: 'shipping' as const, label: 'Bulk & Wholesale Pricing' },
];

const INTRO_PARAGRAPHS = [
  "Browse our full wholesale catalog of cosmetic and personal care ingredients, sourced and quality-checked for formulators, private-label brands, and manufacturers. Every listing includes INCI naming, available pack sizes, and current stock status so you can plan production runs with confidence, whether you're sourcing a single raw material or building out a complete formulation.",
  'Filter by category or function to narrow the catalog to actives, emulsifiers, preservatives, botanical extracts, oils, butters, and specialty additives. Each product page lists technical specifications, recommended usage rates, and documentation to help you evaluate fit before you order. Pricing is wholesale throughout, with volume-based breaks available on most items once you meet our order minimum.',
  "New ingredients are added regularly as we expand supplier relationships, so check back often or use the search and sort tools below to find exactly what your formulation needs. Wholesale accounts also get access to sample requests and bulk quote requests directly from any product page, so you can validate a raw material in your lab before committing to a full production order.",
];

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
      <h1 className="mt-1 font-display text-4xl text-ink">All Products</h1>

      <SeoIntro highlights={HIGHLIGHTS} paragraphs={INTRO_PARAGRAPHS} />

      <div className="mt-10">
        <ProductFilterGrid />
      </div>
    </div>
  );
}
