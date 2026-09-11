import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatUsd, getDefaultVariant, getPriceRange } from '@/lib/pricing';
import { ImagePlaceholderIcon } from '@/components/icons';

/**
 * One record in the ingredient directory
 * (Figma rj57PsDgSsbo86iG4RC1SA, node 21:388 — "CJ-0033 / Beef tallow").
 *
 * The design's row carries only a name, an SKU and two links. This one also
 * shows the product image, its pack sizes and its price range, because the
 * design was drawn against a reference catalogue with no commerce behind it —
 * here every record has variants and a price, and a directory that hides them
 * would send buyers to the detail page to answer "how much, in what size?" for
 * every single row.
 *
 * The design's second link ("Cargill source ↗") has no equivalent in this
 * data and is dropped rather than faked.
 */

/** How many pack sizes to name before collapsing the rest into a count. */
const VISIBLE_VARIANTS = 3;

/** Same, for the functions a material performs in a formulation. */
const VISIBLE_FUNCTIONS = 4;

export function IngredientRow({ product }: { product: Product }) {
  const defaultVariant = getDefaultVariant(product.variants);
  const range = getPriceRange(product.variants);
  const image = defaultVariant?.imageUrl || product.imageUrl;
  const href = `/products/${product.slug}`;

  // "Out of stock" only means something once there are variants to be out of;
  // a product with none is unpriced rather than unavailable.
  const outOfStock =
    product.variants.length > 0 && product.variants.every((v) => v.stockStatus !== 'IN_STOCK');

  // Relation order from the API is not guaranteed, and a row reading
  // "4 Gallon · 1 Gallon · 3 Gallon" looks like a bug. Price ascending is the
  // closest proxy for pack size ascending that holds without parsing labels.
  const ordered = [...product.variants].sort(
    (a, b) => Number(a.effectivePrice ?? a.price) - Number(b.effectivePrice ?? b.price),
  );
  const shown = ordered.slice(0, VISIBLE_VARIANTS);
  const remaining = ordered.length - shown.length;

  const functions = product.functions || [];
  const shownFunctions = functions.slice(0, VISIBLE_FUNCTIONS);
  const remainingFunctions = functions.length - shownFunctions.length;

  return (
    <div className="flex flex-col gap-6 bg-sci-pale p-6 transition hover:bg-[#e7f0f7] md:flex-row md:items-start md:gap-8">
      {/* Image. Decorative here — the product name sits beside it as a link,
          so an alt text repeating that name would be read out twice. */}
      <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholderIcon className="h-6 w-6 text-sci-border" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link
          href={href}
          className="font-sci-heading text-sci-subheading font-semibold text-sci-navy hover:text-sci-blue"
        >
          {product.name}
        </Link>

        <p className="font-sci-body text-sci-eyebrow font-medium uppercase text-sci-muted">
          {product.sku}
          {product.inciName ? ` · ${product.inciName}` : ''}
        </p>

        {/* What the material does in a formulation. Each one links into the
            catalogue filtered to that function, which is the question these
            labels tend to raise — "what else does this job?". Distinct from
            the pack sizes below: tinted rather than bordered, so the two rows
            of chips don't read as one list of interchangeable facts. */}
        {shownFunctions.length > 0 && (
          <ul className="mt-1 flex flex-wrap items-center gap-2">
            {shownFunctions.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/products?functionSlug=${f.slug}`}
                  className="inline-block rounded-full bg-sci-blue/10 px-2.5 py-0.5 font-sci-body text-sci-label font-medium text-sci-blue transition hover:bg-sci-blue/20"
                >
                  {f.name}
                </Link>
              </li>
            ))}
            {remainingFunctions > 0 && (
              <li className="font-sci-body text-sci-label text-sci-muted">
                +{remainingFunctions} more
              </li>
            )}
          </ul>
        )}

        {shown.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-2">
            {shown.map((v) => (
              <li
                key={v.id}
                className={`rounded border border-sci-border bg-white px-2 py-1 font-sci-body text-sci-label ${
                  v.stockStatus === 'IN_STOCK' ? 'text-sci-navy' : 'text-sci-muted line-through'
                }`}
              >
                {v.label}
              </li>
            ))}
            {remaining > 0 && (
              <li className="px-1 py-1 font-sci-body text-sci-label text-sci-muted">
                +{remaining} more
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-3 md:w-[220px] md:items-end md:text-right">
        {range ? (
          <p className="font-sci-heading text-[20px] font-semibold leading-7 text-sci-navy">
            {range.min === range.max
              ? formatUsd(range.min)
              : `${formatUsd(range.min)} – ${formatUsd(range.max)}`}
          </p>
        ) : (
          <p className="font-sci-body text-sci-label text-sci-muted">Contact for price</p>
        )}

        {outOfStock && (
          <p className="font-sci-body text-sci-eyebrow font-medium uppercase text-sci-muted">
            Out of stock
          </p>
        )}

        <Link
          href={href}
          className="group inline-flex items-center gap-2 font-sci-body text-sci-label font-medium text-sci-blue"
        >
          View ingredient
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
