const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// For Server Components — plain fetch with Next's cache/revalidate controls,
// separate from the client `api`/`customerApi` (those exist for client mutations
// and don't need response caching).
export async function serverFetch<T>(
  path: string,
  options: { revalidate?: number; cache?: 'no-store' } = {},
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...(options.cache === 'no-store'
        ? { cache: 'no-store' }
        : { next: { revalidate: options.revalidate ?? 3600 } }),
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
