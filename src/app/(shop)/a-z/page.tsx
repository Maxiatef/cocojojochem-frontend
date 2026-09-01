import Link from 'next/link';
import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverFetch';
import { SeoPage } from '@/lib/types';
import { SeoIntro } from '@/components/storefront/SeoIntro';

const HIGHLIGHTS = [
  { icon: 'grid' as const, label: 'Every Ingredient, One List' },
  { icon: 'search' as const, label: 'Jump to Any Letter' },
  { icon: 'tag' as const, label: 'Common & INCI Names' },
  { icon: 'clock' as const, label: 'Updated as We Add Stock' },
];

const INTRO_PARAGRAPHS = [
  "Every wholesale ingredient we carry, listed alphabetically by product name for quick reference. This index is the fastest way to jump straight to a specific raw material if you already know its name, rather than browsing by category or function — useful when you're cross-checking a formulation sheet, restocking a known SKU, or comparing our catalog against a supplier list.",
  "Use the letter navigation below to skip to any section, or use your browser's search (Ctrl/Cmd+F) to find an ingredient by its common or INCI name. Each entry links through to a full product page with specifications, available pack sizes, pricing, and current stock status. If you can't find an ingredient you're looking for, reach out to our sales team — we regularly add new materials as supplier relationships expand.",
];

const DEFAULT_METADATA: Metadata = {
  title: 'A-Z Product Index — CocoJojoChem Wholesale',
  description: 'Browse every wholesale ingredient alphabetically.',
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await serverFetch<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent('/a-z')}`, {
    cache: 'no-store',
  });
  if (!seo || !seo.metaTitle) return DEFAULT_METADATA;
  return {
    title: seo.metaTitle,
    description: seo.metaDescription || DEFAULT_METADATA.description,
    ...(seo.ogImageUrl ? { openGraph: { images: [seo.ogImageUrl] } } : {}),
  };
}

type AZGroup = Record<string, { id: number; name: string; slug: string }[]>;

const ALPHABET = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

export default async function AZIndexPage() {
  const grouped = (await serverFetch<AZGroup>('/wholesale/products/az-index')) || {};
  const available = new Set(Object.keys(grouped));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">Full Catalog</p>
      <h1 className="mt-1 font-display text-4xl text-ink">A-Z Product Index</h1>
      <p className="mt-2 text-sm text-ink-soft">Every wholesale product, alphabetically.</p>

      <SeoIntro highlights={HIGHLIGHTS} paragraphs={INTRO_PARAGRAPHS} />

      <div className="sticky top-20 z-10 mt-8 flex flex-wrap gap-1.5 border-y border-sand-200 bg-sand-50 py-3">
        {ALPHABET.map((letter) =>
          available.has(letter) ? (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="flex h-8 w-8 items-center justify-center text-sm font-medium text-olive-700 hover:bg-olive-100"
            >
              {letter}
            </a>
          ) : (
            <span
              key={letter}
              className="flex h-8 w-8 items-center justify-center text-sm text-sand-400"
            >
              {letter}
            </span>
          ),
        )}
      </div>

      {available.size === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No products found.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {ALPHABET.filter((l) => available.has(l)).map((letter) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-32">
              <h2 className="mb-3 border-b border-sand-200 pb-2 font-display text-xl text-ink">
                {letter}
              </h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 md:grid-cols-3">
                {grouped[letter].map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="truncate py-1 text-sm text-ink-soft hover:text-olive-700 hover:underline"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
