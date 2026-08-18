import Link from 'next/link';
import { serverFetch } from '@/lib/serverFetch';

export const metadata = {
  title: 'A-Z Product Index — CocoJojoChem Wholesale',
  description: 'Browse every wholesale ingredient alphabetically.',
};

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
