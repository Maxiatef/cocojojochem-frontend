'use client';

import { AuditChildChange, AuditFieldChange } from '@/lib/types';

const REDACTED = '«redacted»';

/**
 * Renders one value as it should read in a diff.
 *
 * Empty, null and undefined all collapse to a visible "empty" marker rather
 * than rendering as nothing — "the field went from blank to 24.00" has to be
 * legible, and an empty cell looks like a rendering bug.
 */
function formatValue(value: unknown): { text: string; muted: boolean } {
  if (value === null || value === undefined) return { text: '—', muted: true };
  if (value === '') return { text: 'empty', muted: true };
  if (typeof value === 'boolean') return { text: value ? 'yes' : 'no', muted: false };
  if (value === REDACTED) return { text: REDACTED, muted: true };

  if (typeof value === 'string') {
    // ISO timestamps are unreadable raw; anything else passes through.
    if (/^\d{4}-\d{2}-\d{2}T[\d:.]+Z?$/.test(value)) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return { text: d.toLocaleString(), muted: false };
    }
    return { text: value, muted: false };
  }

  if (typeof value === 'object') return { text: JSON.stringify(value), muted: false };
  return { text: String(value), muted: false };
}

function humanizeField(field: string): string {
  return field
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

function Value({ value, tone }: { value: unknown; tone: 'before' | 'after' }) {
  const { text, muted } = formatValue(value);
  const isRedacted = text === REDACTED;

  const base = muted ? 'text-slate-400 italic' : '';
  const toned = isRedacted
    ? 'text-slate-500 italic'
    : tone === 'before'
      ? 'text-red-700 line-through decoration-red-300'
      : 'text-green-700';

  return (
    <span className={`break-all ${muted || isRedacted ? base : toned}`} title={text}>
      {text.length > 300 ? `${text.slice(0, 300)}…` : text}
    </span>
  );
}

/**
 * The before/after table for one record's changed fields.
 *
 * Only changed fields are ever present — the backend never records a field
 * that stayed the same — so every row here is something the actor actually did.
 */
export function AuditDiffTable({ changes }: { changes: AuditFieldChange[] }) {
  if (changes.length === 0) {
    return <p className="text-sm text-slate-400">No field-level changes recorded.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-1.5 pr-3 font-medium">Field</th>
            <th className="py-1.5 pr-3 font-medium">Before</th>
            <th className="py-1.5 font-medium">After</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr key={c.field} className="border-b border-slate-100 align-top last:border-0">
              <td className="py-1.5 pr-3 font-medium text-slate-700">{humanizeField(c.field)}</td>
              <td className="py-1.5 pr-3">
                <Value value={c.before} tone="before" />
              </td>
              <td className="py-1.5">
                <Value value={c.after} tone="after" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Columns that carry no information for a reader: the row's own key, the
// foreign key back to the parent they're already looking at, and the ORM's
// bookkeeping timestamps.
const NOISE_FIELDS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'productId',
  'orderId',
  'quoteRequestId',
  'couponId',
  'sortOrder',
]);

/**
 * The stored values of a row that was added or removed. Without this an
 * "Added" line says only *that* something appeared, not what it was.
 */
function ValueList({ values }: { values: Record<string, unknown> }) {
  const entries = Object.entries(values).filter(
    ([field, value]) => !NOISE_FIELDS.has(field) && value !== null && value !== undefined && value !== '',
  );
  if (entries.length === 0) return null;

  return (
    <dl className="mt-1.5 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
      {entries.map(([field, value]) => {
        const { text } = formatValue(value);
        return (
          <div key={field} className="flex gap-2 text-xs">
            <dt className="shrink-0 text-slate-500">{humanizeField(field)}</dt>
            <dd className="min-w-0 flex-1 truncate text-slate-700" title={text}>
              {text}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/**
 * At-a-glance chips for what happened to a record's child rows.
 *
 * The entry's own action stays UPDATE — the product was updated, not deleted,
 * and marking it DELETE would make a "show me deletions" filter return
 * products that still exist. These chips carry the deletion instead, so a
 * removed variant reads as a removal in the list without lying about what
 * happened to the parent.
 */
export function ChildChangeChips({ childChanges }: { childChanges: AuditChildChange[] }) {
  const chips: { key: string; text: string; className: string }[] = [];

  for (const child of childChanges) {
    const noun = humanizeField(child.entity).toLowerCase();
    if (child.removed.length) {
      chips.push({
        key: `${child.entity}-r`,
        text: `−${child.removed.length} ${noun}`,
        className: 'bg-red-50 text-red-700',
      });
    }
    if (child.added.length) {
      chips.push({
        key: `${child.entity}-a`,
        text: `+${child.added.length} ${noun}`,
        className: 'bg-green-50 text-green-700',
      });
    }
    if (child.modified.length) {
      chips.push({
        key: `${child.entity}-m`,
        text: `~${child.modified.length} ${noun}`,
        className: 'bg-amber-50 text-amber-700',
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <span className="inline-flex flex-wrap gap-1 align-middle">
      {chips.map((c) => (
        <span
          key={c.key}
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${c.className}`}
        >
          {c.text}
        </span>
      ))}
    </span>
  );
}

/**
 * What happened to a record's child collections — a product's variants,
 * images, documents and specs — in the same action.
 *
 * These are folded into the parent's entry rather than listed as their own
 * log lines, so one admin action reads as one entry.
 */
export function AuditChildChanges({ childChanges }: { childChanges: AuditChildChange[] }) {
  return (
    <div className="space-y-4">
      {childChanges.map((child) => (
        <div key={child.entity}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {humanizeField(child.entity)}
          </p>

          <div className="space-y-2">
            {child.added.map((row) => (
              <div
                key={`a-${row.id}`}
                className="rounded-lg border border-green-100 bg-green-50/60 px-3 py-2 text-sm"
              >
                <span className="font-medium text-green-800">Added</span>{' '}
                <span className="text-slate-700">{row.label || `#${row.id}`}</span>
                <ValueList values={row.values} />
              </div>
            ))}

            {child.removed.map((row) => (
              <div
                key={`r-${row.id}`}
                className="rounded-lg border border-red-100 bg-red-50/60 px-3 py-2 text-sm"
              >
                <span className="font-medium text-red-800">Removed</span>{' '}
                <span className="text-slate-700">{row.label || `#${row.id}`}</span>
                <ValueList values={row.values} />
              </div>
            ))}

            {child.modified.map((row) => (
              <div key={`m-${row.id}`} className="rounded-lg border border-slate-200 px-3 py-2">
                <p className="mb-1.5 text-sm">
                  <span className="font-medium text-amber-800">Changed</span>{' '}
                  <span className="text-slate-700">{row.label || `#${row.id}`}</span>
                </p>
                <AuditDiffTable changes={row.changes} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
