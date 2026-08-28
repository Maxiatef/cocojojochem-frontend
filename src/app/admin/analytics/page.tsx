'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '@/lib/api';
import { SalesProductsAnalytics, VisitorsAnalytics } from '@/lib/types';
import { RequireAdmin } from '@/components/AdminShell';
import {
  Badge,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  StatCard,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui';
import { formatUsd } from '@/lib/pricing';
import { DollarIcon, BoxIcon, ChartIcon, EyeIcon, UsersIcon } from '@/components/icons';

// This is the first of several planned Analytics tabs — keep the union open
// for the next ones (e.g. 'customers', 'marketing') so adding a tab later is
// just: extend this type, add a button, add a conditional render below.
type Tab = 'sales-products' | 'visitors';

const DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last 365 days' },
];

export default function AnalyticsAdminPage() {
  const [tab, setTab] = useState<Tab>('sales-products');

  return (
    <RequireAdmin>
      <div>
        <PageHeader title="Analytics" description="Sales performance, product movement, and top accounts." />

        <div className="mb-6 flex gap-1 border-b border-slate-200">
          {(
            [
              ['sales-products', 'Sales & Products'],
              ['visitors', 'Visitors'],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'sales-products' && <SalesProductsTab />}
        {tab === 'visitors' && <VisitorsTab />}
      </div>
    </RequireAdmin>
  );
}

// --- Sales & Products tab ---------------------------------------------------

function stockBadgeStatus(status: string): string {
  return status;
}

function SalesProductsTab() {
  const [days, setDays] = useState(30);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics-sales-products', days],
    queryFn: () => api.get<SalesProductsAnalytics>(`/admin/analytics/sales-products?days=${days}`),
  });

  const revenueData = (data?.revenue.series || []).map((row) => ({
    day: new Date(row.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    revenue: row.revenue,
  }));

  const categoryData = (data?.categories || []).map((c) => ({
    name: c.name,
    revenue: c.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Sales &amp; Products</h2>
          <p className="text-xs text-slate-500">Revenue trend, product and category performance, top accounts.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          {DAY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load analytics." />}

      {!isLoading && !isError && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Revenue" value={formatUsd(data.revenue.totalRevenue)} accent="brand" icon={DollarIcon} />
            <StatCard label="Total Orders" value={data.revenue.totalOrders} icon={BoxIcon} />
            <StatCard label="Avg Order Value" value={formatUsd(data.revenue.avgOrderValue)} accent="amber" icon={ChartIcon} />
          </div>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Revenue — {DAY_OPTIONS.find((o) => o.value === days)?.label.toLowerCase()}</h3>
            {revenueData.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">No orders in this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a9640" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#3a9640" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip formatter={(v: number) => formatUsd(v)} cursor={{ stroke: '#3a9640', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#2b7a30" strokeWidth={2} fill="url(#analyticsRevenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Product Performance</div>
            {data.products.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No product sales in this range.</div>
            ) : (
              <Table minWidth={760}>
                <TableHead>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th align="right">Units Sold</Th>
                  <Th align="right">Revenue</Th>
                  <Th align="right">Orders</Th>
                  <Th>Stock</Th>
                </TableHead>
                <tbody>
                  {data.products.map((p) => (
                    <Tr key={p.productId}>
                      <Td className="font-medium text-slate-900">
                        <Link href={`/admin/products/${p.productId}/edit`} className="hover:underline">
                          {p.name}
                        </Link>
                      </Td>
                      <Td className="text-slate-600">{p.categoryName || '—'}</Td>
                      <Td align="right" className="text-slate-600">{p.unitsSold}</Td>
                      <Td align="right" className="font-medium text-slate-900">{formatUsd(p.revenue)}</Td>
                      <Td align="right" className="text-slate-600">{p.orderCount}</Td>
                      <Td>
                        <Badge status={stockBadgeStatus(p.stockStatus)} />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Revenue by Category</div>
            {categoryData.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No category sales in this range.</div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(180, categoryData.length * 36)}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => formatUsd(v)} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="revenue" fill="#3a9640" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Top Companies</div>
            {data.topCompanies.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No company orders in this range.</div>
            ) : (
              <Table minWidth={480}>
                <TableHead>
                  <Th>Company</Th>
                  <Th align="right">Revenue</Th>
                  <Th align="right">Orders</Th>
                </TableHead>
                <tbody>
                  {data.topCompanies.map((c) => (
                    <Tr key={c.companyId}>
                      <Td className="font-medium text-slate-900">{c.name}</Td>
                      <Td align="right" className="text-slate-900">{formatUsd(c.revenue)}</Td>
                      <Td align="right" className="text-slate-600">{c.orderCount}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Slow Movers</h3>
              <p className="text-xs text-slate-500">Published products with zero sales in this range, oldest first.</p>
            </div>
            {data.slowMovers.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">Everything published has sold in this range.</div>
            ) : (
              <Table minWidth={480}>
                <TableHead>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Added On</Th>
                </TableHead>
                <tbody>
                  {data.slowMovers.map((p) => (
                    <Tr key={p.productId}>
                      <Td className="font-medium text-slate-900">
                        <Link href={`/admin/products/${p.productId}/edit`} className="hover:underline">
                          {p.name}
                        </Link>
                      </Td>
                      <Td className="text-slate-600">{p.categoryName || '—'}</Td>
                      <Td className="text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

// --- Visitors tab ------------------------------------------------------------

function VisitorsTab() {
  const [days, setDays] = useState(30);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics-visitors', days],
    queryFn: () => api.get<VisitorsAnalytics>(`/admin/analytics/visitors?days=${days}`),
  });

  const seriesData = (data?.series || []).map((row) => ({
    day: new Date(row.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    views: row.views,
    uniqueVisitors: row.uniqueVisitors,
  }));

  const avgViewsPerVisitor =
    data && data.totalUniqueVisitors > 0 ? data.totalViews / data.totalUniqueVisitors : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Visitors</h2>
          <p className="text-xs text-slate-500">
            Storefront traffic from in-house page-view tracking (admin pages aren&apos;t counted).
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          {DAY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load visitor analytics." />}

      {!isLoading && !isError && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Unique Visitors" value={data.totalUniqueVisitors} accent="brand" icon={UsersIcon} />
            <StatCard label="Page Views" value={data.totalViews} icon={EyeIcon} />
            <StatCard label="Avg Views / Visitor" value={avgViewsPerVisitor.toFixed(1)} accent="amber" icon={ChartIcon} />
          </div>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Traffic — {DAY_OPTIONS.find((o) => o.value === days)?.label.toLowerCase()}
            </h3>
            {seriesData.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">No visits recorded in this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={seriesData}>
                  <defs>
                    <linearGradient id="analyticsVisitorsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a9640" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#3a9640" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ stroke: '#3a9640', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="uniqueVisitors"
                    name="Unique Visitors"
                    stroke="#2b7a30"
                    strokeWidth={2}
                    fill="url(#analyticsVisitorsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Top Pages</div>
            {data.topPages.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No page views in this range.</div>
            ) : (
              <Table minWidth={480}>
                <TableHead>
                  <Th>Path</Th>
                  <Th align="right">Views</Th>
                  <Th align="right">Unique Visitors</Th>
                </TableHead>
                <tbody>
                  {data.topPages.map((p) => (
                    <Tr key={p.path}>
                      <Td className="font-medium text-slate-900">{p.path}</Td>
                      <Td align="right" className="text-slate-600">{p.views}</Td>
                      <Td align="right" className="text-slate-600">{p.uniqueVisitors}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
