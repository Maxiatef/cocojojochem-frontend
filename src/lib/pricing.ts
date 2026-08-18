import { ProductVariant } from './types';

export function formatUsd(value: string | number): string {
  const num = typeof value === 'string' ? Number(value) : value;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// The variant to show by default on a product card: cheapest in-stock variant,
// falling back to the cheapest variant overall if none are in stock.
export function getDefaultVariant(variants: ProductVariant[]): ProductVariant | null {
  if (!variants.length) return null;
  const inStock = variants.filter((v) => v.stockStatus === 'IN_STOCK');
  const pool = inStock.length ? inStock : variants;
  return pool.reduce((cheapest, v) =>
    Number(v.effectivePrice ?? v.price) < Number(cheapest.effectivePrice ?? cheapest.price) ? v : cheapest,
  );
}

export function getPriceRange(variants: ProductVariant[]): { min: number; max: number } | null {
  if (!variants.length) return null;
  const prices = variants.map((v) => Number(v.effectivePrice ?? v.price));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
