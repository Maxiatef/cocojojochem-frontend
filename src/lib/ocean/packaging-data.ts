import products from "./data/packaging-products.json";
import type { CatalogProduct } from "./catalog-data";

export type PackagingProduct = CatalogProduct & {
  kind: "packaging";
  subtype: string;
  image: string;
  imageNote: string;
  specifications: Record<string, string>;
};
export const packagingCatalog = products as PackagingProduct[];
export const packagingTypes = [...new Set(packagingCatalog.map((p) => p.subtype))].sort();
export const packagingCategory = {
  id: "packaging",
  label: "Packaging",
  href: "/packaging",
  image: "/assets/packaging/airless-jar-acrylic.jpg",
  description: "Bottles, jars, dispensers and closures for your next cosmetic product.",
  count: packagingCatalog.length,
  unit: "packaging references",
};
export const packagingMatches = (p: PackagingProduct, q: string) =>
  [p.name, p.subtype, ...Object.values(p.specifications)].join(" ").toLowerCase().includes(q.toLowerCase());
