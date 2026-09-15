/**
 * The site's timezone, set once in Settings and used by every date the site
 * shows or reads.
 *
 * Why this exists rather than just using the browser's timezone: a date in
 * this system is usually a business fact, not a personal one. A coupon that
 * expires "Sep 20, 11:59 PM" expires at one moment, and staff in two countries
 * discussing that coupon need to be reading the same clock. Letting each
 * browser render its own local time means the same row says different things
 * to different people.
 *
 * Stored values are untouched by any of this — they are absolute instants
 * (timestamptz). This governs only how a wall-clock time is interpreted on the
 * way in and rendered on the way out.
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Used until the configured value arrives, and if the request fails. Dates
 * must still render when the settings endpoint is unreachable.
 */
export const FALLBACK_TIMEZONE = 'America/Los_Angeles';

export interface PublicSiteSettings {
  timezone: string;
}

/**
 * Reads the configured timezone. Cached for the session — it changes about
 * once in the life of a store, so re-fetching it per component would be pure
 * waste.
 */
export function useSiteTimezone(): string {
  const { data } = useQuery({
    queryKey: ['public-site-settings'],
    queryFn: async (): Promise<PublicSiteSettings> => {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${base}/site-settings/public`);
      if (!res.ok) throw new Error('Failed to load site settings');
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
  return data?.timezone || FALLBACK_TIMEZONE;
}

/** The zone's short name on that date — "PST", "PDT", "EET". */
export function timeZoneLabel(timeZone: string, at: Date = new Date()): string {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

/**
 * How far the zone is from UTC at a given instant, in milliseconds. Derived
 * from Intl rather than hardcoded, so daylight saving is handled by the zone's
 * own rules and a future rule change comes along for free.
 */
function offsetMs(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  // Some environments render midnight as hour 24 rather than 0.
  const hour = get('hour') % 24;
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));
  return asUtc - at.getTime();
}

/**
 * Reads a date input's value as a wall-clock time in the site's zone and
 * returns the instant it denotes.
 *
 * Two passes, because the offset itself depends on the instant: the first pass
 * gives an approximate instant, the second re-reads the offset there. That is
 * what makes the hours around a daylight-saving change come out right.
 */
export function inputToIso(
  value: string,
  timeZone: string,
  endOfDay = false,
): string | null {
  if (!value) return null;

  // A bare date carries no time. An end date means the end of that day —
  // otherwise a coupon "ending Sep 20" dies as Sep 20 begins.
  const withTime = value.includes('T')
    ? value
    : `${value}T${endOfDay ? '23:59:59' : '00:00:00'}`;

  const naive = Date.parse(`${withTime}Z`);
  if (Number.isNaN(naive)) return null;

  let instant = naive - offsetMs(new Date(naive), timeZone);
  instant = naive - offsetMs(new Date(instant), timeZone);
  return new Date(instant).toISOString();
}

/**
 * The reverse: an instant as the `YYYY-MM-DDTHH:mm` (or `YYYY-MM-DD`) string a
 * date input expects, in site time.
 *
 * Not `iso.slice(0, 16)` — that reads the UTC wall clock, so a record comes
 * back into its form shifted by the offset, and re-saving writes the shifted
 * value, walking the dates further every time.
 */
export function isoToInput(
  iso: string | null | undefined,
  timeZone: string,
  dateOnly = false,
): string {
  if (!iso) return '';
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '';

  const shifted = new Date(at.getTime() + offsetMs(at, timeZone));
  const stamp = shifted.toISOString();
  return dateOnly ? stamp.slice(0, 10) : stamp.slice(0, 16);
}

/** Date and time in site time, labelled with the zone so it is never ambiguous. */
export function formatDateTime(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return '—';
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '—';
  const text = at.toLocaleString('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${text} ${timeZoneLabel(timeZone, at)}`;
}

/** Date only, in site time — for table cells where the time adds nothing. */
export function formatDate(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return '—';
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '—';
  return at.toLocaleDateString('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * A short list of zones for the Settings picker. Not the full IANA database —
 * a 400-entry dropdown is worse than useless — but the server accepts any
 * valid IANA name, so this list can grow without a backend change.
 */
export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'America/Los_Angeles', label: 'Pacific — Los Angeles' },
  { value: 'America/Denver', label: 'Mountain — Denver' },
  { value: 'America/Phoenix', label: 'Mountain, no DST — Phoenix' },
  { value: 'America/Chicago', label: 'Central — Chicago' },
  { value: 'America/New_York', label: 'Eastern — New York' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Africa/Cairo', label: 'Cairo' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];
