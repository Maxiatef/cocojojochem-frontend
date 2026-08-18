import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatUsd, getDefaultVariant, getPriceRange } from '@/lib/pricing';
import { ImagePlaceholderIcon } from '@/components/icons';

export function ProductCard({ product }: { product: Product }) {
  const defaultVariant = getDefaultVariant(product.variants);
  const range = getPriceRange(product.variants);
  const image = defaultVariant?.imageUrl || product.imageUrl;
  const outOfStock = product.variants.length > 0 && product.variants.every((v) => v.stockStatus !== 'IN_STOCK');

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-sand-100">
        {defaultVariant?.isOnSale && (
          <span className="absolute left-3 top-3 z-10 bg-olive-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Sale
          </span>
        )}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholderIcon className="h-8 w-8 text-sand-400" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3.5">
        {product.category && (
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-olive-600">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 font-display text-base text-ink">{product.name}</h3>
        {product.inciName && (
          <p className="line-clamp-1 text-xs text-ink-soft">{product.inciName}</p>
        )}

        <div className="mt-1 flex items-center justify-between">
          {range ? (
            <span className="text-sm font-semibold text-ink">
              {range.min === range.max ? formatUsd(range.min) : `${formatUsd(range.min)}+`}
            </span>
          ) : (
            <span className="text-sm text-ink-soft">Contact for price</span>
          )}
          {outOfStock && (
            <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
