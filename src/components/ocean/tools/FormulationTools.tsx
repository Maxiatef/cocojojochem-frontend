"use client";
import { useState, useRef } from "react";
import {
  Calculator,
  Search,
  Download,
  RotateCcw,
  Plus,
  X,
  FlaskConical,
  BookOpen,
  FileText,
  GitCompareArrows,
} from "lucide-react";
import { formulationTools, toolTabs, calculateTool, type FormulationTool } from "@/lib/ocean/formulation-math";
const fmt = (n: number, d = 3) =>
  n !== 0 && (Math.abs(n) < 10 ** -d || Math.abs(n) >= 1e12)
    ? n.toExponential(3)
    : n.toLocaleString("en-US", { maximumFractionDigits: d });
function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^\s*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
const csvUrl = (rows: unknown[][]) =>
  "data:text/csv;charset=utf-8," +
  encodeURIComponent("\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"));
const sourceByTab: Record<string, string> = {
  batch: "https://goldbook.iupac.org/terms/view/M03722",
  concentration: "https://goldbook.iupac.org/terms/view/M03722",
  emulsion: "https://docs.chemaxon.com/lts-platinum/attachments/attachments_1831051_1_The_HLB_System.pdf",
  quality: "https://www.iso.org/standard/63465.html",
};
const sourceByTool: Record<string, string> = {
  molarity: "https://www.sigmaaldrich.com/US/en/support/calculators-and-apps/mass-molarity-calculator",
  viscosity:
    "https://www.brookfieldengineering.com/brookfield-university/viscosityrheology/principle-of-viscometer-operations",
  buffer: "https://goldbook.iupac.org/terms/view/H02781",
  "ionic-strength": "https://goldbook.iupac.org/terms/view/I03180",
  rcf: "https://www.sigmaaldrich.com/US/en/support/calculators-and-apps/g-force-calculator",
  saponification: "https://gso-sims-preview-doc-aws.s3-eu-west-1.amazonaws.com/iso-3657-2023-en.html",
  "molar-dilution": "https://www.sigmaaldrich.com/US/en/support/calculators-and-apps/solution-dilution-calculator",
};
function Calculation({ tool }: { tool: FormulationTool }) {
  const defaults = () => Object.fromEntries(tool.fields.map((f) => [f.key, String(f.value)]));
  const [inputs, setInputs] = useState<Record<string, string>>(defaults);
  const values = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, v.trim() === "" ? NaN : Number(v)]));
  let error = "",
    results: ReturnType<typeof calculateTool> = [];
  try {
    results = calculateTool(tool, values);
  } catch (e) {
    error = (e as Error).message;
  }
  const source = sourceByTool[tool.id] || tool.source || sourceByTab[tool.tab];
  const rows = [
    ["COCOJOJO formulation calculation", tool.name],
    ["Field", "Value"],
    ...tool.fields.map((f) => [f.label, inputs[f.key]]),
    [],
    ["Result", "Value", "Unit"],
    ...results.map((r) => [r.label, r.value, r.unit]),
    [],
    ["Method", tool.formula],
    ["Scope", tool.note],
  ];
  return (
    <article className="ft-calculation">
      <div className="ft-calculation-head">
        <div>
          <span className="r-eyebrow">{toolTabs.find((t) => t.id === tool.tab)?.label}</span>
          <h2>{tool.name}</h2>
          <p>{tool.description}</p>
        </div>
        <button className="ft-reset" onClick={() => setInputs(defaults())}>
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
      <div className="ft-inputs">
        {tool.fields.map((field) => (
          <label className="r-field" key={field.key}>
            {field.label}
            <input
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              step="any"
              value={inputs[field.key]}
              onChange={(e) => setInputs({ ...inputs, [field.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className={"ft-results " + (error ? "ft-invalid" : "")} aria-live="polite" aria-atomic="true">
        {error ? (
          <p>{error}</p>
        ) : (
          results.map((result) => (
            <div key={result.label + result.unit}>
              <span>{result.label}</span>
              <strong>
                {fmt(result.value, result.digits ?? 3)} <small>{result.unit}</small>
              </strong>
            </div>
          ))
        )}
      </div>
      <div className="ft-method">
        <span>Calculation</span>
        <p>{tool.formula}</p>
      </div>
      <p className="ft-note">{tool.note}</p>
      <div className="ft-bottom-actions">
        {!error && (
          <a className="r-btn r-primary" download={"cocojojo-" + tool.id + ".csv"} href={csvUrl(rows)}>
            <Download size={17} />
            Download calculation
          </a>
        )}
        {source && (
          <a href={source} target="_blank" rel="noopener noreferrer" className="r-text-link">
            Method reference
          </a>
        )}
      </div>
    </article>
  );
}
function FormulaWorksheet() {
  const nextId = useRef(4);
  const [batch, setBatch] = useState("1000"),
    [unit, setUnit] = useState("g"),
    [mode, setMode] = useState("percent");
  const [rows, setRows] = useState([
    { id: 1, name: "Material 1", phase: "A", amount: "70", cost: "" },
    { id: 2, name: "Material 2", phase: "B", amount: "25", cost: "" },
    { id: 3, name: "Material 3", phase: "C", amount: "5", cost: "" },
  ]);
  const amount = (s: string) => (s.trim() === "" ? NaN : Number(s)),
    total = rows.reduce((n, r) => n + amount(r.amount), 0),
    grams = amount(batch) * (unit === "kg" ? 1000 : 1);
  const valid =
    Number.isFinite(total) &&
    total > 0 &&
    Number.isFinite(grams) &&
    grams > 0 &&
    rows.every(
      (r) => amount(r.amount) >= 0 && (r.cost === "" || (Number.isFinite(Number(r.cost)) && Number(r.cost) >= 0)),
    );
  const balanced = mode === "weight" || Math.abs(total - 100) < 0.0001;
  const scaled = rows.map((r) => ({
    ...r,
    pct: mode === "percent" ? amount(r.amount) : (amount(r.amount) / total) * 100,
    mass: grams * (mode === "percent" ? amount(r.amount) / 100 : amount(r.amount) / total),
  }));
  const fullCost = rows.every((r) => r.cost.trim() !== ""),
    cost = scaled.reduce((n, r) => n + (r.mass / 1000) * Number(r.cost), 0);
  const phases = [...new Set(rows.map((r) => r.phase))].map((p) => ({
    name: p,
    mass: scaled.filter((r) => r.phase === p).reduce((n, r) => n + r.mass, 0),
  }));
  const change = (id: number, key: string, value: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  function balance() {
    const rest = 100 - total;
    if (!valid || mode !== "percent" || rest <= 0) return;
    setRows((rs) => [
      ...rs,
      { id: nextId.current++, name: "Balance carrier (q.s.)", phase: "A", amount: String(rest), cost: "" },
    ]);
  }
  const exportRows = [
    ["COCOJOJO batch worksheet"],
    ["Target batch (g)", grams],
    ["Basis", mode === "percent" ? "Formula % w/w" : "Scaled from entered weights"],
    [],
    ["Ingredient", "Phase", "Percent w/w", "Weight g", "Cost USD/kg", "Cost USD"],
    ...scaled.map((r) => [
      r.name,
      r.phase,
      r.pct,
      r.mass,
      r.cost,
      r.cost === "" ? "" : (r.mass / 1000) * Number(r.cost),
    ]),
    [],
    ["Entered total", total],
    ["Formula balanced", balanced ? "Yes" : "No"],
    ["Planning worksheet only. Validate the complete formulation."],
  ];
  return (
    <article className="ft-calculation">
      <div className="ft-calculation-head">
        <div>
          <span className="r-eyebrow">Formula worksheet</span>
          <h2>One formula. Any batch size.</h2>
          <p>
            Convert percentages or an existing weighed formula into batch weights, phase totals and ingredient costs.
          </p>
        </div>
        <FlaskConical className="ft-tool-icon" size={34} />
      </div>
      <div className="ft-inputs ft-work-controls">
        <label className="r-field">
          Target batch
          <input type="number" min="0.001" step="any" value={batch} onChange={(e) => setBatch(e.target.value)} />
        </label>
        <label className="r-field">
          Batch unit
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="g">Grams</option>
            <option value="kg">Kilograms</option>
          </select>
        </label>
        <label className="r-field">
          Input basis
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="percent">Formula percentages</option>
            <option value="weight">Existing weights in grams</option>
          </select>
        </label>
      </div>
      <p className="ft-example">
        The starting rows are a calculation example, not a cosmetic formula. Replace them with your materials.
      </p>
      <div className="ft-worksheet-scroll">
        <table className="ft-worksheet">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Phase</th>
              <th>{mode === "percent" ? "% w/w" : "Original g"}</th>
              <th>Cost $/kg</th>
              <th>Batch g</th>
              <th>
                <span className="r-visually-hidden">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {scaled.map((row, i) => (
              <tr key={row.id}>
                <td>
                  <input
                    aria-label={"Ingredient " + (i + 1) + " name"}
                    value={row.name}
                    maxLength={120}
                    onChange={(e) => change(row.id, "name", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    aria-label={"Ingredient " + (i + 1) + " phase"}
                    value={row.phase}
                    onChange={(e) => change(row.id, "phase", e.target.value)}
                  >
                    {["A", "B", "C", "D"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    aria-label={"Ingredient " + (i + 1) + " amount"}
                    value={row.amount}
                    onChange={(e) => change(row.id, "amount", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    aria-label={"Ingredient " + (i + 1) + " cost per kg"}
                    value={row.cost}
                    placeholder="Optional"
                    onChange={(e) => change(row.id, "cost", e.target.value)}
                  />
                </td>
                <td>
                  <output>{valid ? fmt(row.mass) : "Enter values"}</output>
                </td>
                <td>
                  <button
                    disabled={rows.length === 1}
                    className="r-icon-button"
                    aria-label={"Remove ingredient " + (i + 1)}
                    onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ft-row-actions">
        <button
          className="r-btn r-outline"
          disabled={rows.length >= 100}
          onClick={() =>
            setRows((rs) => [...rs, { id: nextId.current++, name: "", phase: "A", amount: "0", cost: "" }])
          }
        >
          <Plus size={16} />
          Add ingredient
        </button>
        {mode === "percent" && (
          <>
            <button className="r-btn r-outline" disabled={!valid || total >= 100} onClick={balance}>
              Add q.s. carrier
            </button>
            <button
              className="ft-text-button"
              disabled={!valid || balanced}
              onClick={() =>
                setRows((rs) => rs.map((r) => ({ ...r, amount: String((amount(r.amount) / total) * 100) })))
              }
            >
              Normalize to 100%
            </button>
          </>
        )}
      </div>
      <div className={"ft-results " + (!valid || !balanced ? "ft-invalid" : "")} aria-live="polite">
        {!valid ? (
          <p>
            Enter a positive batch and valid nonnegative ingredient amounts. The ingredient total must be greater than
            zero.
          </p>
        ) : (
          <>
            <div>
              <span>{mode === "percent" ? "Formula total" : "Original total"}</span>
              <strong>
                {fmt(total)} <small>{mode === "percent" ? "%" : "g"}</small>
              </strong>
              {!balanced && (
                <p>
                  {total > 100
                    ? "Formula exceeds 100%. Adjust or explicitly normalize."
                    : fmt(100 - total) + "% remains. Add a balance ingredient or adjust your formula."}
                </p>
              )}
            </div>
            {phases.map((p) => (
              <div key={p.name}>
                <span>Phase {p.name}</span>
                <strong>
                  {fmt(p.mass)} <small>g</small>
                </strong>
              </div>
            ))}
            <div>
              <span>{fullCost ? "Raw material cost" : "Entered cost subtotal"}</span>
              <strong>${fmt(cost, 2)}</strong>
              {!fullCost && <small>Some ingredient costs are missing</small>}
            </div>
          </>
        )}
      </div>
      <p className="ft-note">
        Normalization changes every percentage. Cost totals exclude packaging, labor and testing. Phase labels organize
        weighing and do not define processing order.
      </p>
      {valid && balanced && (
        <a className="r-btn r-primary" href={csvUrl(exportRows)} download="cocojojo-formula-worksheet.csv">
          <Download size={17} />
          Download batch sheet
        </a>
      )}
    </article>
  );
}
export default function FormulationTools() {
  const [tab, setTab] = useState("batch"),
    [selected, setSelected] = useState("worksheet"),
    [search, setSearch] = useState("");
  const list = formulationTools.filter((t) =>
    search ? `${t.name} ${t.description}`.toLowerCase().includes(search.toLowerCase()) : t.tab === tab,
  );
  const current = formulationTools.find((t) => t.id === selected);
  function chooseTab(id: string) {
    setTab(id);
    setSearch("");
    setSelected(id === "batch" ? "worksheet" : formulationTools.find((t) => t.tab === id)!.id);
  }
  return (
    <div className="ft-studio">
      <div className="ft-toolbar">
        <div>
          <span className="ft-count">
            <Calculator size={18} />
            {formulationTools.length + 1} formulation tools
          </span>
          <p>Calculate, compare and plan with clear inputs and traceable methods.</p>
        </div>
        <label className="ft-search">
          <Search size={19} />
          <span className="r-visually-hidden">Find a formulation tool</span>
          <input
            placeholder="Find a tool: HLB, dilution, cost…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button aria-label="Clear tool search" onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}
        </label>
      </div>
      <div className="ft-tabs" role="tablist" aria-label="Formulation tool categories">
        {toolTabs.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            id={"ft-tab-" + t.id}
            aria-selected={tab === t.id}
            aria-controls="ft-panel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => chooseTab(t.id)}
            onKeyDown={(e) => {
              const n =
                e.key === "ArrowRight"
                  ? (i + 1) % toolTabs.length
                  : e.key === "ArrowLeft"
                    ? (i + toolTabs.length - 1) % toolTabs.length
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? toolTabs.length - 1
                        : -1;
              if (n >= 0) {
                e.preventDefault();
                chooseTab(toolTabs[n].id);
                document.getElementById("ft-tab-" + toolTabs[n].id)?.focus();
              }
            }}
          >
            {t.label}
            <span>{formulationTools.filter((x) => x.tab === t.id).length + (t.id === "batch" ? 1 : 0)}</span>
          </button>
        ))}
      </div>
      <div className="ft-layout" role="tabpanel" id="ft-panel" aria-labelledby={"ft-tab-" + tab}>
        <nav className="ft-tool-list" aria-label="Choose a formulation tool">
          {((!search && tab === "batch") ||
            (search && "formula worksheet batch percentage".includes(search.toLowerCase()))) && (
            <button aria-pressed={selected === "worksheet"} onClick={() => setSelected("worksheet")}>
              <span>Formula worksheet</span>
              <small>Weights, phases & cost</small>
            </button>
          )}
          {list.map((tool) => (
            <button
              key={tool.id}
              aria-pressed={selected === tool.id}
              onClick={() => {
                setSelected(tool.id);
                setTab(tool.tab);
              }}
            >
              <span>{tool.name}</span>
              <small>{toolTabs.find((t) => t.id === tool.tab)?.label}</small>
            </button>
          ))}
          {!list.length && search && (
            <p className="ft-no-results">No matching tool. Try “mass”, “active”, “HLB” or “yield”.</p>
          )}
        </nav>
        <div className="ft-panel-body">
          <div hidden={selected !== "worksheet"}>
            <FormulaWorksheet />
          </div>
          {selected !== "worksheet" && current && <Calculation key={current.id} tool={current} />}
        </div>
      </div>
      <p className="ft-scope">
        Planning calculations use your inputs. Confirm the supplied ingredient specifications and validate
        compatibility, preservation, stability and the finished formulation.
      </p>
      <div className="ft-resource-grid">
        <a href="/compare">
          <GitCompareArrows />
          <h3>Compare ingredients</h3>
          <p>Review published identity and properties side by side.</p>
        </a>
        <a href="/projects">
          <BookOpen />
          <h3>Project workspace</h3>
          <p>Keep your material shortlist and development notes.</p>
        </a>
        <a href="/documents">
          <FileText />
          <h3>Technical documents</h3>
          <p>Find supplier specifications and safety data.</p>
        </a>
      </div>
    </div>
  );
}
