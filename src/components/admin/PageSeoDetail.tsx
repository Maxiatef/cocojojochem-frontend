'use client';

import { PageYoastCheck, SeoMetric } from '@/lib/types';
import { PageSeoFields } from '@/components/admin/PageSeoFields';

/**
 * One crawled page's full Yoast report, shown under its row in the SEO table.
 *
 * Laid out like the product editor's SEO panel — a score with a bar, then the
 * feedback grouped and worst-first — so the two screens read the same way even
 * though one scores a draft and the other scores a live URL.
 */

const RATING_DOT: Record<string, string> = {
  good: 'bg-green-500',
  ok: 'bg-amber-500',
  bad: 'bg-red-500',
  feedback: 'bg-slate-300',
  error: 'bg-slate-300',
};

function tone(score: number | null) {
  if (score === null) return { text: 'text-slate-400', bar: 'bg-slate-300', label: 'Not scored' };
  if (score >= 80) return { text: 'text-green-700', bar: 'bg-green-500', label: 'Good' };
  if (score >= 50) return { text: 'text-amber-700', bar: 'bg-amber-500', label: 'Needs work' };
  return { text: 'text-red-700', bar: 'bg-red-500', label: 'Poor' };
}

function ScoreBlock({
  title,
  score,
  problems,
}: {
  title: string;
  score: number | null;
  problems: number;
}) {
  const t = tone(score);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
        <span className={`ml-auto text-xl font-semibold tabular-nums ${t.text}`}>
          {score ?? '—'}
        </span>
        <span className="text-[11px] text-slate-400">/ 100</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${t.bar}`}
          style={{ width: `${score ?? 0}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        <span className={t.text}>{t.label}</span>
        {problems > 0 && (
          <>
            {' · '}
            <span className="text-red-600">
              {problems} to fix
            </span>
          </>
        )}
      </p>
    </div>
  );
}

function CheckList({ title, checks }: { title: string; checks: PageYoastCheck[] }) {
  if (checks.length === 0) return null;

  // Yoast wording is "Label: explanation" — splitting it lets the label carry
  // the weight and the explanation sit quieter, which is what makes a list of
  // thirteen of these scannable rather than a wall.
  const split = (text: string) => {
    const at = text.indexOf(':');
    if (at === -1 || at > 48) return { label: '', body: text };
    return { label: text.slice(0, at), body: text.slice(at + 1).trim() };
  };

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <ul className="space-y-1.5">
        {checks.map((c) => {
          const { label, body } = split(c.text);
          const muted = c.rating === 'good';
          return (
            <li key={c.id} className="flex gap-2.5 text-xs leading-relaxed">
              <span
                aria-hidden
                className={`mt-[6px] h-2 w-2 shrink-0 rounded-full ${
                  RATING_DOT[c.rating] || 'bg-slate-300'
                }`}
              />
              <span className={muted ? 'text-slate-500' : 'text-slate-700'}>
                {label && (
                  <span className={muted ? 'font-medium' : 'font-semibold text-slate-900'}>
                    {label}:{' '}
                  </span>
                )}
                {body}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PageSeoDetail({ metric }: { metric: SeoMetric }) {
  const checks = metric.yoastChecks || [];

  if (checks.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          No Yoast analysis stored for this page yet — run{' '}
          <span className="font-medium text-slate-700">Analyze Site</span> to generate it.
        </p>
        <PageSeoFields path={metric.path} />
      </div>
    );
  }

  // Problems first within each group: this is a to-do list, not a report card.
  const weight = { bad: 0, ok: 1, feedback: 2, error: 2, good: 3, '': 2 } as Record<string, number>;
  const order = (list: PageYoastCheck[]) =>
    [...list].sort((a, b) => (weight[a.rating] ?? 2) - (weight[b.rating] ?? 2));

  const seo = order(checks.filter((c) => c.group === 'seo'));
  const readability = order(checks.filter((c) => c.group === 'readability'));

  return (
    <div className="space-y-5">
      {/* The editable fields come first: everything below them is a report on
          what is already live, and this is the only part you can act on. */}
      <PageSeoFields path={metric.path} />

      <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
        <ScoreBlock title="Yoast SEO" score={metric.yoastSeoScore} problems={metric.seoProblems} />
        <ScoreBlock
          title="Readability"
          score={metric.readabilityScore}
          problems={metric.readabilityProblems}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CheckList title="SEO" checks={seo} />
        <CheckList title="Readability" checks={readability} />
      </div>

      {metric.skippedChecks > 0 && (
        <p className="border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-400">
          {metric.skippedChecks} keyphrase checks were excluded from this score because no focus
          keyphrase was set when the page was crawled. Set one above and re-run Analyze Site to
          score them — they are the only checks that tell this page apart from the others sharing
          its layout.
        </p>
      )}
    </div>
  );
}
