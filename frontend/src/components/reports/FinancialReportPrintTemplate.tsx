import type { Language } from '@/hooks/useLanguage';
import type { User } from '@/types/auth';
import type { DashboardSummary, SalesRange } from '@/types/dashboard';
import { getReportTranslations } from '@/utils/reportTranslations';
import { getSalesComparison } from '@/utils/salesComparison';

export function FinancialReportPrintTemplate({ report, shop, range, createdAt, language }: {
  report: DashboardSummary;
  shop: User;
  range: SalesRange;
  createdAt: Date;
  language: Language;
}) {
  const t = getReportTranslations(language);
  const currency = shop.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'MMK' ? 0 : 2 });
  const generatedAt = new Intl.DateTimeFormat(language === 'my' ? 'my-MM' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(createdAt);
  const comparison = getSalesComparison(range, report, currency, language, createdAt);
  const bucketChange = (index: number) => {
    if (index === 0) return '-';
    const current = report.salesOverview[index]!.revenue;
    const previous = report.salesOverview[index - 1]!.revenue;
    if (previous === 0) return current > 0 ? t.newValue : '-';
    return `${current >= previous ? '+' : ''}${(((current - previous) / previous) * 100).toFixed(1)}%`;
  };

  return <article lang={language === 'my' ? 'my' : 'en'} className="w-[794px] bg-white px-[56px] py-[52px] text-[13px] leading-relaxed text-slate-900" style={{ fontFamily: language === 'my' ? '"Noto Sans Myanmar", sans-serif' : 'Arial, sans-serif' }}>
    <header className="border-b-[3px] border-violet-500 pb-5"><h1 className="text-[29px] font-bold text-violet-700">{t.financialReport}</h1><p className="mt-1 text-base font-bold">{shop.shopName}</p><p className="mt-1 text-slate-500">{t.reportingPeriod}: {t.ranges[range]} · {t.generated}: {generatedAt}</p></header>
    <section className="mt-6 grid grid-cols-4 gap-3">{[[t.salesReceived, money.format(report.totalRevenue)], [t.products, report.totalProducts], [t.stockAvailable, report.totalStock], [t.itemsRunningLow, report.lowStockCount]].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-violet-50 p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-base font-bold text-violet-900">{value}</p></div>)}</section>
    <h2 className="mb-2 mt-7 text-base font-bold text-violet-900">{t.salesComparison}</h2><section className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="grid grid-cols-3 gap-4"><div><p className="text-[11px] text-slate-500">{t.currentPeriod}</p><p className="text-[11px] text-slate-500">{comparison.currentDates}</p><p className="mt-1 font-bold">{money.format(report.currentPeriodRevenue)}</p></div><div><p className="text-[11px] text-slate-500">{comparison.previousLabel}</p><p className="text-[11px] text-slate-500">{comparison.previousDates}</p><p className="mt-1 font-bold">{money.format(report.previousPeriodRevenue)}</p></div><div><p className="text-[11px] text-slate-500">{t.difference}</p><p className="mt-5 font-bold text-emerald-700">{comparison.signedAmount}</p></div></div><p className="mt-3 font-bold">{comparison.message}</p></section>
    <h2 className="mb-2 mt-7 text-base font-bold text-violet-900">{t.salesDetails}</h2>
    <table className="w-full table-fixed border-collapse overflow-hidden rounded-lg border border-violet-200"><thead><tr className="bg-violet-50 text-violet-800"><th className="p-2 text-left">{t.period}</th><th className="p-2 text-right">{t.sales}</th><th className="p-2 text-right">{t.change}</th><th className="p-2 text-right">{t.share}</th></tr></thead><tbody>{report.salesOverview.map((item, index) => <tr key={item.label} className="border-t border-violet-100"><td className="p-2">{item.label}</td><td className="p-2 text-right">{money.format(item.revenue)}</td><td className="p-2 text-right">{bucketChange(index)}</td><td className="p-2 text-right">{report.currentPeriodRevenue > 0 ? `${((item.revenue / report.currentPeriodRevenue) * 100).toFixed(1)}%` : '0%'}</td></tr>)}</tbody></table>
    <h2 className="mb-2 mt-7 text-base font-bold text-violet-900">{t.stockStatus}</h2>
    <table className="w-full table-fixed border-collapse overflow-hidden rounded-lg border border-violet-200"><thead><tr className="bg-violet-50 text-violet-800"><th className="w-3/5 p-2 text-left">{t.product}</th><th className="p-2 text-left">{t.status}</th><th className="p-2 text-right">{t.quantity}</th></tr></thead><tbody>{report.productStock.map((item) => <tr key={item.id} className="border-t border-violet-100"><td className="p-2">{item.name}</td><td className="p-2">{item.quantity === 0 ? t.outOfStock : item.quantity <= 5 ? t.lowStock : t.available}</td><td className="p-2 text-right">{item.quantity}</td></tr>)}</tbody></table>
    <footer className="mt-8 border-t border-slate-200 pt-3 text-center text-[11px] text-slate-500">{t.footer}</footer>
  </article>;
}
