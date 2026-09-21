'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, useSiteTimezone } from '@/lib/siteTimezone';
import { TeamReport } from '@/lib/types';
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  StatCard,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { BoxIcon, ChartIcon, UsersIcon } from '@/components/icons';

/** Preset windows, in days. "Custom" is the escape hatch below them. */
const RANGES: [number, string][] = [
  [7, 'Last 7 days'],
  [30, 'Last 30 days'],
  [90, 'Last 90 days'],
];

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

function money(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * What a team got done over a date range.
 *
 * "Orders" and "Revenue" are derived server-side from the audit log — they
 * count the distinct orders each member actually touched, not orders assigned
 * to them, because nothing assigns orders to staff today. That makes the
 * numbers honest about what they measure: activity on orders, and what those
 * orders are worth.
 */
export function TeamReportPanel({
  endpoint,
  teamId,
}: {
  endpoint: string;
  /** See TeamActivityFeed — selects among the caller's own teams, nothing more. */
  teamId?: string;
}) {
  const tz = useSiteTimezone();
  const [days, setDays] = useState<number | null>(30);
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const range = useMemo(() => {
    if (days === null) return { from, to };
    return { from: isoDaysAgo(days), to: new Date().toISOString().slice(0, 10) };
  }, [days, from, to]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['team-report', endpoint, teamId ?? '', range.from, range.to],
    queryFn: () => {
      const params = new URLSearchParams({
        from: range.from,
        to: `${range.to}T23:59:59.999Z`,
      });
      if (teamId) params.set('teamId', teamId);
      return api.get<TeamReport>(`${endpoint}?${params.toString()}`);
    },
  });

  const peakDay = useMemo(() => {
    if (!data?.daily.length) return 0;
    return Math.max(...data.daily.map((d) => d.count));
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-2">
        {RANGES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setDays(value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              days === value
                ? 'border-sci-blue bg-sci-blue/10 text-sci-blue'
                : 'border-sci-border text-slate-600 hover:bg-sci-pale'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setDays(null)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            days === null
              ? 'border-sci-blue bg-sci-blue/10 text-sci-blue'
              : 'border-sci-border text-slate-600 hover:bg-sci-pale'
          }`}
        >
          Custom
        </button>

        {days === null && (
          <div className="flex items-end gap-2">
            <label className="text-xs text-slate-500">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="ml-2 rounded-lg border border-sci-border px-2.5 py-1.5 text-xs text-sci-navy outline-none focus:border-sci-blue"
              />
            </label>
            <label className="text-xs text-slate-500">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="ml-2 rounded-lg border border-sci-border px-2.5 py-1.5 text-xs text-sci-navy outline-none focus:border-sci-blue"
              />
            </label>
          </div>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load the team report." />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Actions" value={data.totals.actions} icon={ChartIcon} />
            <StatCard label="Orders touched" value={data.totals.orders} icon={BoxIcon} accent="amber" />
            <StatCard label="Order value" value={money(data.totals.revenue)} accent="brand" />
            <StatCard label="Members" value={data.members.length} icon={UsersIcon} accent="slate" />
          </div>

          {/* A bar per day. Plain divs rather than a charting library — the
              admin has no chart dependency today, and one bar per day is not
              a reason to add one. */}
          {data.daily.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-4 font-sci-heading text-sm font-semibold text-sci-navy">
                Activity per day
              </h3>
              <div className="flex h-28 items-end gap-1">
                {data.daily.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 rounded-t bg-sci-blue/70 transition hover:bg-sci-blue"
                    style={{ height: `${peakDay ? Math.max(4, (d.count / peakDay) * 100) : 4}%` }}
                    title={`${formatDate(d.day, tz)} — ${d.count} action${d.count === 1 ? '' : 's'}`}
                  />
                ))}
              </div>
            </Card>
          )}

          {data.members.length === 0 ? (
            <EmptyState message="This team has no members yet, so there is nothing to report." />
          ) : (
            <Card>
              <Table minWidth={720}>
                <TableHead>
                  <Th>Member</Th>
                  <Th align="right">Actions</Th>
                  <Th align="right">Created</Th>
                  <Th align="right">Updated</Th>
                  <Th align="right">Orders</Th>
                  <Th align="right">Order value</Th>
                </TableHead>
                <tbody>
                  {data.members.map((m) => (
                    <Tr key={m.id}>
                      <Td>
                        <div className="font-medium text-slate-900">{m.fullName}</div>
                        <div className="text-xs text-slate-500">
                          {m.email}
                          {m.roleName && <span className="ml-1 text-slate-400">· {m.roleName}</span>}
                        </div>
                      </Td>
                      <Td align="right" className="text-slate-900">
                        {m.actions}
                      </Td>
                      <Td align="right" className="text-slate-600">
                        {m.byAction.CREATE ?? 0}
                      </Td>
                      <Td align="right" className="text-slate-600">
                        {m.byAction.UPDATE ?? 0}
                      </Td>
                      <Td align="right" className="text-slate-600">
                        {m.orders}
                      </Td>
                      <Td align="right" className="text-slate-900">
                        {money(m.revenue)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
