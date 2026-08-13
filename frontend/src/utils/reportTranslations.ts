import type { Language } from '@/hooks/useLanguage';
import type { SalesRange } from '@/types/dashboard';

const translations = {
  en: {
    financialReport: 'Business Report', businessSummary: 'Business summary', reportingPeriod: 'Report period', generated: 'Created',
    salesReceived: 'Sales received', products: 'Products', stockAvailable: 'Items in stock', itemsRunningLow: 'Items running low',
    salesComparison: 'Sales comparison', currentPeriod: 'Current period', difference: 'Increase / decrease',
    salesDuringPeriod: 'Sales during this period', comparedWithPrevious: 'Compared with previous period',
    newSales: 'Sales started in this period', increased: 'Sales increased', decreased: 'Sales decreased', unchanged: 'Sales stayed the same', times: 'times',
    salesDetails: 'Sales details', period: 'Period', sales: 'Sales', change: 'Change from last period', share: 'Part of period sales', newValue: 'New',
    stockStatus: 'Stock status', product: 'Product', status: 'Status', quantity: 'Quantity', available: 'Available', lowStock: 'Low stock', outOfStock: 'No stock available',
    footer: 'Created by Climbio. Sales figures include paid invoices only.',
    ranges: { '7d': 'Last 7 days', '30d': 'Last 30 days', '6m': 'Last 6 months' } satisfies Record<SalesRange, string>,
  },
  my: {
    salesComparison: 'ရောင်းရငွေ နှိုင်းယှဉ်ချက်', currentPeriod: 'လက်ရှိကာလ', difference: 'တိုး/လျော့ ပမာဏ',
    financialReport: 'လုပ်ငန်းအစီရင်ခံစာ', businessSummary: 'လုပ်ငန်းအကျဉ်းချုပ်', reportingPeriod: 'အစီရင်ခံကာလ', generated: 'ဖန်တီးချိန်',
    salesReceived: 'လက်ခံရရှိသော ရောင်းရငွေ', products: 'ကုန်ပစ္စည်းများ', stockAvailable: 'လက်ကျန်ပစ္စည်း', itemsRunningLow: 'လက်ကျန်နည်းနေသော ပစ္စည်း',
    salesDuringPeriod: 'ဤကာလအတွင်း ရောင်းရငွေ', comparedWithPrevious: 'ယခင်ကာလနှင့် နှိုင်းယှဉ်ချက်',
    newSales: 'ဤကာလတွင် ရောင်းရငွေ စတင်ရရှိသည်', increased: 'ရောင်းရငွေ တိုးလာသည်', decreased: 'ရောင်းရငွေ လျော့သွားသည်', unchanged: 'ရောင်းရငွေ မပြောင်းလဲပါ', times: 'ဆ',
    salesDetails: 'ရောင်းအားအသေးစိတ်', period: 'ကာလ', sales: 'ရောင်းရငွေ', change: 'ယခင်ကာလမှ အပြောင်းအလဲ', share: 'စုစုပေါင်းရောင်းရငွေ၏ အချိုး', newValue: 'အသစ်',
    stockStatus: 'လက်ကျန်ပစ္စည်းအခြေအနေ', product: 'ကုန်ပစ္စည်း', status: 'အခြေအနေ', quantity: 'အရေအတွက်', available: 'လက်ကျန်ရှိသည်', lowStock: 'လက်ကျန်နည်းနေသည်', outOfStock: 'ပစ္စည်းလက်ကျန်မရှိပါ',
    footer: 'Climbio မှ ဖန်တီးထားသည်။ ရောင်းရငွေတွင် ငွေပေးချေပြီးသော ဘောင်ချာများသာ ပါဝင်သည်။',
    ranges: { '7d': 'ပြီးခဲ့သော ၇ ရက်', '30d': 'ပြီးခဲ့သော ရက် ၃၀', '6m': 'ပြီးခဲ့သော ၆ လ' } satisfies Record<SalesRange, string>,
  },
} as const;

export type ReportLanguage = Language;
export function getReportTranslations(language: Language | undefined) {
  return translations[language === 'my' ? 'my' : 'en'];
}
