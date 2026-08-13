import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import myanmarRegular from '@fontsource/noto-sans-myanmar/files/noto-sans-myanmar-myanmar-400-normal.woff';
import myanmarBold from '@fontsource/noto-sans-myanmar/files/noto-sans-myanmar-myanmar-700-normal.woff';
import type { User } from '@/types/auth';
import type { DashboardSummary, SalesRange } from '@/types/dashboard';
import type { Language } from '@/hooks/useLanguage';
import { getReportTranslations } from '@/utils/reportTranslations';

Font.register({ family: 'NotoSansMyanmarReport', fonts: [{ src: myanmarRegular, fontWeight: 400 }, { src: myanmarBold, fontWeight: 700 }] });

const styles = StyleSheet.create({
  page: { padding: 42, paddingBottom: 58, color: '#172033', fontFamily: 'NotoSansMyanmarReport', fontSize: 10 },
  header: { borderBottomWidth: 2, borderBottomColor: '#8b5cf6', paddingBottom: 16, marginBottom: 20 },
  title: { fontWeight: 700, fontSize: 22, color: '#6d28d9', marginBottom: 5 },
  shop: { fontWeight: 700, fontSize: 12, marginBottom: 4 },
  muted: { color: '#64748b' },
  summary: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  summaryCard: { width: '25%', backgroundColor: '#f5f3ff', borderRadius: 7, padding: 10 },
  metricLabel: { color: '#64748b', fontSize: 8, marginBottom: 5 },
  metricValue: { color: '#4c1d95', fontWeight: 700, fontSize: 12 },
  sectionTitle: { color: '#4c1d95', fontWeight: 700, fontSize: 12, marginBottom: 8 },
  comparison: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 7, padding: 10, marginBottom: 20 },
  comparisonValue: { fontWeight: 700, color: '#172033', marginTop: 3 },
  comparisonTrend: { fontWeight: 700, color: '#047857', textAlign: 'right' },
  comparisonPrevious: { color: '#64748b', fontSize: 8, marginTop: 3, textAlign: 'right' },
  table: { borderWidth: 1, borderColor: '#ddd6fe', borderRadius: 5, marginBottom: 14 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ede9fe', minHeight: 27, alignItems: 'center' },
  lastRow: { borderBottomWidth: 0 },
  tableHeader: { backgroundColor: '#f5f3ff', color: '#5b21b6', fontWeight: 700 },
  labelCell: { width: '58%', padding: 7 },
  numberCell: { width: '42%', padding: 7, textAlign: 'right' },
  periodCell: { width: '25%', padding: 7 },
  revenueCell: { width: '32%', padding: 7, textAlign: 'right' },
  changeCell: { width: '23%', padding: 7, textAlign: 'right' },
  shareCell: { width: '20%', padding: 7, textAlign: 'right' },
  productCell: { width: '55%', padding: 7 },
  statusCell: { width: '25%', padding: 7 },
  unitsCell: { width: '20%', padding: 7, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 28, left: 42, right: 42, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8, color: '#64748b', fontSize: 8, textAlign: 'center' },
});

export function FinancialReportPdfDocument({ report, shop, range, createdAt, language = 'en' }: {
  report: DashboardSummary;
  shop: User;
  range: SalesRange;
  createdAt: Date;
  language?: Language;
}) {
  const t = getReportTranslations(language);
  const currency = shop.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'MMK' ? 0 : 2 });
  const generatedAt = new Intl.DateTimeFormat(language === 'my' ? 'my-MM' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(createdAt);
  const trendText = report.revenueTrend === 'NEW'
    ? t.newSales
    : report.revenueTrend === 'UP'
      ? Math.abs(report.revenueChangePercent ?? 0) >= 1000 && report.previousPeriodRevenue > 0
        ? `${t.increased} ${(report.currentPeriodRevenue / report.previousPeriodRevenue).toFixed(1)} ${t.times}`
        : `${t.increased} ${Math.abs(report.revenueChangePercent ?? 0).toFixed(1)}%`
      : report.revenueTrend === 'DOWN'
        ? `${t.decreased} ${Math.abs(report.revenueChangePercent ?? 0).toFixed(1)}%`
        : t.unchanged;

  const bucketChange = (index: number) => {
    if (index === 0) return '-';
    const current = report.salesOverview[index]!.revenue;
    const previous = report.salesOverview[index - 1]!.revenue;
    if (previous === 0) return current > 0 ? t.newValue : '-';
    return `${current >= previous ? '+' : ''}${(((current - previous) / previous) * 100).toFixed(1)}%`;
  };

  return (
    <Document title={`${t.financialReport} - ${shop.shopName}`} author={shop.shopName} subject={t.financialReport}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.financialReport}</Text>
          <Text style={styles.shop}>{shop.shopName}</Text>
          <Text style={styles.muted}>{t.reportingPeriod}: {t.ranges[range]} | {t.generated}: {generatedAt}</Text>
        </View>

        <View style={styles.summary}>
          <Metric label={t.salesReceived} value={money.format(report.totalRevenue)} />
          <Metric label={t.products} value={String(report.totalProducts)} />
          <Metric label={t.stockAvailable} value={String(report.totalStock)} />
          <Metric label={t.itemsRunningLow} value={String(report.lowStockCount)} />
        </View>

        <View style={styles.comparison}>
          <View><Text style={styles.muted}>{t.salesDuringPeriod}</Text><Text style={styles.comparisonValue}>{money.format(report.currentPeriodRevenue)}</Text></View>
          <View><Text style={styles.comparisonTrend}>{trendText}</Text><Text style={styles.comparisonPrevious}>{t.comparedWithPrevious}: {money.format(report.previousPeriodRevenue)}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>{t.salesDetails}</Text>
        <View style={styles.table} wrap>
          <View fixed style={[styles.row, styles.tableHeader]}><Text style={styles.periodCell}>{t.period}</Text><Text style={styles.revenueCell}>{t.sales}</Text><Text style={styles.changeCell}>{t.change}</Text><Text style={styles.shareCell}>{t.share}</Text></View>
          {report.salesOverview.map((item, index) => <View wrap={false} key={item.label} style={[styles.row, index === report.salesOverview.length - 1 ? styles.lastRow : {}]}><Text style={styles.periodCell}>{item.label}</Text><Text style={styles.revenueCell}>{money.format(item.revenue)}</Text><Text style={styles.changeCell}>{bucketChange(index)}</Text><Text style={styles.shareCell}>{report.currentPeriodRevenue > 0 ? `${((item.revenue / report.currentPeriodRevenue) * 100).toFixed(1)}%` : '0%'}</Text></View>)}
        </View>

        <Text minPresenceAhead={70} style={styles.sectionTitle}>{t.stockStatus}</Text>
        <View style={styles.table} wrap>
          <View fixed style={[styles.row, styles.tableHeader]}><Text style={styles.productCell}>{t.product}</Text><Text style={styles.statusCell}>{t.status}</Text><Text style={styles.unitsCell}>{t.quantity}</Text></View>
          {report.productStock.map((item, index) => <View wrap={false} key={item.id} style={[styles.row, index === report.productStock.length - 1 ? styles.lastRow : {}]}><Text style={styles.productCell}>{item.name}</Text><Text style={styles.statusCell}>{item.quantity === 0 ? t.outOfStock : item.quantity <= 5 ? t.lowStock : t.available}</Text><Text style={styles.unitsCell}>{item.quantity}</Text></View>)}
        </View>

        <Text style={styles.footer} fixed>{t.footer}</Text>
      </Page>
    </Document>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryCard}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}
