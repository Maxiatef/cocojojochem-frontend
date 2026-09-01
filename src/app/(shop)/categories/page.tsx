import Link from 'next/link';
import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated, SeoPage } from '@/lib/types';
import { FlaskIcon } from '@/components/icons';
import { SeoIntro } from '@/components/storefront/SeoIntro';

const HIGHLIGHTS = [
  { icon: 'grid' as const, label: 'Browse by Ingredient Class' },
  { icon: 'leaf' as const, label: 'Actives to Botanicals' },
  { icon: 'tag' as const, label: 'Live Product Counts' },
  { icon: 'search' as const, label: 'Compare Materials Fast' },
];

const DEFAULT_METADATA: Metadata = {
  title: 'Categories — CocoJojoChem Wholesale',
  description: 'Browse the full wholesale ingredient catalog by category.',
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/categories')}`, {
    cache: 'no-store',
  });
  if (!seo || !seo.metaTitle) return DEFAULT_METADATA;
  return {
    title: seo.metaTitle,
    description: seo.metaDescription || DEFAULT_METADATA.description,
    ...(seo.ogImageUrl ? { openGraph: { images: [seo.ogImageUrl] } } : {}),
  };
}

export default async function CategoriesPage() {
  const res = await serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=100');
  const categories = res?.data || [];

  const introParagraphs = [
    `We organize our wholesale ingredient catalog into ${categories.length} categories, covering everything from actives and acids to botanical extracts, oils, butters, emulsifiers, preservatives, and specialty additives. Browsing by category is the quickest way to compare materials within the same functional class — for example, weighing different humectants against each other, or reviewing every preservative system we stock before choosing one for a new formulation.`,
    'Each category page lists every product currently available in that group, along with live stock status and wholesale pricing. Categories are updated as we add new ingredients, so the count above reflects our current live catalog. Select a category below to see the full product list, or use the A-Z index or product search if you already know the specific ingredient you need.',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Catalog</p>
      <h1 className="mt-1 font-display text-4xl text-ink">All Categories</h1>
      <p className="mt-2 text-sm text-ink-soft">{categories.length} categories</p>

      <SeoIntro highlights={HIGHLIGHTS} paragraphs={introParagraphs} />

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
