import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Boxes, FileDown, FilePlus2, FileSpreadsheet, Package, Plus, ReceiptText, ShoppingBag, Store, WalletCards } from 'lucide-react';
import {
  Area,
  AreaChart,
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
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { IconLabel } from '@/components/ui/IconLabel';
import { download, downloadFinancialReportExcel } from '@/utils/financialReportExport';
import { getReportTranslations } from '@/utils/reportTranslations';
import { getSalesComparison } from '@/utils/salesComparison';

const chartTooltip = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '12px',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
  color: 'hsl(var(--foreground))',
  fontSize: '12px',
};

const salesRanges: Array<{ value: SalesRange; label: string; description: string }> = [
  { value: '7d', label: '7D', description: 'Last 7 days' },
  { value: '30d', label: '30D', description: 'Last 30 days' },
  { value: '6m', label: '6M', description: 'Last 6 months' },
];

type SalesChartView = 'bar' | 'line' | 'area';

const salesChartViews: Array<{ value: SalesChartView; label: string }> = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { language, translate } = useLanguage();
  const reportText = getReportTranslations(language);
  const [salesRange, setSalesRange] = useState<SalesRange>('7d');
  const [salesChartView, setSalesChartView] = useState<SalesChartView>('line');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const selectedSalesRange = salesRanges.find((range) => range.value === salesRange) ?? salesRanges[0];
  const dashboard = useQuery({
    queryKey: ['dashboard', 'summary', salesRange],
    queryFn: () => dashboardService.summary(salesRange),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
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
  const today = new Intl.DateTimeFormat(language === 'my' ? 'my-MM' : undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const revenueTrend = dashboard.data?.revenueTrend ?? 'FLAT';
  const comparison = dashboard.data ? getSalesComparison(salesRange, dashboard.data, currency, language) : null;

  const downloadPdfReport = async () => {
    if (!dashboard.data || !user) return;
    setIsDownloadingPdf(true);
    try {
      const [{ renderBrowserShapedPdf }, { FinancialReportPrintTemplate }] = await Promise.all([
        import('@/utils/browserPdfExport'),
        import('@/components/reports/FinancialReportPrintTemplate'),
      ]);
      const createdAt = new Date();
      const blob = await renderBrowserShapedPdf(<FinancialReportPrintTemplate report={dashboard.data} shop={user} range={salesRange} createdAt={createdAt} language={language} />);
      download(blob, `financial-report-${createdAt.toISOString().slice(0, 10)}.pdf`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadExcelReport = async () => {
    if (!dashboard.data || !user) return;
    await downloadFinancialReportExcel({ report: dashboard.data, shopName: user.shopName, currency, range: salesRange, createdAt: new Date(), language });
  };

  const cards = [
    {
      label: 'Total products',
      helper: 'Items in your catalog',
      value: dashboard.data?.totalProducts,
      icon: Package,
      tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    },
    {
      label: reportText.stockAvailable,
      helper: 'Units ready to sell',
      value: dashboard.data?.totalStock,
      icon: Boxes,
      tone: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    },
    {
      label: reportText.itemsRunningLow,
      helper: 'Products needing attention',
      value: dashboard.data?.lowStockCount,
      icon: AlertTriangle,
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    },
    {
      label: reportText.salesReceived,
      helper: 'Total from paid invoices',
      value: dashboard.data ? currencyFormatter.format(dashboard.data.totalRevenue) : undefined,
      icon: WalletCards,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
    {
      label: 'Invoices',
      helper: 'Invoices created',
      value: dashboard.data?.invoiceCount,
      icon: ReceiptText,
      tone: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
    },
    {
      label: 'Public store',
      helper: dashboard.data?.publicStoreStatus === 'ACTIVE' ? 'Customers can view your catalog' : 'Your catalog is not public',
      value: dashboard.data?.publicStoreStatus === 'ACTIVE' ? 'Active' : 'Inactive',
      icon: Store,
      tone: dashboard.data?.publicStoreStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
  ];

  return (
    <main className="page-container max-w-[1440px]">
      <section className="flex flex-col gap-5 border-b border-slate-200/80 pb-7 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{today}</p>
          <h1 className={language === 'my' ? 'mt-1 py-2 text-xl font-bold leading-[1.9] tracking-tight text-slate-950 dark:text-white sm:text-2xl' : 'mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl'}>
            {language === 'my' ? `${user?.name?.split(' ')[0]} မှ ကြိုဆိုပါသည်။` : `Welcome back, ${user?.name?.split(' ')[0]}.`}
          </h1>
          <p className={language === 'my' ? 'py-1 text-sm leading-7 text-slate-600 dark:text-slate-400' : 'mt-2 text-sm text-slate-600 dark:text-slate-400'}>{language === 'my' ? `${user?.shopName}၏ လုပ်ငန်းအခြေအနေကို တစ်နေရာတည်းတွင် ကြည့်ရှုပါ။` : `A clear view of what is happening at ${user?.shopName}.`}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <Button variant="outline" size="md" onClick={downloadPdfReport} disabled={!dashboard.data || isDownloadingPdf} title="Download financial report as PDF">
            <IconLabel icon={FileDown}>{isDownloadingPdf ? 'Preparing PDF...' : 'PDF report'}</IconLabel>
          </Button>
          <Button variant="outline" size="md" onClick={downloadExcelReport} disabled={!dashboard.data} title="Download financial report for Excel">
            <IconLabel icon={FileSpreadsheet}>Excel report</IconLabel>
          </Button>
          <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:bg-slate-800" href="/invoices/new">
            <IconLabel icon={FilePlus2}>Create invoice</IconLabel>
          </a>
          <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/15 transition hover:bg-violet-700" href="/products/new">
            <IconLabel icon={Plus}>Add product</IconLabel>
          </a>
        </div>
      </section>

      {dashboard.isError && <Alert className="mt-6" tone="error">Dashboard data could not be loaded. Please refresh and try again.</Alert>}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Business summary">
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

      <section className="mt-6 grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="min-w-0 self-start p-0 xl:h-[580px]">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Sales overview</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{language === 'my' ? `ပေးချေပြီး ဘောင်ချာ ဝင်ငွေ - ${translate(selectedSalesRange.description)}` : `Paid invoice revenue for ${selectedSalesRange.description.toLowerCase()}`}</p>
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
          {dashboard.data && (
            <div className="mx-5 mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:mx-6">
              <p className="text-sm font-bold">{reportText.salesComparison}</p><div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div><p className="text-xs font-semibold text-slate-500">{reportText.currentPeriod}</p><p className="text-xs text-slate-400">{comparison?.currentDates}</p><p className="mt-1 font-black">{currencyFormatter.format(dashboard.data.currentPeriodRevenue)}</p></div>
                <div><p className="text-xs font-semibold text-slate-500">{comparison?.previousLabel}</p><p className="text-xs text-slate-400">{comparison?.previousDates}</p><p className="mt-1 font-black">{currencyFormatter.format(dashboard.data.previousPeriodRevenue)}</p></div>
                <div><p className="text-xs font-semibold text-slate-500">{reportText.difference}</p><p className={`mt-4 font-black ${comparison && comparison.amount > 0 ? 'text-emerald-600' : comparison && comparison.amount < 0 ? 'text-red-600' : ''}`}>{comparison?.signedAmount}</p></div>
              </div><div className={`mt-3 flex items-center gap-2 text-xs font-bold ${revenueTrend === 'UP' || revenueTrend === 'NEW' ? 'text-emerald-700 dark:text-emerald-300' : revenueTrend === 'DOWN' ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'}`}>{revenueTrend === 'UP' || revenueTrend === 'NEW' ? <ArrowUpRight className="size-4" /> : revenueTrend === 'DOWN' ? <ArrowDownRight className="size-4" /> : <ArrowRight className="size-4" />}{comparison?.message}</div>
            </div>
          )}
          {dashboard.isLoading ? (
            <div className="m-6 h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ) : dashboard.data?.salesOverview.every((item) => Number(item.revenue) === 0) ? (
            <ChartEmptyState icon={Store} title="No sales data yet" description="Paid invoice revenue will appear here as your business grows." actionLabel="Create an invoice" actionHref="/invoices/new" />
          ) : (
            <div className="h-80 px-2 pb-4 pt-6 sm:px-4">
              <ResponsiveContainer width="100%" height="100%">
                {salesChartView === 'bar' && (
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
                )}
                {salesChartView === 'line' && (
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
                {salesChartView === 'area' && (
                  <AreaChart data={dashboard.data?.salesOverview ?? []} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
                    <defs>
                      <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} /><stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.03} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} interval={salesRange === '30d' ? 4 : 0} />
                    <YAxis width={82} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} tickFormatter={(value) => compactCurrency.format(Number(value))} />
                    <Tooltip contentStyle={chartTooltip} formatter={(value) => [currencyFormatter.format(Number(value ?? 0)), 'Revenue']} />
                    <Area type="linear" dataKey="revenue" name="Revenue" stroke="#8B5CF6" strokeWidth={3} fill="url(#salesArea)" dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 3 }} activeDot={{ fill: '#8B5CF6', stroke: '#ede9fe', strokeWidth: 5, r: 5 }} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="min-w-0 self-start overflow-hidden p-0 xl:flex xl:h-[580px] xl:flex-col">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">{reportText.stockStatus}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Items needing attention appear first</p>
            </div>
            <div className="text-right"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">Stock</span><p className="mt-2 text-[10px] font-medium text-slate-400">Updates every minute</p></div>
          </div>
          {dashboard.isLoading ? (
            <div className="m-6 h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ) : dashboard.data?.productStock.length === 0 ? (
            <ChartEmptyState icon={ShoppingBag} title="No inventory yet" description="Add products to start monitoring stock levels here." actionLabel="Add a product" actionHref="/products/new" />
          ) : (
            <div className="max-h-[440px] divide-y divide-slate-100 overflow-y-auto px-5 py-2 dark:divide-slate-800 sm:px-6 xl:min-h-0 xl:flex-1">
              {(dashboard.data?.productStock ?? []).slice(0, 7).map((product, index) => {
                const isOut = product.quantity === 0;
                const isLow = product.quantity <= 5;
                const status = isOut ? reportText.outOfStock : isLow ? reportText.lowStock : reportText.available;
                const statusTone = isOut
                  ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                  : isLow
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
                return (
                  <div key={product.id} className="flex items-center gap-3 py-3.5">
                    <span className={`size-2.5 shrink-0 rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white" title={product.name}>{product.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">Priority {index + 1}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-black tabular-nums text-slate-950 dark:text-white">{product.quantity} <span className="text-[10px] font-semibold uppercase text-slate-400">units</span></p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone}`}>{status}</span>
                    </div>
                  </div>
                );
              })}
              <a href="/products" className="flex items-center justify-between py-3.5 text-sm font-bold text-violet-700 hover:text-violet-800 dark:text-violet-300">View all inventory <ArrowUpRight className="size-4" /></a>
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
