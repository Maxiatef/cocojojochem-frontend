import "server-only";
import type { CatalogProduct } from "./catalog-data";
import type { ComparisonChemical, CoreProperties, PropertyValue } from "./comparison-types";
import chemicalData from "./chemical-properties-loader";
import { sourceName } from "./supplier-names";

const data = chemicalData as {
  bySlug: Record<string, { cas: string; supplierCASVerified?: boolean }>;
  byCAS: Record<string, ComparisonChemical>;
};
const missing = (note: string): PropertyValue => ({
  value: "Not verified for this material",
  status: "not-verified",
  note,
});
export function materialProperties(p: CatalogProduct) {
  const match = p.categoryId === "packaging" || p.identityReview?.casWithheld ? undefined : data.bySlug[p.slug];
  const raw = match ? data.byCAS[match.cas] : undefined;
  const chemical = raw
    ? {
        ...raw,
        properties: Object.fromEntries(
          Object.entries(raw.properties).filter(
            ([, o]) => o.value.trim() && !/^(?:g\/cm[³3]|g\/mL|kg\/m[³3])$/i.test(o.value.trim()),
          ),
        ),
      }
    : undefined;
  const text = [p.name, p.inci, p.slug].join(" ");
  const polymer =
    !chemical &&
    /\b(?:carbomer|hyaluronate|hyaluronic|xanthan|cellulose|carrageenan|alginate|polyacrylate|polyvinyl|dimethicone|polysilicone|polyquaternium|polyethylene|polypropylene|peg-\d|ppg-\d)\b/i.test(
      text,
    );
  const blend =
    !chemical &&
    (p.recordType === "product-family" ||
      /\b(?:oil|butter|wax|extract|hydrosol|distillate|blend|solution|mixture|emulsion|dispersion|juice|ferment)\b|\(and\)|\d\s*%/i.test(
        text,
      ) ||
      (p.supplierIdentityReference?.components.length || 0) > 1);
  const materialType = chemical
    ? "Defined chemical identity reference"
    : polymer
      ? "Polymer or distributed molecular weights"
      : blend
        ? "Composition-dependent material"
        : "Exact material identity pending";
  const molecularWeight: PropertyValue = chemical
    ? {
        value: chemical.molecularWeight + " " + chemical.molecularWeightUnit,
        status: "chemical-reference",
        sourceName: chemical.sourceName || "PubChem",
        sourceUrl: chemical.sourceUrl,
        note: "Molar mass of the referenced chemical identity; not a batch specification.",
      }
    : polymer
      ? {
          value: "Grade-dependent molecular-weight distribution",
          status: "composition-dependent",
          note: "Request the supplier’s average molecular weight, distribution and test method. A repeat-unit mass is not the polymer molecular weight.",
        }
      : blend
        ? {
            value: "No single molecular weight for the complete material",
            status: "composition-dependent",
            note: "A component molecular weight does not describe the whole mixture. Confirm the composition in the supplier specification.",
          }
        : missing("A verified molecular identity or supplier molecular-weight specification is required.");
  function thermal(key: "meltingPoint" | "boilingPoint"): PropertyValue {
    if (key === "meltingPoint" && p.extra.meltingPoint)
      return {
        value: p.extra.meltingPoint,
        status: "supplier-reported",
        sourceName: sourceName(p.source),
        sourceUrl: p.sourceUrl,
        note: "Supplier-published melting point or range; retain its stated conditions.",
      };
    const observation = chemical?.properties[key];
    if (observation)
      return {
        value: observation.value,
        status: "chemical-reference",
        sourceName: observation.sourceName,
        sourceUrl: observation.sourceUrl,
        note:
          observation.conditionsNote ||
          "Reported chemical reference. Pressure, material form and decomposition qualifiers are retained.",
      };
    if (polymer || blend)
      return {
        value: "Grade-specific data required",
        status: "composition-dependent",
        note:
          key === "meltingPoint"
            ? "Request a measured melting, softening or freezing range for this composition and test method."
            : "Request a measured boiling range or decomposition behavior for this composition at the stated pressure.",
      };
    return missing(
      key === "meltingPoint"
        ? "No verified melting point for this identity and material form is available in the checked sources."
        : "No verified boiling point is available in the checked sources. A flash point or decomposition temperature is not a boiling point.",
    );
  }
  const coreProperties: CoreProperties = {
    materialType,
    molecularWeight,
    meltingPoint: thermal("meltingPoint"),
    boilingPoint: thermal("boilingPoint"),
  };
  return { chemical, coreProperties, supplierCASVerified: match?.supplierCASVerified };
}
