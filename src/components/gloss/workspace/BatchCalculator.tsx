'use client';

import { useRef, useState } from 'react';
import { Download, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';

type AzIndex = Record<string, { id: string; name: string; slug: string }[]>;

interface CalcRow {
  id: number;
  name: string;
  /** Kept as typed, so "12." or "" can be edited without snapping. */
  pct: string;
}

const MAX_ROWS = 50;
const DATALIST_ID = 'calc-catalog-ingredients';

function pctOf(row: CalcRow) {
  const n = Number(row.pct);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

/** Quote a CSV cell and neutralise spreadsheet formula prefixes. */
function csvCell(text: string) {
  return '"' + text.replace(/"/g, '""').replace(/^[=+@-]/, "'") + '"';
}

/**
 * The prototype's batch-size calculator (fn q): batch size and unit, rows of
 * ingredient percentages, live weights, the running total, and a CSV export.
 * Ingredient names can be typed freely or picked from our catalog (the A–Z
 * index, loaded the first time a name field is focused).
 */
export function BatchCalculator() {
  const [size, setSize] = useState('100');
  const [unit, setUnit] = useState<'g' | 'kg'>('g');
  const [rows, setRows] = useState<CalcRow[]>([
    { id: 1, name: 'Ingredient 1', pct: '0' },
    { id: 2, name: 'Ingredient 2', pct: '0' },
  ]);
  const nextId = useRef(3);

  const [names, setNames] = useState<string[]>([]);
  const requested = useRef(false);
  function loadCatalog() {
    if (requested.current) return;
    requested.current = true;
    api
      .get<AzIndex>('/wholesale/products/az-index')
      .then((idx) => {
        const all = Object.values(idx || {})
          .flat()
          .map((p) => p.name);
        setNames(Array.from(new Set(all)).sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => {
        requested.current = false;
      });
  }

  const batch = Math.max(0.01, Number(size) || 0.01);
  const grams = batch * (unit === 'kg' ? 1000 : 1);
  const total = rows.reduce((n, r) => n + pctOf(r), 0);
  const complete = Math.abs(total - 100) < 0.001;
  const weight = (r: CalcRow) => (grams * pctOf(r)) / 100;

  const csv = [
    'Ingredient,Percent,Grams',
    ...rows.map((r) => `${csvCell(r.name)},${pctOf(r)},${weight(r).toFixed(3)}`),
  ].join('\n');

  const setRow = (id: number, patch: Partial<CalcRow>) =>
    setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="r-calculator">
      <div className="r-calc-intro">
        <span className="r-eyebrow">Batch-size calculator</span>
        <h2>
          From percentages
          <br />
          to your next batch.
        </h2>
        <p>
          Enter your own formula percentages to calculate ingredient weights. This is a weighing tool, not a validated
          formula.
        </p>
        <div className="r-batch-fields">
          <div className="r-field">
            <label htmlFor="calc-batch-size">Batch size</label>
            <input
              id="calc-batch-size"
              type="number"
              min={0.01}
              step="any"
              inputMode="decimal"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              onBlur={() => setSize(String(batch))}
            />
          </div>
          <div className="r-field">
            <label htmlFor="calc-unit">Unit</label>
            <select id="calc-unit" value={unit} onChange={(e) => setUnit(e.target.value as 'g' | 'kg')}>
              <option value="g">Grams</option>
              <option value="kg">Kilograms</option>
            </select>
          </div>
        </div>
        <div className={'r-formula-total ' + (complete ? 'complete' : '')} aria-live="polite">
          <strong>{total.toFixed(2)}%</strong>
          <span>
            {complete
              ? 'Formula totals 100%'
              : total > 100
                ? 'Reduce percentages to total 100%'
                : (100 - total).toFixed(2) + '% remaining'}
          </span>
        </div>
      </div>

      <div>
        <div className="r-calc-table">
          {rows.map((r, i) => (
            <div className="r-calc-row" key={r.id}>
              <div className="r-field">
                <label htmlFor={'calc-name-' + r.id}>Ingredient {i + 1}</label>
                <input
                  id={'calc-name-' + r.id}
                  list={DATALIST_ID}
                  value={r.name}
                  maxLength={120}
                  onFocus={loadCatalog}
                  onChange={(e) => setRow(r.id, { name: e.target.value })}
                />
              </div>
              <div className="r-field">
                <label htmlFor={'calc-pct-' + r.id}>Percentage</label>
                <input
                  id={'calc-pct-' + r.id}
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  inputMode="decimal"
                  value={r.pct}
                  onChange={(e) => setRow(r.id, { pct: e.target.value })}
                  onBlur={() => setRow(r.id, { pct: String(pctOf(r)) })}
                />
              </div>
              <strong>{weight(r).toFixed(3)} g</strong>
              <button
                type="button"
                className="r-icon-button"
                aria-label={'Remove ingredient ' + (i + 1)}
                onClick={() => setRows((list) => list.filter((x) => x.id !== r.id))}
              >
                <X size={17} />
              </button>
            </div>
          ))}
        </div>
        <datalist id={DATALIST_ID}>
          {names.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <div className="r-calc-actions">
          <button
            type="button"
            className="r-btn r-outline"
            disabled={rows.length >= MAX_ROWS}
            onClick={() =>
              setRows((list) => [...list, { id: nextId.current++, name: 'Ingredient ' + (list.length + 1), pct: '0' }])
            }
          >
            <Plus size={17} />
            Add ingredient
          </button>
          <a
            className="r-btn r-primary"
            download="cocojojo-batch.csv"
            href={'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)}
          >
            <Download size={17} />
            Download weights
          </a>
        </div>
        <p className="r-fine">
          The calculator does not evaluate compatibility, preservation, safety or regulatory suitability.
        </p>
      </div>
    </div>
  );
}
