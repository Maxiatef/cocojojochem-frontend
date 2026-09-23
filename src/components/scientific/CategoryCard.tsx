import Image from 'next/image';
import Link from 'next/link';
import { isOptimisable } from '@/lib/images';

/**
 * A category tile from the "Ingredient catalog" design
 * (Figma rj57PsDgSsbo86iG4RC1SA, node 33:487 — "Category / …").
 *
 * The whole tile is the link rather than just the arrow text: the design draws
 * a bordered card with a call to action inside it, and a card that looks
 * clickable but only responds on its last line is a small, repeated annoyance
 * across twelve of them.
 */
export function CategoryCard({
  href,
  name,
  count,
  imageUrl,
}: {
  href: string;
  name: string;
  count?: number;
  imageUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-6 rounded-xl border border-sci-border bg-white p-6 transition hover:border-sci-blue hover:shadow-sm"
    >
      {imageUrl && (
        // Bleeds to the card edges: the padding belongs to the text, not to a
        // banner sitting above it.
        <div className="relative -mx-6 -mt-6 aspect-[16/9] overflow-hidden rounded-t-xl bg-sci-pale">
          {/* Decorative — the category name is the next line of this same
              link, so alt text here is announced twice over. next/image
              lazy-loads by default and, with `sizes`, fetches a card-sized
              file rather than the multi-megabyte original. */}
          <Image
            src={imageUrl}
            alt=""
            aria-hidden
            fill
            unoptimized={!isOptimisable(imageUrl)}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      )}

      {/* An empty category still needs this row, or its title would sit at a
          different height from its neighbours in the same grid row. */}
      <span className="font-sci-body text-sci-eyebrow font-medium uppercase text-sci-blue">
        {typeof count === 'number' ? `${count} ${count === 1 ? 'product' : 'products'}` : ' '}
      </span>

      <span className="font-sci-heading text-sci-subheading font-semibold text-sci-navy">
        {name}
      </span>

      <span className="mt-auto inline-flex items-center gap-2 font-sci-body text-sci-label font-medium text-sci-blue">
        Browse ingredients
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
