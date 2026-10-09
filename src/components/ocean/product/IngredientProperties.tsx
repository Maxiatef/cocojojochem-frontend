/**
 * The ingredient properties panel (reference ingredient-properties.tsx),
 * markup and copy unchanged. Server component: materialProperties() reads the
 * large chemical-properties dataset, which must never reach the browser.
 */
import { Atom, FlaskConical, FileText, ArrowUpRight } from "lucide-react";
import type { CatalogProduct } from "@/lib/ocean/catalog-data";
import { categoryDescription } from "@/lib/ocean/catalog-data";
import { sourceName } from "@/lib/ocean/supplier-names";
import { materialProperties } from "@/lib/ocean/material-properties";
import type { PropertyValue } from "@/lib/ocean/comparison-types";

const physicalFields = [
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
function Rows({ rows }: { rows: [string, string | null | undefined][] }) {
  return (
    <dl className="ip-rows">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className={value ? "" : "ip-unreported"}>
            {value || "Not published in this reference. Request grade data."}
          </dd>
        </div>
      ))}
    </dl>
  );
}
function PropertyValueDisplay({ property }: { property: PropertyValue }) {
  return (
    <>
      <span>{property.value}</span>
      <small className="ip-property-status">{property.status.replace(/-/g, " ")}</small>
      {property.sourceUrl && (
        <a className="ip-source" href={property.sourceUrl} target="_blank" rel="noopener noreferrer">
          {property.sourceName}
        </a>
      )}
      {property.note && <p className="ip-note">{property.note}</p>}
    </>
  );
}
export default function IngredientProperties({ product: p }: { product: CatalogProduct }) {
  const { chemical: profile, coreProperties, supplierCASVerified } = materialProperties(p);
  const request = "/contact?subject=" + encodeURIComponent("Technical specification request: " + p.name);
  const suppliers: [string, string | null | undefined][] = [
    ["Supplier / source", sourceName(p.source)],
    [p.identityReference?.filledFields?.includes("inci") ? "INCI identity reference" : "INCI", p.inci || p.facts.inci],
    [
      p.identityReference?.filledFields?.includes("cas")
        ? "CAS identity reference"
        : "Supplier CAS / component identifiers",
      p.facts.cas,
    ],
    ["Appearance", p.facts.appearance],
    ["Solubility", p.facts.solubility],
    ["Supplier melting point", p.extra.meltingPoint],
    ["Published use level", p.facts.useLevel],
  ];
  if (p.supplierProductId) suppliers.splice(1, 0, ["Supplier reference number", p.supplierProductId]);
  if (p.manufacturer) suppliers.splice(1, 0, ["Manufacturer", p.manufacturer]);
  const handling: [string, string | null | undefined][] = [
    ["Formulation phase", p.extra.phase],
    ["Material / test-solution pH", p.extra.materialPH],
    ["Formulation pH range", p.extra.formulationPH],
    ["Processing / temperature reference", p.extra.temperature],
    ["Storage conditions", p.extra.storage],
    ["Shelf life", p.extra.shelfLife],
  ];
  return (
    <div className="ip-library">
      <div className="ip-family">
        <FlaskConical size={25} />
        <div>
          <span className="r-eyebrow">Functions & applications</span>
          <h3>{p.category}</h3>
          <p>{categoryDescription(p.categoryId)}</p>
          {!!p.functionReference?.functions.length && (
            <>
              <h4>Cosmetic functions</h4>
              <div className="r-product-traits">
                {p.functionReference.functions.map((f) => (
                  <a key={f} href={"/products?function=" + encodeURIComponent(f)}>
                    {f}
                  </a>
                ))}
              </div>
              <a className="ip-source" href={p.functionReference.sourceUrl} target="_blank" rel="noopener noreferrer">
                {p.functionReference.sourceName} · checked {p.functionReference.reviewedAt}
              </a>
            </>
          )}
          {!p.functionReference && <small>Exact-ingredient cosmetic functions require supplier confirmation.</small>}
          {!!p.browsingFunctions?.length ? (
            <>
              <h4>Catalog function tags</h4>
              <div className="r-product-traits">
                {p.browsingFunctions.map((f) => (
                  <a key={f} href={"/products?function=" + encodeURIComponent(f)}>
                    {f}
                  </a>
                ))}
              </div>
              <small>
                Catalog function tags guide discovery. Confirm performance, concentration and compatibility for the
                selected grade.
              </small>
            </>
          ) : null}
          {!!p.extra.applications?.length && (
            <p>
              <strong>Published applications:</strong> {p.extra.applications.join(" · ")}
            </p>
          )}
        </div>
      </div>
      <details className="ip-group" open>
        <summary>
          <span>
            Material identity & supplier details
            <small>Supplier information with separately identified reference data</small>
          </span>
          <span className="ip-expand">+</span>
        </summary>
        <div className="ip-group-body">
          <Rows rows={suppliers} />
          {p.identityReview && <p className="ip-note">{p.identityReview.message}</p>}
          {p.supplierIdentityReference && (
            <div className="ip-reference">
              <FileText size={25} />
              <div>
                <strong>Supplier identity documentation</strong>
                <p className="ip-note">{p.supplierIdentityReference.note}</p>
                <a
                  className="ip-source"
                  href={p.supplierIdentityReference.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.supplierIdentityReference.sourceName} · checked {p.supplierIdentityReference.reviewedAt}
                </a>
              </div>
            </div>
          )}
          {p.identityReference && (
            <div className="ip-reference">
              <Atom size={25} />
              <div>
                <strong>Ingredient identity reference</strong>
                <span>
                  {p.identityReference.inci}
                  {p.identityReference.ec ? " · EC " + p.identityReference.ec : ""}
                </span>
                <p className="ip-note">
                  {p.identityReference.note ||
                    "Reference identity is not a supplier-grade or batch specification. Confirm the supplied composition and identifiers in the current SDS and TDS."}
                </p>
                <a className="ip-source" href={p.identityReference.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {p.identityReference.sourceName} · checked {p.identityReference.reviewedAt}
                </a>
              </div>
            </div>
          )}
          {p.facts.note && <p className="ip-note">{p.facts.note}</p>}
          <a className="ip-source" href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
            {sourceName(p.source)} source listing <ArrowUpRight size={14} />
          </a>
        </div>
      </details>
      <details className="ip-group" open>
        <summary>
          <span>
            Chemical & physical properties
            <small>{profile ? "Independent chemical identity reference" : "Grade-specific data request"}</small>
          </span>
          <span className="ip-expand">+</span>
        </summary>
        <div className="ip-group-body">
          {profile ? (
            <>
              <div className="ip-reference">
                <Atom size={26} />
                <div>
                  <strong>{profile.name}</strong>
                  <span>
                    Pure-substance reference · CAS {profile.cas}
                    {profile.cid ? " · PubChem CID " + profile.cid : ""}
                  </span>
                </div>
              </div>
              {supplierCASVerified === false && (
                <p className="ip-note">
                  Matched to a reviewed chemical identity. Confirm the exact supplier grade, composition and
                  identifiers.
                </p>
              )}
              <p className="ip-note">
                These source-reported values describe the chemical identity, not a guaranteed specification of the
                supplier’s grade or your batch. Pressure, temperature, purity, solvent and test method affect results.
                Unstated conditions remain unspecified.
              </p>
              <Rows rows={[["Molecular formula", profile.molecularFormula]]} />
              <dl className="ip-rows">
                <div>
                  <dt>Molecular weight (molar mass)</dt>
                  <dd>
                    <PropertyValueDisplay property={coreProperties.molecularWeight} />
                  </dd>
                </div>
              </dl>
              <a className="ip-source" href={profile.sourceUrl} target="_blank" rel="noopener noreferrer">
                {profile.sourceName || "PubChem"} identity reference <ArrowUpRight size={14} />
              </a>
              <dl className="ip-rows ip-physical">
                {physicalFields.map(([key, label]) => {
                  const o = profile.properties[key];
                  return (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>
                        {key === "meltingPoint" || key === "boilingPoint" ? (
                          <PropertyValueDisplay property={coreProperties[key]} />
                        ) : o ? (
                          <>
                            <span>{o.value}</span>
                            <a href={o.sourceUrl} target="_blank" rel="noopener noreferrer">
                              {o.sourceName} <ArrowUpRight size={12} />
                            </a>
                            <small>
                              {o.evidenceType === "reported"
                                ? "Source-reported observation"
                                : o.evidenceType.replace(/-/g, " ")}
                            </small>
                          </>
                        ) : (
                          <span className="ip-unreported">
                            Not reported in the checked source, or withheld after review. Request exact grade data.
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="ip-note">
                Identity and observations reviewed {profile.checkedAt.slice(0, 10)}. Values are displayed with their
                published qualifiers. Relative density is dimensionless; it is not automatically a measured density in
                g/mL.
              </p>
            </>
          ) : (
            <>
              <p className="ip-note">
                A compatible pure-substance profile has not been verified for this record. Oils, extracts, polymers,
                solutions and blends often need composition-specific data. A single boiling point or molecular formula
                may not apply.
              </p>
              <dl className="ip-rows">
                <div>
                  <dt>Material reference type</dt>
                  <dd>{coreProperties.materialType}</dd>
                </div>
                {(
                  [
                    ["molecularWeight", "Molecular weight (molar mass)"],
                    ["meltingPoint", "Melting / freezing point"],
                    ["boilingPoint", "Boiling point"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>
                      <PropertyValueDisplay property={coreProperties[key]} />
                    </dd>
                  </div>
                ))}
              </dl>
              <Rows
                rows={[
                  ["Density / relative density", null],
                  ["Flash point", null],
                  ["Vapor pressure", null],
                  ["Viscosity & measurement conditions", null],
                  ["Refractive index", null],
                  ["pKa / partition coefficient", null],
                ]}
              />
            </>
          )}
          <a className="ip-request" href={request}>
            <FileText size={17} />
            Request current SDS, TDS & COA <ArrowUpRight size={16} />
          </a>
        </div>
      </details>
      <details className="ip-group">
        <summary>
          <span>
            Formulation & handling<small>Use levels, phase, processing and storage</small>
          </span>
          <span className="ip-expand">+</span>
        </summary>
        <div className="ip-group-body">
          <Rows rows={handling} />
          <p className="ip-note">
            Material pH is not the finished formula’s target pH. Shelf life and storage are grade and packaging
            dependent.
          </p>
          <a className="ip-source" href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
            Review supplier instructions <ArrowUpRight size={14} />
          </a>
        </div>
      </details>
      <details className="ip-group">
        <summary>
          <span>
            Quality & purchasing checklist<small>Confirm the exact material before ordering</small>
          </span>
          <span className="ip-expand">+</span>
        </summary>
        <div className="ip-group-body">
          <p>
            Ask for the grade and assay, composition or carrier, current SDS, specification sheet, batch COA, country of
            origin, storage and expiry. Where relevant, request microbiological limits, heavy metals, allergens,
            residual solvents and certifications.
          </p>
          {["carrier-oils", "butters-waxes"].includes(p.categoryId) && (
            <p>
              For this ingredient family, also request acid value, peroxide value, saponification value, iodine value,
              fatty-acid profile and refining or extraction method where applicable.
            </p>
          )}
          {["surfactants", "emulsifiers"].includes(p.categoryId) && (
            <p>
              For this ingredient family, also request active matter, ionic character, HLB where applicable, cloud or
              pour point, recommended processing and compatibility.
            </p>
          )}
          {["botanicals", "proteins-peptides"].includes(p.categoryId) && (
            <p>
              For this ingredient family, also request carrier composition, concentration or standardization, extraction
              method, dry matter and microbiological specifications.
            </p>
          )}
          <p className="ip-note">
            Supplier references do not establish COCOJOJO stock, batch certification or approval for a particular
            application.
          </p>
          <a className="ip-source" href={request}>
            Request a complete specification <ArrowUpRight size={14} />
          </a>
        </div>
      </details>
    </div>
  );
}
