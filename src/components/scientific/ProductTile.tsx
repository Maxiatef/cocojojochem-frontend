import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatUsd, getDefaultVariant, getPriceRange } from '@/lib/pricing';
import { ImagePlaceholderIcon } from '@/components/icons';
import { WishlistButton } from '@/components/scientific/WishlistButton';

/**
 * One product in the catalog grid, in the Scientific edition.
 *
 * Structurally the same card the storefront had — image, category, name,
 * INCI, price — but bounded: the old version was a bare column of text under
 * a bleeding image, which at three or four across left the rows reading as
 * one continuous block. The border and the white ground on `sci-pale` give
 * each record an edge, which is what the rest of this design system does.
 *
 * The whole tile is the link. A card whose only target is the title makes
 * people aim at ten characters of text when the obvious target is the image.
 */
export function ProductTile({ product }: { product: Product }) {
  const defaultVariant = getDefaultVariant(product.variants);
  const range = getPriceRange(product.variants);
  const image = defaultVariant?.imageUrl || product.imageUrl;

  // "Out of stock" only means something once there are variants to be out of;
  // a product with none is unpriced rather than unavailable.
  const outOfStock =
    product.variants.length > 0 && product.variants.every((v) => v.stockStatus !== 'IN_STOCK');

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-sci-border bg-white transition hover:border-sci-blue hover:shadow-sm"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-sci-pale">
        {defaultVariant?.isOnSale && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-sci-accent px-2.5 py-1 font-sci-body text-[11px] font-semibold uppercase tracking-wide text-sci-navy">
            Sale
          </span>
        )}
        {/* Top-right, opposite the Sale flag so the two never collide. The
            button stops its own click from reaching the tile's link. */}
        <WishlistButton productId={product.id} className="absolute right-3 top-3 z-10" />

        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${product.name} wholesale cosmetic ingredients`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholderIcon className="h-8 w-8 text-sci-border" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category && (
          <span className="font-sci-body text-sci-eyebrow font-medium uppercase text-sci-blue">
            {product.category.name}
          </span>
        )}

        <h3 className="line-clamp-2 font-sci-heading text-[17px] font-semibold leading-6 text-sci-navy">
          {product.name}
        </h3>

        {product.inciName && (
          <p className="line-clamp-1 font-sci-body text-sci-label text-sci-muted">
            {product.inciName}
          </p>
        )}

        {/* `mt-auto` pins the price row to the bottom edge, so prices line up
            across a row whose titles wrap to different heights. */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          {range ? (
            <span className="font-sci-heading text-[18px] font-semibold leading-6 text-sci-navy">
              {range.min === range.max ? formatUsd(range.min) : `${formatUsd(range.min)}+`}
            </span>
          ) : (
            <span className="font-sci-body text-sci-label text-sci-muted">Contact for price</span>
          )}
          {outOfStock && (
            <span className="font-sci-body text-sci-eyebrow font-medium uppercase text-sci-muted">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
