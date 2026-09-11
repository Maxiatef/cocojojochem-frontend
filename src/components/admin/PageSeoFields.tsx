'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { SeoPage } from '@/lib/types';
import { Button, TextAreaField, TextField } from '@/components/ui';

/**
 * The editable half of a crawled page's SEO panel.
 *
 * These three fields are stored against the PATH (a SeoPage row), not against
 * the crawl result — the crawl is a read-only observation and is replaced on
 * every run, so anything an admin types has to live somewhere that survives it.
 *
 * Title and description are consumed by the storefront's generateMetadata();
 * the keyphrase never reaches a visitor and exists solely to unlock Yoast's
 * nine keyphrase assessments on the next crawl.
 */

/** Google's usable width. Matches the windows in product-seo.rules.ts. */
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const META_MIN = 120;
const META_MAX = 160;

function Counter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.trim().length;
  // Nothing typed yet is not a failure — it just means the page keeps its
  // hardcoded default, which is a legitimate choice.
  const tone =
    n === 0
      ? 'text-slate-400'
      : n < min || n > max
        ? 'text-amber-600'
        : 'text-green-600';
  return (
    <span className={`text-[11px] tabular-nums ${tone}`}>
      {n} / {min}–{max}
    </span>
  );
}

function Row({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        {counter}
      </div>
      {children}
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{hint}</p>
    </div>
  );
}

export function PageSeoFields({ path }: { path: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seo-page-override', path],
    queryFn: () =>
      api.get<SeoPage | null>(`/seo-pages/by-path?path=${encodeURIComponent(path)}`),
  });

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyphrase, setFocusKeyphrase] = useState('');
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Seed once the override arrives. Guarded on `dirty` so a slow refetch can't
  // overwrite something half-typed.
  useEffect(() => {
    if (dirty) return;
    setMetaTitle(data?.metaTitle || '');
    setMetaDescription(data?.metaDescription || '');
    setFocusKeyphrase(data?.focusKeyphrase || '');
  }, [data, dirty]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put<SeoPage>(`/seo-pages/by-path?path=${encodeURIComponent(path)}`, {
        metaTitle,
        metaDescription,
        focusKeyphrase,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(['seo-page-override', path], result);
      setDirty(false);
      setError(null);
      setSaved(true);
    },
    onError: (err) => {
      setError(getFriendlyErrorMessage(err));
      setSaved(false);
    },
  });

  function edit(setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      setDirty(true);
      setSaved(false);
    };
  }

  if (isLoading) {
    return <p className="text-xs text-slate-400">Loading this page&apos;s SEO fields…</p>;
  }

  return (
    <div className="space-y-3">
      <Row
        label="SEO Title"
        hint="Shown as the headline in search results. Leave blank to keep the page's built-in title."
        counter={<Counter value={metaTitle} min={TITLE_MIN} max={TITLE_MAX} />}
      >
        <TextField
          label=""
          value={metaTitle}
          onChange={(e) => edit(setMetaTitle)(e.target.value)}
          placeholder="Wholesale Cosmetic Ingredients — CocoJojoChem"
        />
      </Row>

      <Row
        label="Meta Description"
        hint="The grey summary under the headline. Google rewrites it if you leave it blank."
        counter={<Counter value={metaDescription} min={META_MIN} max={META_MAX} />}
      >
        <TextAreaField
          label=""
          rows={3}
          value={metaDescription}
          onChange={(e) => edit(setMetaDescription)(e.target.value)}
          placeholder="Browse the full wholesale ingredient catalogue…"
        />
      </Row>

      <Row
        label="Focus Keyphrase"
        hint="Not shown to visitors. Setting it turns on Yoast's nine keyphrase checks for this page on the next crawl — they are the only checks that tell this page apart from the others sharing its layout."
      >
        <TextField
          label=""
          value={focusKeyphrase}
          onChange={(e) => edit(setFocusKeyphrase)(e.target.value)}
          placeholder="wholesale cosmetic ingredients"
        />
      </Row>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={() => saveMutation.mutate()}
          loading={saveMutation.isPending}
          disabled={!dirty}
        >
          Save
        </Button>
        {saved && !dirty && (
          <span className="text-xs text-green-700">
            Saved. Re-run Analyze Site to rescore this page.
          </span>
        )}
        {dirty && <span className="text-xs text-slate-400">Unsaved changes</span>}
      </div>
    </div>
  );
}
