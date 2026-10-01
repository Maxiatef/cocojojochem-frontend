import { permanentRedirect } from 'next/navigation';

/**
 * /shop is the prototype's main shop URL. Our catalog lives at /products (its
 * URLs are indexed), so this answers with a permanent redirect there, keeping
 * the query string. The prototype's `?q=` search maps onto our `?search=`.
 */
export default function ShopRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      qs.append(key, v);
    }
  }
  const q = qs.get('q');
  if (q !== null) {
    qs.delete('q');
    if (q && !qs.has('search')) qs.set('search', q);
  }
  const query = qs.toString();
  permanentRedirect(query ? `/products?${query}` : '/products');
}
