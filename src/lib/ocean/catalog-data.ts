import originals from "./data/products-data.json";
import directory from "./data/ingredient-directory-data.json";
import rawFacts from "./data/ingredient-facts-data.json";
import rawTaxonomy from "./data/ingredient-taxonomy.json";
import rawExtra from "./data/ingredient-extra-data.json";
import supplierProducts from "./supplier-products-loader";
import coverage from "./data/supplier-coverage.json";
import { sourceName } from "./supplier-names";
import identityData from "./data/ingredient-identity-data.json";
import functionAdditions from "./data/function-additions.json";

export type TechnicalFacts = {
  inci?: string | null;
  cas?: string | null;
  appearance?: string | null;
  solubility?: string | null;
  useLevel?: string | null;
  note?: string | null;
};
export type ExtraFacts = {
  phase?: string | null;
  materialPH?: string | null;
  formulationPH?: string | null;
  meltingPoint?: string | null;
  temperature?: string | null;
  storage?: string | null;
  shelfLife?: string | null;
  applications?: string[];
  documents?: { title: string; url: string }[];
};
export type IdentityReference = {
  inci?: string;
  cas?: string;
  ec?: string;
  functions?: string[];
  description?: string;
  sourceName: string;
  sourceUrl: string;
  matchBasis: string;
  reviewedAt: string;
  note?: string;
  filledFields?: string[];
};
export type IdentityReview = { message: string; casWithheld?: boolean };
export type FunctionReference = {
  functions: string[];
  sourceName: string;
  sourceUrl: string;
  note?: string;
  reviewedAt: string;
};
export type SupplierIdentityReference = {
  cas: string;
  components: { name: string; cas: string }[];
  sourceName: string;
  sourceUrl: string;
  reviewedAt: string;
  note: string;
  filledCAS?: boolean;
};
export type CatalogProduct = {
  slug: string;
  id: string;
  name: string;
  inci: string;
  category: string;
  categoryId: string;
  functions: string[];
  browsingFunctions?: string[];
  functionReference?: FunctionReference;
  description: string;
  packSizes: string[];
  sourceUrl: string;
  source: string;
  letter: string;
  facts: TechnicalFacts;
  extra: ExtraFacts;
  manufacturer?: string;
  supplierProductId?: string;
  reviewedAt?: string;
  recordType?: "product-family";
  sourceUrlType?: "listing";
  identityReference?: IdentityReference;
  identityReview?: IdentityReview;
  supplierIdentityReference?: SupplierIdentityReference;
};
export type IngredientCategory = { id: string; label: string; description?: string };
const taxonomy = rawTaxonomy as {
  categories: IngredientCategory[];
  byId: Record<string, { category: string; tags: string[]; classificationBasis: string }>;
};
export const ingredientCategories = taxonomy.categories;
export const catalogCategories = ingredientCategories;
export type SupplierCoverage = {
  id: string;
  name: string;
  homepage: string;
  catalogUrl: string;
  status: string;
  coverageNote: string;
  reportedTotal: number | null;
  discoveredCount: number;
  importedCount: number;
  productFamilyCount?: number;
};
export const supplierCoverage = coverage as { reviewedAt: string; sources: SupplierCoverage[] };
export const facts = rawFacts.byId as Record<string, TechnicalFacts>;
const extras = (rawExtra as { byId: Record<string, ExtraFacts> }).byId;
export const categoryAliases: Record<string, string> = {
  "Natural oils": "carrier-oils",
  "Active ingredients": "actives-vitamins",
  "Texture builders": "rheology",
  "Botanical waters": "botanicals",
  "Cleansing ingredients": "surfactants",
  "Butters & waxes": "butters-waxes",
};
export const categoryImage = (id: string) =>
  "/assets/ingredients/" +
  ({
    "carrier-oils": "oils",
    aromatics: "oils",
    "emollients-conditioners": "texture",
    "actives-vitamins": "actives",
    botanicals: "botanicals",
    "butters-waxes": "butters",
    emulsifiers: "texture",
    surfactants: "cleansing",
    rheology: "texture",
    humectants: "botanicals",
    preservation: "actives",
    "colors-minerals": "actives",
    "bases-kits": "butters",
    "exfoliants-acids": "actives",
    "proteins-peptides": "texture",
    "formulation-aids": "actives",
    chelators: "actives",
    "ph-adjusters": "texture",
    solvents: "oils",
    "film-formers": "texture",
    "uv-filters": "actives",
    deodorants: "actives",
    "oral-care": "cleansing",
    antioxidants: "botanicals",
    "hair-color-perm": "texture",
  }[id] || "actives") +
  ".webp";
export function categoryLabel(id: string) {
  return catalogCategories.find((c) => c.id === id)?.label || "Specialty ingredients";
}
const familyCopy: Record<string, string> = {
  "carrier-oils": "Explore carrier oils and emollient materials for the oil phase of cosmetic formulations.",
  aromatics:
    "Explore aromatic ingredients and review application-specific use requirements in the supplier documentation.",
  "actives-vitamins": "Explore cosmetic actives and vitamins for targeted skin and hair care development.",
  botanicals:
    "Explore botanical extracts. The carrier, extraction method and concentration are important when selecting a grade.",
  "butters-waxes": "Explore butters and waxes for the texture, structure and feel of cosmetic products.",
  emulsifiers: "Explore ingredients used to combine or disperse phases in cosmetic systems.",
  surfactants:
    "Explore cleansing and surface-active materials, with grade-specific processing and compatibility information.",
  rheology: "Explore ingredients for adjusting viscosity, structure and the sensory properties of a formula.",
  humectants: "Explore moisture-binding ingredients and hydration-focused formulation materials.",
  preservation:
    "Explore preservation and oxidation-control materials. Finished-product validation depends on the complete formulation.",
  "colors-minerals":
    "Explore pigments, colors and mineral materials. Review suitability for the intended application and market.",
  "bases-kits": "Explore preblended cosmetic bases and ready-to-customize formulation starting points.",
  "exfoliants-acids":
    "Explore exfoliating materials and review concentration, processing and application requirements.",
  "emollients-conditioners":
    "Explore emollients and conditioning agents for the feel and finish of personal-care formulas.",
  "proteins-peptides": "Explore proteins and conditioning materials for skin and hair formulation.",
  "formulation-aids": "Explore specialty cosmetic ingredients and formulation materials.",
};
export function categoryDescription(id: string) {
  return ingredientCategories.find((c) => c.id === id)?.description || familyCopy[id] || familyCopy["formulation-aids"];
}
const referenceProducts: CatalogProduct[] = directory.entries.map((e) => {
  const t = taxonomy.byId[e.id];
  const categoryId = t?.category || "formulation-aids";
  const f = facts[e.id] || {};
  return {
    id: e.id,
    slug: e.id.toLowerCase(),
    name: e.name,
    inci: f.inci || "",
    category: categoryLabel(categoryId),
    categoryId,
    functions: [...new Set((t?.tags || []).map((tag) => tag.replace(/ in bulk size$/i, "")))],
    description: categoryDescription(categoryId),
    packSizes: ["Discuss quantity"],
    sourceUrl: e.url,
    source: "makingcosmetics",
    letter: e.letter,
    facts: f,
    extra: extras[e.id] || {},
  };
});
const cocoProducts: CatalogProduct[] = originals.map((p) => {
  const categoryId = categoryAliases[p.category] || "formulation-aids";
  return {
    ...p,
    id: p.slug,
    source: "cocojojo",
    letter: p.name.charAt(0).toUpperCase(),
    categoryId,
    facts: { inci: p.inci },
    extra: {},
  };
});
const externalProducts = (supplierProducts as CatalogProduct[]).map((p) => ({
  ...p,
  category: categoryLabel(p.categoryId),
  description: `${p.name} is ${p.recordType === "product-family" ? "a product family" : "a product"} listed by ${sourceName(p.source)}. Review the original supplier listing for the current grade, specifications and intended applications.`,
  packSizes: ["Discuss quantity"],
  letter: /^[A-Z]/i.test(p.name) ? p.name[0].toUpperCase() : "#",
}));
const identityBySlug = identityData.bySlug as Record<string, IdentityReference>;
const identityReviews = identityData.reviewBySlug as Record<string, IdentityReview>;
const supplierIdentities =
  (identityData as { supplierBySlug?: Record<string, SupplierIdentityReference> }).supplierBySlug || {};
const additionalFunctions = functionAdditions.bySlug as Record<string, FunctionReference>;
const uniqueFunctions = (values: string[]) => [
  ...new Map(values.map((value) => [value.toLowerCase(), value])).values(),
];
export const catalog: CatalogProduct[] = [...cocoProducts, ...referenceProducts, ...externalProducts].map(
  (original) => {
    const review = identityReviews[original.slug];
    const supplier = supplierIdentities[original.slug];
    const filledCAS = !!supplier && !original.facts.cas && !review?.casWithheld;
    const identity = identityBySlug[original.slug];
    const functionReference = identity?.functions?.length
      ? {
          functions: identity.functions,
          sourceName: identity.sourceName,
          sourceUrl: identity.sourceUrl,
          reviewedAt: identity.reviewedAt,
          note: identity.note,
        }
      : additionalFunctions[original.slug];
    const p = {
      ...original,
      browsingFunctions: original.functions,
      functions: uniqueFunctions([...original.functions, ...(functionReference?.functions || [])]),
      functionReference,
      facts: { ...original.facts, ...(review?.casWithheld ? { cas: null } : filledCAS ? { cas: supplier.cas } : {}) },
      ...(supplier ? { supplierIdentityReference: { ...supplier, filledCAS } } : {}),
    };
    const reference = identityBySlug[p.slug];
    if (!reference) return { ...p, identityReview: review };
    const filledFields = [
      ...(!p.inci && reference.inci ? ["inci"] : []),
      ...(!p.facts.cas && reference.cas && !review?.casWithheld ? ["cas"] : []),
      ...(!original.functions.length && reference.functions?.length ? ["functions"] : []),
    ];
    return {
      ...p,
      inci: p.inci || reference.inci || "",
      facts: {
        ...p.facts,
        ...(!p.facts.cas && reference.cas && !review?.casWithheld ? { cas: reference.cas } : {}),
        ...(!p.facts.inci && reference.inci ? { inci: reference.inci } : {}),
      },
      functions: p.functions.length ? p.functions : reference.functions || [],
      identityReference: { ...reference, filledFields },
      identityReview: review,
    };
  },
);
export const referenceCount = referenceProducts.length + externalProducts.length;
export const supplierCounts = catalog.reduce<Record<string, number>>((counts, p) => {
  counts[p.source] = (counts[p.source] || 0) + 1;
  return counts;
}, {});
export const findIngredient = (slug: string) => catalog.find((p) => p.slug === slug);
export const ingredientHref = (p: CatalogProduct) => "/products/" + p.slug;
export function normalizeCategory(value: string) {
  return categoryAliases[value] || ingredientCategories.find((c) => c.label === value)?.id || value;
}
