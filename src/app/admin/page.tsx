'use client';

import Link from 'next/link';
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
import { DashboardOverview, QuoteRequestStats } from '@/lib/types';
import { Badge, Card, ErrorState, LoadingState, PageHeader, StatCard } from '@/components/ui';
import { formatUsd } from '@/lib/pricing';
import { AlertTriangleIcon, BoxIcon, BuildingIcon, DollarIcon, InboxIcon } from '@/components/icons';

export default function AdminOverviewPage() {
  const overview = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => api.get<DashboardOverview>('/admin/dashboard/overview'),
  });

  const stats = useQuery({
    queryKey: ['quote-request-stats'],
    queryFn: () => api.get<QuoteRequestStats>('/wholesale/quote-requests/stats'),
  });

  if (overview.isLoading) return <LoadingState />;
  if (overview.isError || !overview.data)
    return <ErrorState message="Couldn't load the dashboard. Is the backend running?" />;

  const d = overview.data;

  const revenueData = d.revenue.last30Days.map((row) => ({
    day: new Date(row.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    revenue: row.revenue,
  }));

  const leadsTrendData = (stats.data?.last30Days || []).map((row) => ({
    day: new Date(row.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count: Number(row.count),
  }));

  const inventoryAlerts = d.inventory.outOfStockCount + d.inventory.onBackorderCount;

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Live snapshot of revenue, orders, catalog, and leads."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatUsd(d.orders.totalRevenue)}
          sublabel={`${d.orders.pendingOrderCount} pending order${d.orders.pendingOrderCount === 1 ? '' : 's'}`}
          accent="brand"
          icon={DollarIcon}
        />
        <StatCard
          label="New Quote Requests"
          value={d.leads.newQuoteRequestCount}
          sublabel={`${d.leads.totalQuoteRequestCount} total`}
          accent="amber"
          icon={InboxIcon}
        />
        <StatCard
          label="Wholesale Accounts"
          value={d.accounts.companyCount}
          sublabel={
            d.accounts.pendingCompanyCount > 0
              ? `${d.accounts.pendingCompanyCount} pending approval`
              : 'All approved'
          }
          accent={d.accounts.pendingCompanyCount > 0 ? 'red' : 'slate'}
          icon={BuildingIcon}
        />
        <StatCard
          label="Inventory Alerts"
          value={inventoryAlerts}
          sublabel={`${d.inventory.outOfStockCount} out of stock · ${d.inventory.onBackorderCount} backorder · ${d.inventory.lowStockCount} running low`}
          accent={inventoryAlerts > 0 ? 'red' : 'slate'}
          icon={AlertTriangleIcon}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Revenue — last 30 days</h2>
          {revenueData.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="revenue" stroke="#2b7a30" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Orders by status</h2>
          <div className="space-y-3">
            {d.orders.statusBreakdown.length === 0 && (
              <p className="text-sm text-slate-400">No orders yet.</p>
            )}
            {d.orders.statusBreakdown.map((row) => (
              <div key={row.status} className="flex items-center justify-between">
                <Badge status={row.status} />
                <span className="text-sm font-semibold text-slate-900">{row.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {d.orders.recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <tbody>
                  {d.orders.recent.map((o) => (
                    <tr key={o.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-3 font-medium text-slate-900">#{o.id}</td>
                      <td className="px-6 py-3 text-slate-600">
                        {o.customerName || o.customerEmail || '—'}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <Badge status={o.status} />
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        {formatUsd(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Top Products</h2>
          {d.topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {d.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.unitsSold} units sold</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatUsd(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Running Low Soon</h2>
              <p className="text-xs text-slate-500">
                Still in stock, but at or below {d.inventory.lowStockCount > 0 ? '10 units' : 'the reorder threshold'} — reorder before these go out of stock.
              </p>
            </div>
            <Link href="/admin/products" className="text-xs font-medium text-brand-700 hover:underline">
              Manage products
            </Link>
          </div>
          {d.inventory.lowStockProducts.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-400">Nothing running low right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <tbody>
                  {d.inventory.lowStockProducts.map((v) => (
                    <tr key={v.variantId} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-3 font-medium text-slate-900">
                        <Link href={`/admin/products/${v.productId}/edit`} className="hover:underline">
                          {v.productName}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-slate-500">{v.variantLabel}</td>
                      <td className="px-6 py-3 text-slate-400">{v.sku}</td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                            v.stockQuantity <= 3 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {v.stockQuantity} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {d.inventory.lowStockCount > d.inventory.lowStockProducts.length && (
                <p className="border-t border-slate-100 px-6 py-2.5 text-xs text-slate-400">
                  +{d.inventory.lowStockCount - d.inventory.lowStockProducts.length} more not shown
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Quote requests — last 30 days</h2>
          {leadsTrendData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">No quote requests yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leadsTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#3a9640" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Catalog & Marketing</h2>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Active products</span>
              <span className="font-semibold text-slate-900">{d.catalog.productCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Categories</span>
              <span className="font-semibold text-slate-900">{d.catalog.categoryCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Newsletter subscribers</span>
              <span className="font-semibold text-slate-900">{d.marketing.subscriberCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
