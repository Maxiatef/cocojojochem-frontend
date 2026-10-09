import type { IdentityReference, IdentityReview, SupplierIdentityReference } from "./catalog-data";
export type Offer = {
  id: string;
  slug: string;
  label: string;
  price: number | null;
  stock: string;
  lead: string;
  stripePrice?: string | null;
  updated?: string;
};
export type ProductMini = {
  slug: string;
  name: string;
  inci: string;
  category: string;
  categoryId: string;
  source: string;
  image: string;
  kind?: "packaging";
  specifications?: Record<string, string>;
  packSizes: string[];
  offers: Offer[];
  facts?: { cas?: string | null; solubility?: string | null; useLevel?: string | null; appearance?: string | null };
  phase?: string | null;
  application?: string[];
  identityReference?: IdentityReference;
  identityReview?: IdentityReview;
  supplierIdentityReference?: SupplierIdentityReference;
};
export type CartLine = { slug: string; offerId: string; quantity: number; requestedSize?: string };
export type Project = { id: string; name: string; slugs: string[]; notes: string; updated: string };
export type StoreState = { cart: CartLine[]; saved: string[]; compare: string[]; projects: Project[] };
export const MAX_COMPARISON_ITEMS = 7;
export const emptyState: StoreState = { cart: [], saved: [], compare: [], projects: [] };
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export const productHref = (p: { slug: string; categoryId?: string }) =>
  (p.categoryId === "packaging" || p.slug.startsWith("packaging-") ? "/packaging/" : "/products/") + p.slug;
