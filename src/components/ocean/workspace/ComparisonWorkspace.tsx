"use client";
/* Port of the reference comparison-workspace.tsx (markup, copy and cmp-* classes unchanged). */
import { useEffect, useState, type ReactNode } from "react";
import { Search, Plus, X, Check, GitCompareArrows, LoaderCircle } from "lucide-react";
import { MAX_COMPARISON_ITEMS, productHref, type ProductMini } from "@/lib/ocean/store-types";
import { physicalProperties, type ComparisonProduct, type PropertyValue } from "@/lib/ocean/comparison-types";
import { sourceName } from "@/lib/ocean/supplier-names";

type Props = {
  selected: ProductMini[];
  loaded: boolean;
  workspaceError: string;
  saving: boolean;
  onRetry: () => void;
  onAdd: (p: ProductMini) => boolean;
  onRemove: (p: ProductMini) => void;
  onClear: () => void;
};
type PickerResponse = {
  products: ProductMini[];
  total: number;
  page: number;
  pages: number;
  categories: { id: string; label: string; count: number }[];
};
type DetailRow = [string, (p: ComparisonProduct) => ReactNode];
async function readProducts<T>(url: string, signal: AbortSignal): Promise<T[]> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Ingredient details could not be loaded. Please try again.");
  return ((await response.json()) as { products: T[] }).products;
}
function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="cmp-source" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
function PropertyCell({ property }: { property?: PropertyValue }) {
  return property ? (
    <>
      <span>{property.value}</span>
      <small>{property.status.replaceAll("-", " ")}</small>
      {property.sourceUrl && <SourceLink href={property.sourceUrl}>{property.sourceName}</SourceLink>}
      {property.note && <small>{property.note}</small>}
    </>
  ) : null;
}

export function ComparisonWorkspace({
  selected: selectedItems,
  loaded,
  workspaceError,
  saving,
  onRetry,
  onAdd,
  onRemove,
  onClear,
}: Props) {
  const [query, setQuery] = useState(""),
    [results, setResults] = useState<ProductMini[]>([]),
    [searching, setSearching] = useState(false),
    [searchError, setSearchError] = useState(""),
    [searchRetry, setSearchRetry] = useState(0);
  const [details, setDetails] = useState<Record<string, ComparisonProduct>>({}),
    [detailsLoading, setDetailsLoading] = useState(false),
    [detailsError, setDetailsError] = useState(""),
    [detailsRetry, setDetailsRetry] = useState(0),
    [announcement, setAnnouncement] = useState("");
  const [browseMode, setBrowseMode] = useState<"search" | "az" | "category">("search"),
    [letter, setLetter] = useState("A"),
    [category, setCategory] = useState(""),
    [page, setPage] = useState(1);
  const [catalogInfo, setCatalogInfo] = useState<Omit<PickerResponse, "products">>({
    total: 0,
    page: 1,
    pages: 1,
    categories: [],
  });
  // Our compare store keeps slug + name only; image, source and category come
  // with the loaded details.
  const selected = selectedItems.map((p) => details[p.slug] ?? p);
  const showResults = browseMode !== "search" || query.trim().length >= 2;
  const selectedKey = selected.map((p) => p.slug).join("|");
  const full = selected.length >= MAX_COMPARISON_ITEMS;
  useEffect(() => {
    const controller = new AbortController();
    setSearchError("");
    setResults([]);
    if (!showResults) {
      setSearching(false);
      return () => controller.abort();
    }
    setSearching(true);
    const timer = setTimeout(
      async () => {
        try {
          const params = new URLSearchParams({ q: query.trim(), page: String(page) });
          if (browseMode === "az") params.set("letter", letter);
          if (browseMode === "category") params.set("category", category);
          const response = await fetch("/api/ingredient-picker?" + params.toString(), { signal: controller.signal });
          if (!response.ok) throw new Error("Could not load ingredients");
          const data = (await response.json()) as PickerResponse;
          if (!controller.signal.aborted) {
            setResults(data.products);
            setCatalogInfo({ total: data.total, page: data.page, pages: data.pages, categories: data.categories });
          }
        } catch {
          if (!controller.signal.aborted) setSearchError("Ingredients are temporarily unavailable. Please try again.");
        } finally {
          if (!controller.signal.aborted) setSearching(false);
        }
      },
      query ? 220 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchRetry, browseMode, letter, category, page, showResults]);
  useEffect(() => {
    const controller = new AbortController();
    setDetailsError("");
    if (!selectedKey) {
      setDetailsLoading(false);
      return () => controller.abort();
    }
    setDetailsLoading(true);
    const params = new URLSearchParams();
    selectedKey.split("|").forEach((slug) => params.append("slug", slug));
    readProducts<ComparisonProduct>("/api/compare?" + params.toString(), controller.signal)
      .then((items) => {
        if (!controller.signal.aborted)
          setDetails((previous) => ({ ...previous, ...Object.fromEntries(items.map((p) => [p.slug, p])) }));
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setDetailsError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailsLoading(false);
      });
    return () => controller.abort();
  }, [selectedKey, detailsRetry]);
  function search(value: string) {
    setQuery(value);
    setPage(1);
    setResults([]);
    setSearchError("");
  }
  function changeBrowseMode(mode: "search" | "az" | "category") {
    setBrowseMode(mode);
    setQuery("");
    setResults([]);
    setPage(1);
  }
  function add(p: ProductMini) {
    if (onAdd(p)) setAnnouncement(p.name + " added to comparison.");
  }
  const supplierRows: DetailRow[] = [
    [
      "Source",
      (p) => (
        <SourceLink href={p.sourceUrl}>
          {sourceName(p.source)}
          {p.source === "cocojojo" ? "" : " reference"}
        </SourceLink>
      ),
    ],
    ["Manufacturer", (p) => p.manufacturer],
    ["Supplier reference", (p) => p.supplierProductId],
    ["Category", (p) => p.category],
    [
      "Catalog function tags",
      (p) =>
        p.browsingFunctions?.length ? p.browsingFunctions.join(", ") : "No supplier-specific function tags published.",
    ],
    [
      "INCI",
      (p) =>
        p.inci ? (
          <>
            {p.inci}
            {p.identityReference?.filledFields?.includes("inci") && (
              <SourceLink href={p.identityReference.sourceUrl}>
                {p.identityReference.sourceName} identity reference
              </SourceLink>
            )}
          </>
        ) : null,
    ],
    [
      "CAS / component identifiers",
      (p) =>
        p.facts?.cas || p.identityReview ? (
          <>
            {p.facts?.cas || "Supplier confirmation required"}
            {p.identityReview && <small>{p.identityReview.message}</small>}
            {p.supplierIdentityReference?.filledCAS && (
              <>
                <SourceLink href={p.supplierIdentityReference.sourceUrl}>
                  {p.supplierIdentityReference.sourceName}
                </SourceLink>
                <small>{p.supplierIdentityReference.note}</small>
              </>
            )}
            {p.identityReference?.filledFields?.includes("cas") && (
              <>
                <SourceLink href={p.identityReference.sourceUrl}>
                  {p.identityReference.sourceName} identity reference
                </SourceLink>
                <small>Confirm the identifier for the supplied grade.</small>
              </>
            )}
          </>
        ) : null,
    ],
    [
      "Cosmetic functions (reference)",
      (p) =>
        p.functionReference?.functions?.length ? (
          <>
            {p.functionReference.functions.join(", ")}
            <SourceLink href={p.functionReference.sourceUrl}>{p.functionReference.sourceName}</SourceLink>
          </>
        ) : (
          "Exact-ingredient functions require supplier confirmation."
        ),
    ],
    [
      "EC number",
      (p) =>
        p.identityReference?.ec ? (
          <>
            {p.identityReference.ec}
            <SourceLink href={p.identityReference.sourceUrl}>{p.identityReference.sourceName}</SourceLink>
          </>
        ) : null,
    ],
    ["Appearance", (p) => p.facts?.appearance],
    ["Supplier solubility", (p) => p.facts?.solubility],
    ["Published use level", (p) => p.facts?.useLevel],
    ["Supplier melting point", (p) => p.extra.meltingPoint],
    [
      "Technical documents",
      (p) =>
        p.extra.documents?.length ? (
          p.extra.documents.map((document) => (
            <SourceLink key={document.url} href={document.url}>
              {document.title}
            </SourceLink>
          ))
        ) : (
          <a
            className="cmp-source"
            href={"/contact?subject=" + encodeURIComponent("SDS, TDS and COA request: " + p.name)}
          >
            Request current technical documents
          </a>
        ),
    ],
  ];
  const formulationRows: DetailRow[] = [
    ["Applications", (p) => p.application?.join(", ")],
    ["Formulation phase", (p) => p.phase],
    ["Material / test-solution pH", (p) => p.extra.materialPH],
    ["Formulation pH range", (p) => p.extra.formulationPH],
    ["Processing temperature", (p) => p.extra.temperature],
    ["Storage conditions", (p) => p.extra.storage],
    ["Shelf life", (p) => p.extra.shelfLife],
  ];
  const chemicalRows: DetailRow[] = [
    ["Material reference type", (p) => p.coreProperties?.materialType],
    [
      "Reference identity",
      (p) =>
        p.chemical ? (
          <>
            <strong>{p.chemical.name}</strong>
            <span>CAS {p.chemical.cas}</span>
            <SourceLink href={p.chemical.sourceUrl}>
              {p.chemical.cid ? "PubChem CID " + p.chemical.cid : p.chemical.sourceName || "Primary identity source"}
            </SourceLink>
            {p.supplierCASVerified === false && (
              <small>Matched by reviewed ingredient name. Confirm the supplier’s chemical identity.</small>
            )}
          </>
        ) : (
          <span className="cmp-missing">
            No verified pure-substance profile. Request grade-specific data for oils, extracts, blends and solutions.
          </span>
        ),
    ],
    ["Molecular formula", (p) => p.chemical?.molecularFormula],
    ["Molecular weight (molar mass)", (p) => <PropertyCell property={p.coreProperties?.molecularWeight} />],
    ...physicalProperties.map(([key, label]): DetailRow => [
      label,
      (p) => {
        if (key === "meltingPoint" || key === "boilingPoint")
          return <PropertyCell property={p.coreProperties?.[key]} />;
        const observation = p.chemical?.properties[key];
        return observation ? (
          <>
            <span>{observation.value}</span>
            <SourceLink href={observation.sourceUrl}>{observation.sourceName}</SourceLink>
            <small>
              {observation.evidenceType === "reported"
                ? "Source-reported observation"
                : observation.evidenceType.replaceAll("-", " ")}
            </small>
            {observation.conditionsNote && <small>{observation.conditionsNote}</small>}
          </>
        ) : null;
      },
    ]),
  ];
  const hasIngredients = selected.some((p) => p.categoryId !== "packaging");
  const hasPackaging = selected.some((p) => p.categoryId === "packaging");
  const hasFormulationReferences = selected.some((p) => details[p.slug]?.formulationReference);
  const guideRows: DetailRow[] = [
    ["Reference scope", (p) => p.formulationReference?.matchingNote],
    ["Reference appearance", (p) => p.formulationReference?.appearance],
    ["Reference solubility", (p) => p.formulationReference?.solubility],
    ["Reference use level", (p) => p.formulationReference?.useLevel],
    ["Reference phase", (p) => p.formulationReference?.phase],
    ["Reference storage", (p) => p.formulationReference?.storage],
    [
      "Reference sources",
      (p) =>
        p.formulationReference?.sources.map((source) => (
          <SourceLink key={source.url} href={source.url}>
            {source.title}
          </SourceLink>
        )),
    ],
  ];
  function cells(rows: DetailRow[], ingredientOnly = false) {
    return rows.map(([label, get]) => (
      <tr key={label}>
        <th scope="row">{label}</th>
        {selected.map((p) => {
          const detail = details[p.slug];
          const value = ingredientOnly && p.categoryId === "packaging" ? "Not applicable" : detail ? get(detail) : null;
          return (
            <td key={p.slug}>
              {value || (
                <span className="cmp-missing">
                  {!detail
                    ? detailsError
                      ? "Details unavailable. Retry above."
                      : "Loading details…"
                    : "Not published in this reference."}
                </span>
              )}
            </td>
          );
        })}
      </tr>
    ));
  }
  function group(title: string) {
    return (
      <tr className="cmp-group">
        <th scope="row">{title}</th>
        {selected.map((p) => (
          <td key={p.slug} />
        ))}
      </tr>
    );
  }
  return (
    <div className="cmp-workspace">
      <section className="cmp-picker" aria-labelledby="cmp-add-heading">
        <div className="cmp-picker-heading">
          <div>
            <h2 id="cmp-add-heading">Add ingredients</h2>
            <p>Search, browse A–Z or choose an ingredient category.</p>
          </div>
          <span className={"cmp-count" + (full ? " cmp-count-full" : "")}>
            {selected.length} / {MAX_COMPARISON_ITEMS} selected
          </span>
        </div>
        <div className="cmp-browse-tabs" role="group" aria-label="Choose how to find ingredients">
          {(
            [
              ["search", "Search"],
              ["az", "A–Z library"],
              ["category", "Categories"],
            ] as const
          ).map(([mode, label]) => (
            <button type="button" key={mode} aria-pressed={browseMode === mode} onClick={() => changeBrowseMode(mode)}>
              {label}
            </button>
          ))}
        </div>
        {browseMode === "az" && (
          <div className="cmp-alphabet" role="group" aria-label="Browse ingredients by first letter">
            {["", "#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((value) => (
              <button
                type="button"
                key={value}
                aria-label={
                  value
                    ? "Show ingredients beginning with " + (value === "#" ? "a number or symbol" : value)
                    : "Show all ingredients"
                }
                aria-pressed={letter === value}
                onClick={() => {
                  setLetter(value);
                  setPage(1);
                }}
              >
                {value || "All"}
              </button>
            ))}
          </div>
        )}
        {browseMode === "category" && (
          <label className="cmp-category-label">
            Ingredient category
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {catalogInfo.categories.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.label} ({item.count})
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="cmp-search">
          <Search size={22} aria-hidden="true" />
          <span className="cmp-sr-only">Find an ingredient to compare</span>
          <input
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search ingredients, INCI or CAS…"
            autoComplete="off"
            aria-describedby="cmp-search-help"
          />
          {searching && <LoaderCircle className="cmp-spin" size={20} aria-label="Searching" />}
        </label>
        <p id="cmp-search-help" className="cmp-search-help">
          {full
            ? "Your comparison has 7 items. Remove an item to add a different ingredient."
            : browseMode === "search" && query.trim().length === 1
              ? "Enter at least 2 characters to search."
              : "Choose ingredients below to add them to your comparison."}
        </p>
        {browseMode === "search" && !query && (
          <div className="cmp-suggestions">
            <span>Try</span>
            {["Niacinamide", "Glycerin", "Hyaluronic acid", "Jojoba oil"].map((name) => (
              <button type="button" key={name} onClick={() => search(name)}>
                {name}
              </button>
            ))}
          </div>
        )}
        {searchError ? (
          <p className="cmp-error" role="alert">
            {searchError}{" "}
            <button type="button" onClick={() => setSearchRetry((n) => n + 1)}>
              Retry search
            </button>
          </p>
        ) : (
          showResults && (
            <div className="cmp-results" aria-busy={searching}>
              {!searching && (
                <div className="cmp-browse-summary" role="status">
                  <strong>{catalogInfo.total.toLocaleString()} ingredients</strong>
                  <span>
                    {browseMode === "az"
                      ? letter
                        ? "Beginning with " + letter
                        : "All letters"
                      : browseMode === "category"
                        ? catalogInfo.categories.find((item) => item.id === category)?.label || "All categories"
                        : "Search results"}
                  </span>
                </div>
              )}
              {searching ? (
                <p role="status">Loading ingredients…</p>
              ) : results.length ? (
                <ul aria-label="Ingredients to add">
                  {results.map((p) => {
                    const added = selected.some((item) => item.slug === p.slug);
                    return (
                      <li key={p.slug}>
                        <img src={p.image} alt="" width={46} height={46} />
                        <div>
                          <strong>{p.name}</strong>
                          <small>{sourceName(p.source)}</small>
                          <span title={p.inci || undefined}>INCI: {p.inci || "Supplier confirmation required"}</span>
                          <span>CAS: {p.facts?.cas || "Supplier confirmation required"}</span>
                          {p.identityReference?.filledFields?.some((field) => field === "inci" || field === "cas") && (
                            <small>Includes attributed identity reference</small>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={!loaded || added || full}
                          onClick={() => add(p)}
                          aria-label={added ? p.name + " already added" : "Add " + p.name + " to comparison"}
                        >
                          {added ? <Check size={17} /> : <Plus size={17} />}
                          <span>{added ? "Added" : "Add"}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p role="status">No ingredients found. Try another letter, category or search term.</p>
              )}
              {!searching && catalogInfo.pages > 1 && (
                <nav className="cmp-browse-pages" aria-label="Ingredient picker pages">
                  <button type="button" disabled={catalogInfo.page <= 1} onClick={() => setPage(catalogInfo.page - 1)}>
                    Previous
                  </button>
                  <span>
                    Page {catalogInfo.page} of {catalogInfo.pages}
                  </span>
                  <button
                    type="button"
                    disabled={catalogInfo.page >= catalogInfo.pages}
                    onClick={() => setPage(catalogInfo.page + 1)}
                  >
                    Next
                  </button>
                </nav>
              )}
            </div>
          )
        )}
      </section>
      <div className="cmp-sr-only" role="status">
        {announcement}
      </div>
      {!loaded ? (
        <div className="cmp-empty">
          {workspaceError ? (
            <>
              <p role="alert">{workspaceError}</p>
              <button className="r-btn r-primary" onClick={onRetry}>
                Retry loading comparison
              </button>
            </>
          ) : (
            <p role="status">Loading your saved comparison…</p>
          )}
        </div>
      ) : selected.length === 0 ? (
        <div className="cmp-empty">
          <GitCompareArrows size={34} />
          <h2>Add your first ingredient.</h2>
          <p>Choose 2 to 7 ingredients above to see their properties side by side.</p>
        </div>
      ) : (
        <>
          <div className="cmp-selection">
            <div className="cmp-selection-heading">
              <h2>{selected.length === 1 ? "1 ingredient selected" : selected.length + " ingredients to compare"}</h2>
              <span role="status">
                {workspaceError ? "Changes not saved" : saving ? "Saving…" : "Selections saved"}
              </span>
              <button type="button" className="cmp-clear" onClick={onClear}>
                Clear all
              </button>
            </div>
            <ul aria-label="Selected ingredients">
              {selected.map((p) => (
                <li key={p.slug}>
                  <span>{p.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(p)}
                    aria-label={"Remove " + p.name + " from comparison"}
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
            {selected.length === 1 && <p>Add another ingredient using the picker above.</p>}
            {workspaceError && (
              <p className="cmp-error" role="alert">
                {workspaceError}{" "}
                <button type="button" onClick={onRetry}>
                  {workspaceError.includes("another tab") ? "Reload saved comparison" : "Retry saving"}
                </button>
              </p>
            )}
          </div>
          <div className="cmp-table-heading">
            <h2>Properties, side by side.</h2>
            <p>Scroll sideways to view every ingredient.</p>
          </div>
          {detailsError && (
            <p className="cmp-error" role="alert">
              {detailsError}{" "}
              <button type="button" onClick={() => setDetailsRetry((n) => n + 1)}>
                Retry properties
              </button>
            </p>
          )}
          <div
            className="cmp-table-scroll"
            role="region"
            aria-label="Ingredient properties comparison, scroll horizontally for more ingredients"
            tabIndex={0}
            aria-busy={detailsLoading}
          >
            <table className="cmp-table">
              <caption className="cmp-sr-only">
                Compare published properties for {selected.length} selected ingredients.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  {selected.map((p) => (
                    <th scope="col" key={p.slug}>
                      {p.image && <img src={p.image} alt="" width={90} height={66} />}
                      <a href={productHref(p)}>{p.name}</a>
                      <small>{sourceName(p.source)}</small>
                      <button type="button" onClick={() => onRemove(p)} aria-label={"Remove " + p.name + " column"}>
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group("Material identity & supplier details")}
                {cells(supplierRows)}
                {hasPackaging &&
                  cells([
                    [
                      "Packaging details",
                      (p) =>
                        p.categoryId === "packaging"
                          ? Object.entries(p.specifications || {})
                              .map(([key, value]) => `${key}: ${value}`)
                              .join("; ")
                          : "Not applicable",
                    ],
                  ])}
              </tbody>
              {hasIngredients && (
                <>
                  <tbody>
                    {group("Formulation & handling")}
                    {cells(formulationRows, true)}
                  </tbody>
                  <tbody>
                    {group("Chemical reference")}
                    {cells(chemicalRows, true)}
                  </tbody>
                </>
              )}
              {hasFormulationReferences && (
                <tbody>
                  {group("Related formulation references")}
                  {cells(guideRows, true)}
                </tbody>
              )}
            </table>
          </div>
          <p className="cmp-reference-note">
            Supplier material details and independent pure-substance references are shown separately. Chemical reference
            values are not guaranteed specifications for a supplier grade or batch. Published conditions and qualifiers
            are retained. Missing data is marked explicitly; confirm the current SDS, TDS and COA before selecting a
            material.
          </p>
        </>
      )}
    </div>
  );
}
