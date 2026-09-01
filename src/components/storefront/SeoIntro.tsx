'use client';

import { useState } from 'react';
import {
  ChevronDownIcon,
  ClockIcon,
  FlaskIcon,
  GridIcon,
  LeafIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShippingIcon,
  TagIcon,
  CheckCircleIcon,
} from '@/components/icons';

// Server components can't pass function props (icon components) to a client
// component, so highlights reference icons by name here instead.
const ICONS = {
  flask: FlaskIcon,
  shield: ShieldCheckIcon,
  check: CheckCircleIcon,
  shipping: ShippingIcon,
  grid: GridIcon,
  search: SearchIcon,
  tag: TagIcon,
  clock: ClockIcon,
  leaf: LeafIcon,
} as const;

export type SeoHighlightIcon = keyof typeof ICONS;

interface Highlight {
  icon: SeoHighlightIcon;
  label: string;
}

interface SeoIntroProps {
  highlights: Highlight[];
  paragraphs: string[];
}

// A collapsed-by-default block of descriptive copy for listing pages. The full
// text always lives in the DOM (crawlers/SSR see all of it) — only the visual
// height is clamped, so this stays real content, not a client-only trick.
export function SeoIntro({ highlights, paragraphs }: SeoIntroProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-8">
      {highlights.length > 0 && (
        <div className="grid grid-cols-2 gap-px border border-sand-200 bg-sand-200 sm:grid-cols-4">
          {highlights.map((h) => {
            const Icon = ICONS[h.icon];
            return (
              <div key={h.label} className="flex items-center gap-2.5 bg-white px-4 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-sand-100 text-olive-700">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-ink-soft">{h.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative mt-6 max-w-3xl">
        <div
          className={`space-y-3 overflow-hidden text-sm leading-relaxed text-ink-soft transition-[max-height] duration-300 ease-in-out ${
            expanded ? 'max-h-[999px]' : 'max-h-[3.25rem]'
          }`}
        >
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-sand-50 to-transparent" />
        )}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="relative mt-2 inline-flex items-center gap-1 text-xs font-semibold text-olive-700 hover:underline"
        >
          {expanded ? 'Show less' : 'Read more'}
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}
