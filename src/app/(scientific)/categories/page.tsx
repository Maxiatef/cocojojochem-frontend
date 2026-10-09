import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { clampDescription, pageMetadata } from '@/lib/seo';
import { Category, Paginated, SeoPage } from '@/lib/types';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import CategoryGallery from '@/components/ocean/categories/category-gallery';
import { categoryDescription, categoryImage, ingredientCategories } from '@/lib/ocean/catalog-data';
import { referenceCatalog } from '@/lib/ocean/references';
import { packagingCategory } from '@/lib/ocean/packaging-data';

/**
 * Ingredient categories, in the ocean design (reference `/categories`): the
 * animated CategoryGallery — "CATEGORIES" title, atmosphere canvas, and one
 * card per ingredient family plus Packaging.
 *
 * As on the reference, the cards are the reference taxonomy's ingredient
 * families and open the filtered catalog (/products?category=<id>); counts are
 * the supplier references in each family (the reference's own products are
 * excluded). Our backend categories still feed the JSON-LD, and keep their
 * indexable /categories/<slug> pages.
 */

const DEFAULT_METADATA: Metadata = {
  title: 'Ingredient Categories',
  description:
    'Shop wholesale cosmetic ingredients by category — carrier oils, butters and waxes, emulsifiers, surfactants, acids, actives and peptides, all in bulk quantities.',
};

export async function generateMetadata(): Promise<Metadata> {
    // Cached for 5 minutes rather than no-store. no-store made the whole page
    // render per request (~1.4 s on the server), and Next streamed the loading
    // spinner first with the real hero after it — a 1.7 s LCP render delay on
    // /functions. SEO text edited in the admin still shows within 5 minutes.
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/categories')}`, {
    revalidate: 300,
  });
  return pageMetadata({
    title: seo?.metaTitle || (DEFAULT_METADATA.title as string),
    description: clampDescription(seo?.metaDescription, DEFAULT_METADATA.description as string),
    path: '/categories',
    keywords: [
      'cosmetic ingredient categories',
      'wholesale carrier oils',
      'bulk butters and waxes',
      'wholesale emulsifiers',
      'bulk surfactants',
      'cosmetic actives and peptides',
    ],
    images: [seo?.ogImageUrl],
  });
}

export default async function CategoriesPage() {
  const res = await serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=100&rootsOnly=true');
  const categories = res?.data || [];

  const galleryCategories = [
    ...ingredientCategories.map((c) => ({
      id: c.id,
      label: c.label,
      image: categoryImage(c.id),
      description: categoryDescription(c.id),
      count: referenceCatalog.filter((p) => p.categoryId === c.id).length,
    })),
    packagingCategory,
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Categories', path: '/categories' },
          ]),
          ...(categories.length
            ? [
                itemListSchema({
                  name: 'Wholesale Ingredient Categories',
                  path: '/categories',
                  items: categories.map((c) => ({
                    name: c.name,
                    path: `/categories/${c.slug}`,
                  })),
                }),
              ]
            : []),
        ]}
      />

      <CategoryGallery categories={galleryCategories} />
    </>
  );
}
