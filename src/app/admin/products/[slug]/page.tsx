import { redirect } from 'next/navigation';

/**
 * The separate read-only product page is gone — the editor at ./edit is now
 * both the view and the edit surface, and the product list opens it directly.
 *
 * This redirect stays because /admin/products/<slug> is a URL shape people
 * have bookmarked and pasted to each other; dropping the route outright would
 * turn every one of those into a 404 for no benefit.
 */
export default function ProductPage({ params }: { params: { slug: string } }) {
  redirect(`/admin/products/${params.slug}/edit`);
}
