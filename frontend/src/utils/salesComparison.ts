import type { Language } from '@/hooks/useLanguage';
import type { DashboardSummary, SalesRange } from '@/types/dashboard';

const BUSINESS_OFFSET_MS = (6 * 60 + 30) * 60 * 1000;

export function getSalesComparison(range: SalesRange, report: Pick<DashboardSummary, 'currentPeriodRevenue' | 'previousPeriodRevenue'>, currency: string, language: Language, now = new Date()) {
  const localNow = new Date(now.getTime() + BUSINESS_OFFSET_MS);
  const year = localNow.getUTCFullYear(); const month = localNow.getUTCMonth(); const day = localNow.getUTCDate();
  const currentStart = range === '6m' ? new Date(Date.UTC(year, month - 5, 1) - BUSINESS_OFFSET_MS) : new Date(Date.UTC(year, month, day - (range === '30d' ? 29 : 6)) - BUSINESS_OFFSET_MS);
  const previousStart = new Date(currentStart.getTime() - (now.getTime() - currentStart.getTime()));
  const previousEnd = new Date(currentStart.getTime() - 1);
  const amount = report.currentPeriodRevenue - report.previousPeriodRevenue;
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'MMK' ? 0 : 2 });
  const dates = new Intl.DateTimeFormat(language === 'my' ? 'my-MM' : 'en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Yangon' });
  const rangeText = (start: Date, end: Date) => `${dates.format(start)} – ${dates.format(end)}`;
  const previousLabel = language === 'my' ? range === '7d' ? 'ယခင် ၇ ရက်' : range === '30d' ? 'ယခင် ရက် ၃၀' : 'ယခင် ၆ လ' : range === '7d' ? 'Previous 7 days' : range === '30d' ? 'Previous 30 days' : 'Previous 6 months';
  const message = language === 'my' ? amount > 0 ? `ယခင်ကာလနှင့် နှိုင်းယှဉ်ပါက ရောင်းရငွေ ${money.format(amount)} တိုးလာပါသည်။` : amount < 0 ? `ယခင်ကာလနှင့် နှိုင်းယှဉ်ပါက ရောင်းရငွေ ${money.format(Math.abs(amount))} လျော့နည်းသွားပါသည်။` : 'ယခင်ကာလနှင့် နှိုင်းယှဉ်ပါက ရောင်းရငွေ မပြောင်းလဲပါ။' : amount > 0 ? `Your sales increased by ${money.format(amount)} compared with the previous period.` : amount < 0 ? `Your sales decreased by ${money.format(Math.abs(amount))} compared with the previous period.` : 'Your sales stayed the same as the previous period.';
  return { amount, signedAmount: `${amount > 0 ? '+' : amount < 0 ? '−' : ''}${money.format(Math.abs(amount))}`, message, previousLabel, currentDates: rangeText(currentStart, now), previousDates: rangeText(previousStart, previousEnd) };
}
