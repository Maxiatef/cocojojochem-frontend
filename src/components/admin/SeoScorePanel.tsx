'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProductSeoAnalysis, ProductSeoDraft, SeoCheck } from '@/lib/types';

const GROUP_LABEL: Record<SeoCheck['group'], string> = {
  keyphrase: 'Keyphrase',
  metadata: 'Search appearance',
  content: 'Content',
  media: 'Images',
};

const GROUP_ORDER: SeoCheck['group'][] = ['keyphrase', 'metadata', 'content', 'media'];

/** Compares keyphrases the way the analyser does — case and spacing aside. */
function normaliseKeyphrase(value: string | null | undefined): string {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function scoreTone(score: number) {
  if (score >= 80) return { text: 'text-green-700', bar: 'bg-green-500', label: 'Good' };
  if (score >= 50) return { text: 'text-amber-700', bar: 'bg-amber-500', label: 'Needs work' };
  return { text: 'text-red-700', bar: 'bg-red-500', label: 'Poor' };
}

function StatusDot({ status }: { status: SeoCheck['status'] }) {
  const cls =
    status === 'good' ? 'bg-green-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500';
  return (
    <span
      aria-hidden
      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cls}`}
    />
  );
}

/**
 * Live SEO feedback for the product being edited — the score, and a list of
 * what to fix.
 *
 * The analysis runs on the SERVER rather than in the browser, for two reasons:
 * the duplicate-title and duplicate-description checks need the rest of the
 * catalogue, and sharing one implementation is what keeps this number
 * identical to the one stored on save. The cost is a round trip, so the draft
 * is debounced rather than sent on every keystroke.
 */
export function SeoScorePanel({
  draft,
  onApplyKeyphrase,
}: {
  draft: ProductSeoDraft;
  /** Fills the Focus Keyphrase field from the suggestion. */
  onApplyKeyphrase?: (keyphrase: string) => void;
}) {
  const [debounced, setDebounced] = useState(draft);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(draft), 600);
    return () => clearTimeout(t);
    // Serialised so the effect compares by value — the parent rebuilds this
    // object on every render, and comparing by reference would re-fire forever.
  }, [JSON.stringify(draft)]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product-seo-analysis', debounced],
    queryFn: () => api.post<ProductSeoAnalysis>('/seo-analyzer/product', debounced),
    // A product needs a name before any of this means anything.
    enabled: !!debounced.name?.trim(),
    // Keeps the previous result on screen while the next one loads, so the
    // panel doesn't flash empty on every pause in typing.
    placeholderData: (previous) => previous,
  });

  const grouped = useMemo(() => {
    const map = new Map<SeoCheck['group'], SeoCheck[]>();
    for (const check of data?.checks || []) {
      map.set(check.group, [...(map.get(check.group) || []), check]);
    }
    // Problems first inside each group — that is the to-do list.
    const weight = { bad: 0, warning: 1, good: 2 };
    for (const [, list] of map) list.sort((a, b) => weight[a.status] - weight[b.status]);
    return map;
  }, [data]);

  if (!draft.name?.trim()) {
    return (
      <p className="text-xs text-slate-400">
        Enter a product name to see its SEO score.
      </p>
    );
  }

  if (isError) {
    return <p className="text-xs text-red-600">Couldn&apos;t analyse this product.</p>;
  }

  if (!data) {
    return <p className="text-xs text-slate-400">Analysing…</p>;
  }

  const tone = scoreTone(data.score);

  return (
    <div className={isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      <div className="mb-3 flex items-center gap-3">
        <span className={`text-2xl font-semibold tabular-nums ${tone.text}`}>{data.score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
        <span className={`text-xs font-medium ${tone.text}`}>{tone.label}</span>
        <div className="ml-auto text-xs text-slate-500">
          {data.summary.bad > 0 && (
            <span className="text-red-600">
              {data.summary.bad} problem{data.summary.bad === 1 ? '' : 's'}
            </span>
          )}
          {data.summary.bad > 0 && data.summary.warning > 0 && ' · '}
          {data.summary.warning > 0 && (
            <span className="text-amber-600">{data.summary.warning} to improve</span>
          )}
          {data.summary.bad === 0 && data.summary.warning === 0 && (
            <span className="text-green-600">All checks pass</span>
          )}
        </div>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${tone.bar}`}
          style={{ width: `${data.score}%` }}
        />
      </div>

      {/* Without a keyphrase every check in the keyphrase group fails, and
          "add a keyphrase" is useless advice if you don't know what to write.
          So name one, taken from the product's own INCI/name, and make it a
          single click. Hidden once a keyphrase is set, or once it matches. */}
      {data.suggestedKeyphrase &&
        normaliseKeyphrase(draft.focusKeyphrase) !== normaliseKeyphrase(data.suggestedKeyphrase) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
            <span>
              {draft.focusKeyphrase?.trim() ? 'Suggested keyphrase:' : 'Use this keyphrase:'}{' '}
              <strong className="font-semibold">{data.suggestedKeyphrase}</strong>
            </span>
            {onApplyKeyphrase && (
              <button
                type="button"
                onClick={() => onApplyKeyphrase(data.suggestedKeyphrase as string)}
                className="ml-auto rounded-md border border-brand-300 bg-white px-2 py-1 font-medium text-brand-700 transition hover:bg-brand-100"
              >
                {draft.focusKeyphrase?.trim() ? 'Replace' : 'Use it'}
              </button>
            )}
          </div>
        )}

      <div className="space-y-3">
        {GROUP_ORDER.map((group) => {
          const checks = grouped.get(group);
          if (!checks?.length) return null;
          return (
            <div key={group}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {GROUP_LABEL[group]}
              </p>
              <ul className="space-y-1">
                {checks.map((c) => (
                  <li key={c.id} className="flex gap-2 text-xs leading-relaxed">
                    <StatusDot status={c.status} />
                    <span
                      className={
                        c.status === 'good' ? 'text-slate-500' : 'text-slate-700'
                      }
                    >
                      {c.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
