import Link from 'next/link';

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
}: {
  href: string;
  name: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-6 rounded-xl border border-sci-border bg-white p-6 transition hover:border-sci-blue hover:shadow-sm"
    >
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
