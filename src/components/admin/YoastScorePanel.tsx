'use client';

import { useEffect, useMemo, useState } from 'react';
import { analyzeWithYoast, YoastAnalysis, YoastInput, YoastRating } from '@/lib/yoastAnalysis';

const RATING_DOT: Record<string, string> = {
  good: 'bg-green-500',
  ok: 'bg-amber-500',
  bad: 'bg-red-500',
  feedback: 'bg-slate-300',
};

function ratingTone(rating: YoastRating) {
  if (rating === 'good') return { text: 'text-green-700', bar: 'bg-green-500', label: 'Good' };
  if (rating === 'ok') return { text: 'text-amber-700', bar: 'bg-amber-500', label: 'OK' };
  if (rating === 'bad') return { text: 'text-red-700', bar: 'bg-red-500', label: 'Needs work' };
  return { text: 'text-slate-600', bar: 'bg-slate-400', label: '—' };
}

function Section({
  title,
  score,
  rating,
  results,
  unavailableNote,
}: {
  title: string;
  score: number;
  rating: YoastRating;
  results: YoastAnalysis['seo']['results'];
  /** When set, replaces the score and bar — see YoastAnalysis.seo.available. */
  unavailableNote?: string;
}) {
  const tone = ratingTone(rating);
  // Worst first — that is the to-do list. Yoast scores each assessment 0–9.
  const relevant = results.filter((r) => !r.notApplicable).sort((a, b) => a.score - b.score);
  const skipped = results.filter((r) => r.notApplicable);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
        {unavailableNote ? (
          <span className="text-[11px] text-slate-400">{unavailableNote}</span>
        ) : (
          <>
            <span className={`text-sm font-semibold tabular-nums ${tone.text}`}>{score}</span>
            <span className="text-[11px] text-slate-400">/ 100</span>
            <span className={`text-[11px] font-medium ${tone.text}`}>{tone.label}</span>
          </>
        )}
      </div>
      {!unavailableNote && (
        <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all ${tone.bar}`} style={{ width: `${score}%` }} />
        </div>
      )}
      <ul className="space-y-1">
        {relevant.map((r) => (
          <li key={r.id} className="flex gap-2 text-xs leading-relaxed">
            <span
              aria-hidden
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${RATING_DOT[r.rating] || 'bg-slate-300'}`}
            />
            <span className={r.rating === 'good' ? 'text-slate-500' : 'text-slate-700'}>{r.text}</span>
          </li>
        ))}
      </ul>
      {skipped.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] text-slate-400">
            {skipped.length} check{skipped.length === 1 ? '' : 's'} that don&apos;t apply to product pages
          </summary>
          <ul className="mt-1 space-y-1 border-l-2 border-slate-100 pl-2">
            {skipped.map((r) => (
              <li key={r.id} className="text-[11px] leading-relaxed text-slate-400">
                {r.text}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/**
 * The real Yoast engine's verdict, shown next to our own analyser.
 *
 * It runs entirely in this browser — no API call — so it costs a round trip of
 * nothing and works on an unsaved draft. The engine chunk is ~a megabyte, so it
 * is loaded lazily on first analysis and only on this page.
 *
 * Yoast's thresholds are written for blog articles (300+ words, subheadings,
 * outbound links). That is why its score sits lower than ours on a perfectly
 * good ingredient page, and why the checks it cannot fairly judge are folded
 * away rather than presented as failures to chase.
 */
export function YoastScorePanel({ draft }: { draft: YoastInput }) {
  const [debounced, setDebounced] = useState(draft);
  const [analysis, setAnalysis] = useState<YoastAnalysis | null>(null);
  const [failed, setFailed] = useState(false);

  const key = useMemo(() => JSON.stringify(draft), [draft]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(draft), 600);
    return () => clearTimeout(t);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!debounced.name?.trim()) return;
    let cancelled = false;
    analyzeWithYoast(debounced)
      .then((result) => {
        if (!cancelled) {
          setAnalysis(result);
          setFailed(false);
        }
      })
      // A failure here must never take the editor down with it — the product
      // form has to stay usable whether or not a third-party analyser loads.
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  if (!draft.name?.trim()) return null;

  if (failed && !analysis) {
    return <p className="text-xs text-slate-400">Yoast analysis unavailable.</p>;
  }

  if (!analysis) {
    return <p className="text-xs text-slate-400">Loading Yoast analysis…</p>;
  }

  return (
    <div className="space-y-4">
      <Section
        title="Yoast SEO"
        score={analysis.seo.score}
        rating={analysis.seo.rating}
        results={analysis.seo.results}
        unavailableNote={
          analysis.seo.available ? undefined : 'No score — set a focus keyphrase first'
        }
      />
      <Section
        title="Yoast readability"
        score={analysis.readability.score}
        rating={analysis.readability.rating}
        results={analysis.readability.results}
      />
      <p className="text-[11px] leading-relaxed text-slate-400">
        Yoast&apos;s thresholds are written for blog articles, so its score runs lower than the
        catalogue score above on a page that is genuinely fine. Treat it as a second opinion on
        writing quality, not a target to hit.
      </p>
    </div>
  );
}
