import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated, Product } from '@/lib/types';
import { ProductFilterGrid } from '@/components/storefront/ProductFilterGrid';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { SITE_NAME, clampDescription, pageMetadata } from '@/lib/seo';

function categoryKeywords(name: string): string[] {
  const lower = name.toLowerCase();
  return [
    name,
    `wholesale ${lower}`,
    `bulk ${lower}`,
    `${lower} supplier`,
    `buy ${lower} in bulk`,
    `${lower} for cosmetics`,
    `${lower} raw materials`,
  ];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await serverFetch<Category>(`/wholesale/categories/${params.slug}`);

  if (!category) {
    return pageMetadata({
      title: 'Category Not Found',
      description: `Browse the full ${SITE_NAME} wholesale cosmetic ingredient catalog by category.`,
      path: `/categories/${params.slug}`,
      noIndex: true,
    });
  }

  const count = category.productCount ?? 0;
  return pageMetadata({
    title: `Wholesale ${category.name}`,
    description: clampDescription(
      category.description,
      `Shop ${count > 0 ? `${count} ` : ''}wholesale ${category.name.toLowerCase()} in bulk and drum quantities. Trade pricing, INCI and spec data, fast US shipping from ${SITE_NAME}.`,
    ),
    path: `/categories/${category.slug}`,
    keywords: categoryKeywords(category.name),
    images: [category.imageUrl],
  });
}

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const category = await serverFetch<Category>(`/wholesale/categories/${params.slug}`);
  if (!category) notFound();

  // The visible grid is client-rendered by ProductFilterGrid (it owns the
  // filter/sort URL state), so crawlers see no products in the initial HTML.
  // This server-side fetch exists purely to emit an ItemList of what's in the
  // category, giving search engines the collection they'd otherwise miss.
  const productsRes = await serverFetch<Paginated<Product>>(
    `/wholesale/products?categoryId=${category.id}&page=1&limit=50`,
  );
  const products = productsRes?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Categories', path: '/categories' },
            { name: category.name, path: `/categories/${category.slug}` },
          ]),
          ...(products.length
            ? [
                itemListSchema({
                  name: `Wholesale ${category.name}`,
                  path: `/categories/${category.slug}`,
                  items: products.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
                }),
              ]
            : []),
        ]}
      />

      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink-soft">
        <Link href="/categories" className="hover:text-olive-700">
          Categories
        </Link>
        {' / '}
        <span>{category.name}</span>
      </nav>
      <h1 className="font-display text-4xl text-ink">Wholesale {category.name}</h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">{category.description}</p>
      )}

      <div className="mt-8">
        <ProductFilterGrid fixedCategoryId={category.id} />
      </div>

      {/* Crawlable links to every product in this category. The filter grid
          above is client-side, so without this the category page has no
          outbound product links in its server HTML for a crawler to follow. */}
      {products.length > 0 && (
        <nav aria-label={`All ${category.name} products`} className="mt-16 border-t border-sand-200 pt-8">
          <h2 className="mb-4 text-sm font-semibold text-ink">All {category.name}</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-soft">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} className="hover:text-olive-700 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
