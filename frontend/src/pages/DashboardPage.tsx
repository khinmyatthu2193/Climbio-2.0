import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowUpRight, Boxes, FilePlus2, Package, Plus, ShoppingBag, Store, WalletCards } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/ui/Alert';
import { dashboardService } from '@/services/dashboardService';
import { useAuthStore } from '@/store/authStore';
import type { SalesRange } from '@/types/dashboard';

const chartTooltip = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '12px',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
};

function shortLabel(value: unknown, maxLength = 18) {
  const label = String(value ?? '');
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}...` : label;
}

const salesRanges: Array<{ value: SalesRange; label: string; description: string }> = [
  { value: '7d', label: '7D', description: 'Last 7 days' },
  { value: '30d', label: '30D', description: 'Last 30 days' },
  { value: '6m', label: '6M', description: 'Last 6 months' },
];

type SalesChartView = 'bar' | 'line';

const salesChartViews: Array<{ value: SalesChartView; label: string }> = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [salesRange, setSalesRange] = useState<SalesRange>('6m');
  const [salesChartView, setSalesChartView] = useState<SalesChartView>('bar');
  const selectedSalesRange = salesRanges.find((range) => range.value === salesRange) ?? salesRanges[2];
  const dashboard = useQuery({
    queryKey: ['dashboard', 'summary', salesRange],
    queryFn: () => dashboardService.summary(salesRange),
  });
  const currency = user?.setting?.currency ?? 'MMK';
  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'MMK' ? 0 : 2,
  });
  const compactCurrency = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const cards = [
    {
      label: 'Total products',
      helper: 'Items in your catalog',
      value: dashboard.data?.totalProducts,
      icon: Package,
      tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    },
    {
      label: 'Stock on hand',
      helper: 'Units ready to sell',
      value: dashboard.data?.totalStock,
      icon: Boxes,
      tone: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    },
    {
      label: 'Low stock',
      helper: 'Products needing attention',
      value: dashboard.data?.lowStockCount,
      icon: AlertTriangle,
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    },
    {
      label: 'Paid revenue',
      helper: 'Total from paid invoices',
      value: dashboard.data ? currencyFormatter.format(dashboard.data.totalRevenue) : undefined,
      icon: WalletCards,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
  ];

  return (
    <main className="page-container max-w-[1440px]">
      <section className="flex flex-col gap-5 border-b border-slate-200/80 pb-7 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{today}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Welcome back, {user?.name?.split(' ')[0]}.
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">A clear view of what is happening at {user?.shopName}.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:bg-slate-800" href="/invoices/new">
            <FilePlus2 className="size-4" /> Create invoice
          </a>
          <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/15 transition hover:bg-violet-700" href="/products/new">
            <Plus className="size-4" /> Add product
          </a>
        </div>
      </section>

      {dashboard.isError && <Alert className="mt-6" tone="error">Dashboard data could not be loaded. Please refresh and try again.</Alert>}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Business summary">
        {cards.map(({ label, helper, value, icon: Icon, tone }) => (
          <Card key={label} className="group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:border-violet-500/40">
            <div className="flex items-start justify-between gap-4">
              <div className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon aria-hidden="true" className="size-5" /></div>
              <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-violet-500 dark:text-slate-600" aria-hidden="true" />
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
            {dashboard.isLoading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ) : (
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{value ?? '0'}</p>
            )}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{helper}</p>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="min-w-0 p-0">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Sales overview</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paid invoice revenue for {selectedSalesRange.description.toLowerCase()}</p>
            </div>
            <div className="flex flex-col items-end gap-2 sm:flex-row">
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900" aria-label="Sales chart type">
                {salesChartViews.map((view) => (
                  <button
                    key={view.value}
                    type="button"
                    className={`min-h-8 rounded-lg px-3 text-xs font-bold transition ${salesChartView === view.value ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    onClick={() => setSalesChartView(view.value)}
                    aria-pressed={salesChartView === view.value}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900" aria-label="Sales chart range">
                {salesRanges.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    className={`min-h-8 rounded-lg px-3 text-xs font-bold transition ${salesRange === range.value ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    onClick={() => setSalesRange(range.value)}
                    aria-pressed={salesRange === range.value}
                    title={range.description}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {dashboard.isLoading ? (
            <div className="m-6 h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ) : dashboard.data?.salesOverview.every((item) => Number(item.revenue) === 0) ? (
            <ChartEmptyState icon={Store} title="No sales data yet" description="Paid invoice revenue will appear here as your business grows." actionLabel="Create an invoice" actionHref="/invoices/new" />
          ) : (
            <div className="h-80 px-2 pb-4 pt-6 sm:px-4">
              <ResponsiveContainer width="100%" height="100%">
                {salesChartView === 'bar' ? (
                  <BarChart data={dashboard.data?.salesOverview ?? []} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
                    <defs>
                      <linearGradient id="salesBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#A78BFA" /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} interval={salesRange === '30d' ? 4 : 0} />
                    <YAxis width={82} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickFormatter={(value) => compactCurrency.format(Number(value))} />
                    <Tooltip contentStyle={chartTooltip} formatter={(value) => [currencyFormatter.format(Number(value ?? 0)), 'Revenue']} />
                    <Bar dataKey="revenue" name="Revenue" fill="url(#salesBar)" radius={[7, 7, 2, 2]} maxBarSize={42} />
                  </BarChart>
                ) : (
                  <LineChart data={dashboard.data?.salesOverview ?? []} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
                    <defs>
                      <linearGradient id="salesLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#C084FC" /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} interval={salesRange === '30d' ? 4 : 0} />
                    <YAxis width={82} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickFormatter={(value) => compactCurrency.format(Number(value))} />
                    <Tooltip contentStyle={chartTooltip} formatter={(value) => [currencyFormatter.format(Number(value ?? 0)), 'Revenue']} />
                    <Line type="linear" dataKey="revenue" name="Revenue" stroke="url(#salesLine)" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 3 }} activeDot={{ fill: '#8B5CF6', stroke: '#ede9fe', strokeWidth: 5, r: 5 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="min-w-0 p-0">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Inventory levels</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Products with the most available stock</p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">Stock</span>
          </div>
          {dashboard.isLoading ? (
            <div className="m-6 h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ) : dashboard.data?.productStock.length === 0 ? (
            <ChartEmptyState icon={ShoppingBag} title="No inventory yet" description="Add products to start monitoring stock levels here." actionLabel="Add a product" actionHref="/products/new" />
          ) : (
            <div className="h-80 px-2 pb-4 pt-6 sm:px-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.data?.productStock ?? []} layout="vertical" margin={{ left: 16, right: 24, top: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="stockBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#A78BFA" /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} />
                  <YAxis type="category" dataKey="name" width={128} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickFormatter={(name) => shortLabel(name)} />
                  <Tooltip contentStyle={chartTooltip} cursor={{ fill: 'rgba(139,92,246,0.06)' }} formatter={(value) => [Number(value ?? 0), 'Stock']} labelFormatter={(label) => String(label)} />
                  <Bar dataKey="quantity" name="Stock" fill="url(#stockBar)" radius={[2, 7, 7, 2]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}

function ChartEmptyState({ icon: Icon, title, description, actionLabel, actionHref }: {
  icon: typeof Package;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="grid h-80 place-items-center px-6 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"><Icon className="size-5" /></div>
        <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        <a className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-violet-700 hover:text-violet-800 dark:text-violet-300" href={actionHref}>{actionLabel} <ArrowUpRight className="size-3.5" /></a>
      </div>
    </div>
  );
}
