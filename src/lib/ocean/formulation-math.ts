export type ToolField = { key: string; label: string; value: number; min?: number; max?: number; step?: number };
export type ToolResult = { label: string; value: number; unit: string; digits?: number };
export type FormulationTool = {
  id: string;
  tab: string;
  name: string;
  description: string;
  fields: ToolField[];
  formula: string;
  note: string;
  source?: string;
  calculate: (v: Record<string, number>) => ToolResult[];
};
const f = (key: string, label: string, value: number, min = 0, max?: number): ToolField => ({
  key,
  label,
  value,
  min,
  max,
});
const r = (label: string, value: number, unit: string, digits = 3): ToolResult => ({ label, value, unit, digits });
const positive = (v: number, label: string) => {
  if (!(v > 0)) throw new Error(label + " must be greater than zero.");
  return v;
};
const check = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};
const pct = (v: number, label: string) => {
  check(v >= 0 && v <= 100, label + " must be between 0 and 100%.");
  return v;
};
const snapInteger = (x: number) => {
  const n = Math.round(x);
  return Math.abs(x - n) <= 8 * Number.EPSILON * Math.max(1, Math.abs(x)) ? n : x;
};
export const toolTabs = [
  { id: "batch", label: "Batch & scaling" },
  { id: "concentration", label: "Concentration" },
  { id: "emulsion", label: "Emulsions & cleansing" },
  { id: "lab", label: "Lab calculations" },
  { id: "production", label: "Production & cost" },
  { id: "quality", label: "Quality & planning" },
];
const units = "https://www.nist.gov/pml/special-publication-811";
export const formulationTools: FormulationTool[] = [
  {
    id: "scale",
    tab: "batch",
    name: "Scale an ingredient",
    description: "Carry an ingredient weight from a pilot batch to a new batch.",
    fields: [
      f("pilot", "Original batch (g)", 100, 0.000001),
      f("mass", "Ingredient in original batch (g)", 5),
      f("target", "New batch (g)", 1000, 0.000001),
    ],
    formula: "New ingredient mass = original ingredient mass × new batch ÷ original batch",
    note: "Scale all ingredients by the same factor. Processing time and mixing speed do not scale automatically.",
    calculate: (v) => {
      check(v.mass <= v.pilot, "Ingredient mass cannot exceed the original batch.");
      const k = v.target / positive(v.pilot, "Original batch");
      return [
        r("Scale factor", k, "×"),
        r("Ingredient required", v.mass * k, "g"),
        r("Formula concentration", (v.mass / v.pilot) * 100, "% w/w"),
      ];
    },
  },
  {
    id: "percent-mass",
    tab: "batch",
    name: "Percentage to weight",
    description: "Convert a formula percentage into a weighing quantity.",
    fields: [f("batch", "Batch mass (g)", 1000, 0.000001), f("percent", "Ingredient (% w/w)", 2, 0, 100)],
    formula: "Ingredient mass = batch mass × percentage ÷ 100",
    note: "Mass percentages are based on the complete final batch.",
    calculate: (v) => [
      r("Ingredient required", (v.batch * pct(v.percent, "Ingredient")) / 100, "g"),
      r("Remaining batch", v.batch * (1 - v.percent / 100), "g"),
    ],
  },
  {
    id: "mass-percent",
    tab: "batch",
    name: "Weight to percentage",
    description: "Find the mass percentage of an ingredient in a finished batch.",
    fields: [f("mass", "Ingredient mass (g)", 25), f("batch", "Final batch mass (g)", 500, 0.000001)],
    formula: "% w/w = ingredient mass ÷ final batch mass × 100",
    note: "Use the final total mass, including this ingredient.",
    calculate: (v) => {
      check(v.mass <= v.batch, "Ingredient mass cannot exceed the batch.");
      return [r("Concentration", (v.mass / positive(v.batch, "Batch mass")) * 100, "% w/w")];
    },
  },
  {
    id: "qs",
    tab: "batch",
    name: "Water / carrier q.s.",
    description: "Calculate the remaining percentage and mass needed to reach 100%.",
    fields: [
      f("total", "Total of other ingredients (%)", 23.5, 0, 100),
      f("batch", "Final batch mass (g)", 1000, 0.000001),
    ],
    formula: "Carrier % = 100 − sum of other ingredient percentages",
    note: "Choose a compatible carrier. This calculation does not decide whether water is appropriate.",
    calculate: (v) => [
      r("Carrier", 100 - pct(v.total, "Other ingredients"), "% w/w"),
      r("Carrier required", (v.batch * (100 - v.total)) / 100, "g"),
    ],
  },
  {
    id: "normalize",
    tab: "batch",
    name: "Parts to percentages",
    description: "Convert an ingredient expressed in parts into percentage and batch weight.",
    fields: [
      f("part", "Ingredient parts", 3),
      f("total", "Total formula parts", 120, 0.000001),
      f("batch", "Target batch mass (g)", 1000, 0.000001),
    ],
    formula: "Ingredient % = ingredient parts ÷ total parts × 100",
    note: "Enter the sum of all formula parts as the total.",
    calculate: (v) => {
      check(v.part <= v.total, "Ingredient parts cannot exceed total parts.");
      const p = v.part / positive(v.total, "Total parts");
      return [r("Ingredient percentage", p * 100, "% w/w"), r("Ingredient mass", p * v.batch, "g")];
    },
  },
  {
    id: "dilution",
    tab: "concentration",
    name: "Dilute a concentrate",
    description: "Find concentrate and diluent masses for a target strength.",
    fields: [
      f("stock", "Stock concentration (% w/w)", 50, 0.000001, 100),
      f("target", "Target concentration (% w/w)", 5, 0, 100),
      f("batch", "Final mass (g)", 1000, 0.000001),
    ],
    formula: "Stock mass = final mass × target concentration ÷ stock concentration",
    note: "Assumes the diluent contains none of the active. All concentrations must use the same mass basis.",
    calculate: (v) => {
      check(v.target <= v.stock, "Target strength must not exceed stock strength.");
      const m = (v.batch * v.target) / positive(v.stock, "Stock concentration");
      return [r("Concentrate", m, "g"), r("Diluent", v.batch - m, "g")];
    },
  },
  {
    id: "blend-strength",
    tab: "concentration",
    name: "Blend two strengths",
    description: "Combine two solutions to obtain an intermediate mass concentration.",
    fields: [
      f("high", "Higher strength (% w/w)", 50, 0, 100),
      f("low", "Lower strength (% w/w)", 10, 0, 100),
      f("target", "Target strength (% w/w)", 25, 0, 100),
      f("batch", "Final mass (g)", 1000, 0.000001),
    ],
    formula: "High-strength mass = total mass × (target − low) ÷ (high − low)",
    note: "Only valid for compatible solutions with a common concentration basis.",
    calculate: (v) => {
      check(v.high > v.low, "Higher strength must exceed lower strength.");
      check(v.target >= v.low && v.target <= v.high, "Target must lie between the two strengths.");
      const m = (v.batch * (v.target - v.low)) / (v.high - v.low);
      return [r("Higher-strength solution", m, "g"), r("Lower-strength solution", v.batch - m, "g")];
    },
  },
  {
    id: "active-dose",
    tab: "concentration",
    name: "Active matter dosage",
    description: "Calculate how much supplied solution delivers a target active percentage.",
    fields: [
      f("active", "Supplier active content (% w/w)", 30, 0.000001, 100),
      f("target", "Target active in formula (% w/w)", 3, 0, 100),
      f("batch", "Final batch mass (g)", 1000, 0.000001),
    ],
    formula: "Raw material % = target active % ÷ supplier active % × 100",
    note: "Include the raw material’s water, solvents and other carriers in the full formula balance.",
    calculate: (v) => {
      check(v.target <= v.active, "Target exceeds the supplied active content.");
      const p = (v.target / positive(v.active, "Active content")) * 100;
      return [
        r("Raw material dose", p, "% w/w"),
        r("Raw material weight", (v.batch * p) / 100, "g"),
        r("Active delivered", (v.batch * v.target) / 100, "g"),
      ];
    },
  },
  {
    id: "assay-correction",
    tab: "concentration",
    name: "Assay correction",
    description: "Adjust a planned raw material dose for its measured assay.",
    fields: [
      f("mass", "Nominal ingredient dose (g)", 10),
      f("nominal", "Nominal assay (%)", 100, 0.000001, 100),
      f("actual", "Actual assay (%)", 98, 0.000001, 100),
    ],
    formula: "Corrected dose = nominal dose × nominal assay ÷ actual assay",
    note: "Rebalance the carrier to retain the intended final batch weight.",
    calculate: (v) => [
      r("Corrected dose", (v.mass * v.nominal) / positive(v.actual, "Actual assay"), "g"),
      r("Dose difference", v.mass * (v.nominal / v.actual - 1), "g"),
    ],
  },
  {
    id: "ppm",
    tab: "concentration",
    name: "ppm to batch weight",
    description: "Convert a mass-based ppm target into ingredient mass.",
    fields: [f("ppm", "Concentration (ppm w/w)", 100, 0, 1000000), f("batch", "Batch mass (kg)", 10, 0.000001)],
    formula: "mg required = ppm (mg/kg) × batch mass (kg)",
    note: "ppm w/w means mg/kg. It is not automatically mg/L unless density justifies that approximation.",
    source: units,
    calculate: (v) => [
      r("Ingredient mass", v.ppm * v.batch, "mg"),
      r("Ingredient mass", (v.ppm * v.batch) / 1000, "g"),
      r("Concentration", v.ppm / 10000, "% w/w", 6),
    ],
  },
  {
    id: "carrier-water",
    tab: "concentration",
    name: "Water contributed by a solution",
    description: "Account for water carried into a formula by a supplied ingredient.",
    fields: [
      f("dose", "Raw material dose in formula (%)", 5, 0, 100),
      f("water", "Water in raw material (% w/w)", 70, 0, 100),
      f("batch", "Batch mass (g)", 1000, 0.000001),
    ],
    formula: "Contributed water % = raw material dose % × water content % ÷ 100",
    note: "This is compositional water, not water activity or available water.",
    calculate: (v) => {
      const p = (v.dose * v.water) / 100;
      return [
        r("Water in formula", p, "% w/w"),
        r("Contributed water", (v.batch * p) / 100, "g"),
        r("Other material contributed", (v.batch * v.dose * (1 - v.water / 100)) / 100, "g"),
      ];
    },
  },
  {
    id: "hlb-blend",
    tab: "emulsion",
    name: "HLB of a two-part blend",
    description: "Calculate a mass-weighted HLB from two supplied HLB values.",
    fields: [
      f("a", "Emulsifier A HLB", 15, 0.000001, 40),
      f("b", "Emulsifier B HLB", 4.3, 0.000001, 40),
      f("share", "A share of emulsifier blend (%)", 60, 0, 100),
    ],
    formula: "Blend HLB = fraction A × HLB A + fraction B × HLB B",
    note: "Use HLB values on the same system. HLB is a starting screen, not evidence of emulsion stability.",
    calculate: (v) => [r("Blend HLB", (v.a * v.share) / 100 + v.b * (1 - v.share / 100), "HLB")],
  },
  {
    id: "hlb-target",
    tab: "emulsion",
    name: "Emulsifier ratio for target HLB",
    description: "Estimate a two-emulsifier blend ratio to reach a chosen HLB.",
    fields: [
      f("high", "Higher emulsifier HLB", 15, 0.000001, 40),
      f("low", "Lower emulsifier HLB", 4.3, 0.000001, 40),
      f("target", "Target HLB", 10, 0.000001, 40),
      f("mass", "Total emulsifier mass (g)", 40, 0.000001),
    ],
    formula: "High-HLB fraction = (target HLB − low HLB) ÷ (high HLB − low HLB)",
    note: "Total emulsifier dose is a separate formulation decision. Validate the actual emulsion.",
    calculate: (v) => {
      check(v.high > v.low, "Higher HLB must exceed lower HLB.");
      check(v.target >= v.low && v.target <= v.high, "Target HLB must lie between the two values.");
      const x = (v.target - v.low) / (v.high - v.low);
      return [
        r("High-HLB emulsifier", x * 100, "% of blend"),
        r("High-HLB weight", x * v.mass, "g"),
        r("Low-HLB weight", (1 - x) * v.mass, "g"),
      ];
    },
  },
  {
    id: "required-hlb",
    tab: "emulsion",
    name: "Required HLB of an oil blend",
    description: "Weight two experimentally supplied required-HLB values by oil composition.",
    fields: [
      f("a", "Oil A required HLB", 8, 0.000001, 40),
      f("b", "Oil B required HLB", 12, 0.000001, 40),
      f("share", "Oil A share of oil blend (%)", 70, 0, 100),
    ],
    formula: "Required HLB = oil A fraction × rHLB A + oil B fraction × rHLB B",
    note: "Enter required HLB for the intended emulsion type. Do not substitute emulsifier HLB for oil required HLB.",
    calculate: (v) => [r("Estimated required HLB", (v.a * v.share) / 100 + v.b * (1 - v.share / 100), "rHLB")],
  },
  {
    id: "emulsifier-dose",
    tab: "emulsion",
    name: "Emulsifier on oil weight",
    description: "Translate a chosen emulsifier-to-oil ratio into final-batch dosage.",
    fields: [
      f("oil", "Oils excluding emulsifier (% of final batch)", 20, 0, 100),
      f("ratio", "Emulsifier (% of oil weight)", 15, 0, 100),
      f("batch", "Final batch mass (g)", 1000, 0.000001),
    ],
    formula: "Emulsifier % of batch = oil % of batch × emulsifier % of oil ÷ 100",
    note: "The ratio is user-selected, not a recommended use level. Emulsifier is additional to the stated oil weight.",
    calculate: (v) => {
      const e = (v.oil * v.ratio) / 100;
      check(v.oil + e <= 100, "Oil plus emulsifier exceeds the batch.");
      return [
        r("Emulsifier in formula", e, "% w/w"),
        r("Emulsifier weight", (v.batch * e) / 100, "g"),
        r("Oil weight", (v.batch * v.oil) / 100, "g"),
        r("Remaining formula", 100 - v.oil - e, "%"),
      ];
    },
  },
  {
    id: "surfactant-active",
    tab: "emulsion",
    name: "Surfactant blend active matter",
    description: "Calculate the total active matter delivered by two surfactants.",
    fields: [
      f("doseA", "Surfactant A dose (% of formula)", 15, 0, 100),
      f("activeA", "A active content (%)", 30, 0, 100),
      f("doseB", "Surfactant B dose (% of formula)", 5, 0, 100),
      f("activeB", "B active content (%)", 50, 0, 100),
    ],
    formula: "Total active % = dose A × active A / 100 + dose B × active B / 100",
    note: "Active content does not predict mildness, foam, viscosity or preservation.",
    calculate: (v) => {
      check(v.doseA + v.doseB <= 100, "Combined surfactant doses exceed 100%.");
      return [
        r("Total active matter", (v.doseA * v.activeA) / 100 + (v.doseB * v.activeB) / 100, "% w/w"),
        r("Total supplied surfactants", v.doseA + v.doseB, "% of formula"),
      ];
    },
  },
  {
    id: "saponification",
    tab: "emulsion",
    name: "Saponification estimate",
    description: "Calculate a theoretical NaOH requirement from a measured KOH SAP value.",
    fields: [
      f("oil", "Oil mass (g)", 1000, 0.000001),
      f("sap", "SAP value (mg KOH/g oil)", 190, 0.000001),
      f("discount", "Lye discount (%)", 5, 0, 99),
      f("purity", "NaOH assay (%)", 98, 0.000001, 100),
    ],
    formula: "NaOH g = oil g × SAP / 1000 × (39.997 / 56.1056) × (1 − discount/100) ÷ assay fraction",
    note: "Use a measured SAP for the actual oil blend. Lye is corrosive; this estimate is not a soapmaking procedure or finished-product safety validation.",
    calculate: (v) => [
      r("Theoretical pure KOH", (v.oil * v.sap) / 1000, "g"),
      r(
        "Assay-adjusted NaOH",
        (((v.oil * v.sap) / 1000) * (39.997 / 56.1056) * (1 - v.discount / 100)) / (positive(v.purity, "Assay") / 100),
        "g",
      ),
    ],
  },
  {
    id: "molarity",
    tab: "lab",
    name: "Prepare a molar solution",
    description: "Convert target molarity to a weighed amount of a defined pure compound.",
    fields: [
      f("molarity", "Target molarity (mol/L)", 0.1),
      f("volume", "Final solution volume (mL)", 100, 0.000001),
      f("mw", "Molar mass (g/mol)", 58.44, 0.000001),
      f("assay", "Assay (%)", 100, 0.000001, 100),
    ],
    formula: "Mass = molarity × final volume in L × molar mass ÷ assay fraction",
    note: "Bring to the final volume after dissolution. Use the correct hydrate or salt molar mass.",
    calculate: (v) => [
      r("Weigh", (((v.molarity * v.volume) / 1000) * v.mw) / (positive(v.assay, "Assay") / 100), "g"),
      r("Amount of substance", (v.molarity * v.volume) / 1000, "mol", 6),
    ],
  },
  {
    id: "molar-dilution",
    tab: "lab",
    name: "Molar stock dilution",
    description: "Use C1V1 = C2V2 for a stock and target on the same molar basis.",
    fields: [
      f("stock", "Stock concentration (mol/L)", 1, 0.000001),
      f("target", "Target concentration (mol/L)", 0.1),
      f("volume", "Final solution volume (mL)", 100, 0.000001),
    ],
    formula: "Stock volume = target concentration × final volume ÷ stock concentration",
    note: "Make up to the final volume. Do not assume liquid volumes are additive.",
    calculate: (v) => {
      check(v.target <= v.stock, "Target concentration cannot exceed the stock.");
      return [
        r("Stock aliquot", (v.target * v.volume) / positive(v.stock, "Stock concentration"), "mL"),
        r("Make up to", v.volume, "mL final volume"),
      ];
    },
  },
  {
    id: "molality",
    tab: "lab",
    name: "Molality",
    description: "Find moles of solute per kilogram of solvent.",
    fields: [
      f("solute", "Pure solute mass (g)", 10),
      f("mw", "Solute molar mass (g/mol)", 58.44, 0.000001),
      f("solvent", "Solvent mass (g)", 1000, 0.000001),
    ],
    formula: "Molality = (solute mass / molar mass) ÷ solvent mass in kg",
    note: "The denominator is solvent mass, not total solution mass.",
    calculate: (v) => [
      r("Molality", v.solute / positive(v.mw, "Molar mass") / (positive(v.solvent, "Solvent mass") / 1000), "mol/kg"),
    ],
  },
  {
    id: "density",
    tab: "lab",
    name: "Mass, volume & density",
    description: "Convert liquid volume to mass using a measured density.",
    fields: [f("volume", "Volume (mL)", 100), f("density", "Density at working temperature (g/mL)", 1.05, 0.000001)],
    formula: "Mass = volume × density",
    note: "Density depends on material, concentration and temperature. Do not assume all liquids weigh 1 g/mL.",
    source: units,
    calculate: (v) => [r("Mass", v.volume * v.density, "g"), r("Mass", (v.volume * v.density) / 1000, "kg")],
  },
  {
    id: "temperature",
    tab: "lab",
    name: "Temperature conversion",
    description: "Convert Celsius into Fahrenheit and kelvin.",
    fields: [f("c", "Temperature (°C)", 25, -273.15)],
    formula: "°F = °C × 9/5 + 32; K = °C + 273.15",
    note: "Temperature conversion does not establish an ingredient’s processing limit.",
    source: units,
    calculate: (v) => [r("Fahrenheit", v.c * 1.8 + 32, "°F", 2), r("Kelvin", v.c + 273.15, "K", 2)],
  },
  {
    id: "viscosity",
    tab: "lab",
    name: "Dynamic to kinematic viscosity",
    description: "Convert cP to cSt using density at the same temperature.",
    fields: [
      f("dynamic", "Dynamic viscosity (cP / mPa·s)", 100, 0.000001),
      f("density", "Density (g/mL)", 1.02, 0.000001),
    ],
    formula: "Kinematic viscosity (cSt) = dynamic viscosity (cP) ÷ density (g/mL)",
    note: "For non-Newtonian materials, report the measurement method, shear conditions and temperature; one viscosity value is not universal.",
    source: units,
    calculate: (v) => [
      r("Kinematic viscosity", v.dynamic / positive(v.density, "Density"), "cSt"),
      r("Dynamic viscosity", v.dynamic / 1000, "Pa·s"),
    ],
  },
  {
    id: "buffer",
    tab: "lab",
    name: "Theoretical buffer ratio",
    description: "Estimate a conjugate base-to-acid ratio from pKa and target pH.",
    fields: [f("pka", "pKa at relevant conditions", 4.76, -10, 30), f("ph", "Target pH", 5, -2, 16)],
    formula: "[A−] / [HA] = 10^(pH − pKa)",
    note: "Henderson–Hasselbalch approximation for a conjugate acid/base buffer. It does not calculate a finished cosmetic’s pH or the acid dose required. Measure and titrate the actual formula.",
    calculate: (v) => {
      const x = 10 ** (v.ph - v.pka);
      return [
        r("Base : acid molar ratio", x, ": 1", 5),
        r("Base fraction of buffer pair", (100 * x) / (1 + x), "mol %"),
      ];
    },
  },
  {
    id: "ionic-strength",
    tab: "lab",
    name: "Two-ion ionic strength",
    description: "Calculate ionic strength for a two-ion electrolyte solution.",
    fields: [
      f("c1", "Cation concentration (mol/L)", 0.1),
      f("z1", "Cation charge magnitude", 1, 1, 6),
      f("c2", "Anion concentration (mol/L)", 0.1),
      f("z2", "Anion charge magnitude", 1, 1, 6),
    ],
    formula: "I = ½ Σ(ci × zi²)",
    note: "Include every ionic species for a full formula. This two-ion estimate ignores activity corrections and complexation.",
    calculate: (v) => {
      check(Number.isInteger(v.z1) && Number.isInteger(v.z2), "Ion charge magnitudes must be whole numbers.");
      check(
        Math.abs(v.c1 * v.z1 - v.c2 * v.z2) <=
          1e-9 * Math.max(Math.abs(v.c1 * v.z1), Math.abs(v.c2 * v.z2), Number.MIN_VALUE),
        "The entered cation and anion charges do not balance.",
      );
      return [r("Ionic strength", 0.5 * (v.c1 * v.z1 ** 2 + v.c2 * v.z2 ** 2), "mol/L", 6)];
    },
  },
  {
    id: "neutralization",
    tab: "lab",
    name: "Stoichiometric neutralization",
    description: "Estimate base mass using the acid and base equivalent weights.",
    fields: [
      f("acid", "Acid raw material (g)", 10),
      f("assayA", "Acid assay (%)", 100, 0.000001, 100),
      f("eqA", "Acid equivalent weight (g/eq)", 90.08, 0.000001),
      f("eqB", "Base equivalent weight (g/eq)", 40, 0.000001),
      f("assayB", "Base assay (%)", 100, 0.000001, 100),
    ],
    formula:
      "Base mass = acid mass × acid assay fraction ÷ acid equivalent weight × base equivalent weight ÷ base assay fraction",
    note: "Equivalent weight depends on the intended neutralization step. This is theoretical stoichiometry, not the dose needed to reach a chosen pH in a cosmetic.",
    calculate: (v) => [
      r(
        "Theoretical base required",
        (((v.acid * v.assayA) / 100 / positive(v.eqA, "Acid equivalent weight")) * v.eqB) /
          (positive(v.assayB, "Base assay") / 100),
        "g",
      ),
    ],
  },
  {
    id: "yield",
    tab: "production",
    name: "Batch yield & loss",
    description: "Compare recovered mass with material charged.",
    fields: [f("charged", "Material charged (g)", 1000, 0.000001), f("recovered", "Recovered mass (g)", 950)],
    formula: "Yield % = recovered mass ÷ charged mass × 100",
    note: "A recovery above 100% should trigger a check of additions, tare and measurement records.",
    calculate: (v) => [
      r("Yield", (v.recovered / positive(v.charged, "Charged mass")) * 100, "%"),
      r("Mass difference", v.charged - v.recovered, "g"),
    ],
  },
  {
    id: "overage",
    tab: "production",
    name: "Plan for process loss",
    description: "Estimate the charge needed to deliver a required usable mass.",
    fields: [
      f("target", "Required usable mass (kg)", 10, 0.000001),
      f("yield", "Expected process yield (%)", 95, 0.000001, 100),
    ],
    formula: "Required charge = target usable mass ÷ yield fraction",
    note: "Use a yield supported by process history. This does not justify changing ingredient concentrations.",
    calculate: (v) => {
      const m = v.target / (positive(v.yield, "Yield") / 100);
      return [r("Batch charge", m, "kg"), r("Process overage", m - v.target, "kg")];
    },
  },
  {
    id: "cost",
    tab: "production",
    name: "Batch & unit cost",
    description: "Estimate manufacturing cost from your supplied cost totals.",
    fields: [
      f("raw", "Total raw material cost ($)", 120),
      f("pack", "Total packaging cost ($)", 80),
      f("labor", "Labor and overhead ($)", 100),
      f("units", "Saleable units", 100, 1),
    ],
    formula: "Cost per unit = (raw material + packaging + labor/overhead costs) ÷ saleable units",
    note: "Enter your actual costs. Shipping, testing, taxes and waste must be included in your inputs if applicable.",
    calculate: (v) => {
      check(Number.isInteger(v.units), "Saleable units must be a whole number.");
      const c = v.raw + v.pack + v.labor;
      return [r("Batch cost", c, "USD", 2), r("Cost per unit", c / positive(v.units, "Saleable units"), "USD/unit", 2)];
    },
  },
  {
    id: "ingredient-cost",
    tab: "production",
    name: "Ingredient cost contribution",
    description: "Translate an ingredient dose and purchase cost into batch contribution.",
    fields: [
      f("batch", "Batch mass (kg)", 10, 0.000001),
      f("dose", "Ingredient dose (% w/w)", 2, 0, 100),
      f("price", "Ingredient price ($/kg)", 40),
    ],
    formula: "Ingredient cost = batch kg × dose fraction × price per kg",
    note: "Use landed cost and actual usable pack yield for a more complete estimate.",
    calculate: (v) => [
      r("Ingredient required", (v.batch * v.dose) / 100, "kg"),
      r("Batch cost contribution", ((v.batch * v.dose) / 100) * v.price, "USD", 2),
      r("Contribution per kg formula", (v.dose / 100) * v.price, "USD/kg", 2),
    ],
  },
  {
    id: "filling",
    tab: "production",
    name: "Filling quantity",
    description: "Estimate full containers from usable batch mass and fill volume.",
    fields: [
      f("batch", "Usable batch mass (g)", 10000),
      f("density", "Product density (g/mL)", 1.02, 0.000001),
      f("fill", "Target fill volume (mL)", 50, 0.000001),
    ],
    formula: "Full units = floor(batch mass ÷ (density × fill volume))",
    note: "Use measured density at filling temperature. Include process allowance and verify net contents separately.",
    calculate: (v) => {
      const each = positive(v.density, "Density") * positive(v.fill, "Fill volume");
      const n = Math.floor(snapInteger(v.batch / each));
      return [
        r("Full containers", n, "units", 0),
        r("Target mass per container", each, "g"),
        r("Remainder", Math.max(0, v.batch - n * each), "g"),
      ];
    },
  },
  {
    id: "tip-speed",
    tab: "production",
    name: "Mixer tip speed",
    description: "Calculate peripheral speed from impeller diameter and rpm.",
    fields: [f("diameter", "Impeller diameter (mm)", 50, 0.000001), f("rpm", "Rotational speed (rpm)", 1000)],
    formula: "Tip speed (m/s) = π × diameter (m) × rpm ÷ 60",
    note: "Equal tip speed does not guarantee comparable mixing, shear or scale-up performance.",
    calculate: (v) => [r("Tip speed", (((Math.PI * v.diameter) / 1000) * v.rpm) / 60, "m/s")],
  },
  {
    id: "mass-units",
    tab: "production",
    name: "Mass unit conversion",
    description: "Convert grams to common laboratory and purchasing mass units.",
    fields: [f("grams", "Mass (g)", 1000)],
    formula: "1 kg = 1,000 g; 1 lb = 453.59237 g; 1 oz = 28.349523125 g",
    note: "Ounces here are mass ounces, not fluid ounces.",
    source: units,
    calculate: (v) => [
      r("Kilograms", v.grams / 1000, "kg"),
      r("Milligrams", v.grams * 1000, "mg"),
      r("Pounds", v.grams / 453.59237, "lb"),
      r("Ounces by mass", v.grams / 28.349523125, "oz"),
    ],
  },
  {
    id: "rcf",
    tab: "quality",
    name: "Centrifuge relative force",
    description: "Convert rotor radius and rpm to relative centrifugal force.",
    fields: [f("radius", "Rotor radius to sample (cm)", 10, 0.000001), f("rpm", "Speed (rpm)", 3000)],
    formula: "RCF = 1.118 × 10⁻⁵ × radius in cm × rpm²",
    note: "Use your rotor’s specified radius and operating limits. Centrifugation alone does not establish shelf life.",
    calculate: (v) => [r("Relative centrifugal force", 1.118e-5 * v.radius * v.rpm ** 2, "× g", 1)],
  },
  {
    id: "ph-drift",
    tab: "quality",
    name: "pH drift",
    description: "Compare two measured pH values from a stability study.",
    fields: [f("initial", "Initial measured pH", 5.5, -2, 16), f("later", "Later measured pH", 5.2, -2, 16)],
    formula: "ΔpH = later pH − initial pH",
    note: "pH is logarithmic. Use consistent temperature, calibration and sample preparation; acceptance limits must be defined for the product.",
    calculate: (v) => [
      r("pH change", v.later - v.initial, "pH units", 2),
      r("Relative hydrogen-ion activity", 10 ** (v.initial - v.later), "× initial", 4),
    ],
  },
  {
    id: "viscosity-drift",
    tab: "quality",
    name: "Viscosity change",
    description: "Compare viscosity measurements made under matching conditions.",
    fields: [f("initial", "Initial viscosity (cP)", 5000, 0.000001), f("later", "Later viscosity (cP)", 4500)],
    formula: "Change % = (later − initial) ÷ initial × 100",
    note: "Use the same instrument, spindle, speed, temperature and conditioning procedure.",
    calculate: (v) => [
      r("Relative change", ((v.later - v.initial) / positive(v.initial, "Initial viscosity")) * 100, "%"),
      r("Absolute change", v.later - v.initial, "cP"),
    ],
  },
  {
    id: "stability-samples",
    tab: "quality",
    name: "Stability sample planner",
    description: "Budget containers for a user-defined destructive sampling schedule.",
    fields: [
      f("weeks", "Study duration (weeks)", 12, 1),
      f("interval", "Sampling interval (weeks)", 2, 0.000001),
      f("conditions", "Storage conditions", 3, 1),
      f("replicates", "Replicates at each condition / time", 2, 1),
      f("retain", "Additional retain containers", 6),
    ],
    formula: "Containers = time points × storage conditions × replicates + retains",
    note: "Includes time zero and the final study week. This is a sample budget, not a validated protocol, preservative test or shelf-life prediction.",
    calculate: (v) => {
      check(
        [v.conditions, v.replicates, v.retain].every(Number.isInteger),
        "Conditions, replicates and retains must be whole numbers.",
      );
      check(v.interval <= v.weeks, "Sampling interval cannot exceed study duration.");
      const n = Math.ceil(snapInteger(v.weeks / positive(v.interval, "Interval"))) + 1;
      return [
        r("Time points including baseline", n, "points", 0),
        r("Study containers", n * v.conditions * v.replicates, "containers", 0),
        r("Total including retains", n * v.conditions * v.replicates + v.retain, "containers", 0),
      ];
    },
  },
  {
    id: "mass-loss",
    tab: "quality",
    name: "Package mass loss",
    description: "Track the net-content change in a package study.",
    fields: [f("initial", "Initial net contents (g)", 50, 0.000001), f("later", "Later net contents (g)", 49.7)],
    formula: "Mass loss % = (initial net mass − later net mass) ÷ initial net mass × 100",
    note: "Subtract packaging tare consistently. This tracks mass change, not a packaging compatibility pass/fail result.",
    calculate: (v) => [
      r("Mass loss", v.initial - v.later, "g"),
      r("Mass loss", ((v.initial - v.later) / positive(v.initial, "Initial mass")) * 100, "%"),
    ],
  },
];
export function calculateTool(tool: FormulationTool, values: Record<string, number>) {
  for (const field of tool.fields) {
    const v = values[field.key];
    if (!Number.isFinite(v)) throw new Error("Enter a number for " + field.label + ".");
    if (field.min !== undefined && v < field.min) throw new Error(field.label + " must be at least " + field.min + ".");
    if (field.max !== undefined && v > field.max) throw new Error(field.label + " must not exceed " + field.max + ".");
  }
  const results = tool.calculate(values);
  if (results.some((x) => !Number.isFinite(x.value))) throw new Error("These inputs cannot produce a finite result.");
  return results;
}
