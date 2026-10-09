import type { ProductMini } from "./store-types";
import type { ExtraFacts, FunctionReference } from "./catalog-data";

export const physicalProperties = [
  ["boilingPoint", "Boiling point"],
  ["meltingPoint", "Melting / freezing point"],
  ["density", "Density / relative density"],
  ["flashPoint", "Flash point"],
  ["solubility", "Solubility"],
  ["vaporPressure", "Vapor pressure"],
  ["viscosity", "Viscosity"],
  ["pKa", "Dissociation constant (pKa)"],
  ["logP", "Partition coefficient (log P)"],
  ["decompositionTemperature", "Decomposition behavior"],
] as const;
export type ChemicalObservation = {
  value: string;
  sourceName: string;
  sourceUrl: string;
  evidenceType: string;
  conditionsNote?: string;
};
export type ComparisonChemical = {
  cas: string;
  cid?: number;
  name: string;
  molecularFormula: string;
  molecularWeight: string;
  molecularWeightUnit: string;
  sourceName?: string;
  sourceUrl: string;
  checkedAt: string;
  properties: Record<string, ChemicalObservation>;
};
export type FormulationReference = {
  appearance: string | null;
  solubility: string | null;
  phase: string | null;
  useLevel: string | null;
  applications: string[];
  storage: string | null;
  sources: { title: string; url: string }[];
  matchingNote: string;
};
export type PropertyValue = {
  value: string;
  status: "supplier-reported" | "chemical-reference" | "composition-dependent" | "not-verified";
  note?: string;
  sourceName?: string;
  sourceUrl?: string;
};
export type CoreProperties = {
  materialType: string;
  molecularWeight: PropertyValue;
  meltingPoint: PropertyValue;
  boilingPoint: PropertyValue;
};
export type ComparisonProduct = ProductMini & {
  sourceUrl: string;
  functions: string[];
  browsingFunctions?: string[];
  functionReference?: FunctionReference;
  coreProperties?: CoreProperties;
  extra: ExtraFacts;
  manufacturer?: string;
  supplierProductId?: string;
  chemical?: ComparisonChemical;
  supplierCASVerified?: boolean;
  formulationReference?: FormulationReference;
};
