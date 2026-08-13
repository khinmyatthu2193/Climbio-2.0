import { Document, Page, StyleSheet, View } from '@react-pdf/renderer';
import type { User } from '@/types/auth';
import type { DashboardSummary, SalesRange } from '@/types/dashboard';
import type { Language } from '@/hooks/useLanguage';
import { getReportTranslations } from '@/utils/reportTranslations';
import { PdfText } from '@/components/reports/PdfText';
import { getSalesComparison } from '@/utils/salesComparison';

const styles = StyleSheet.create({
  page: { padding: 42, paddingBottom: 58, color: '#172033', fontFamily: 'Helvetica', fontSize: 10 },
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
  const comparison = getSalesComparison(range, report, currency, language, createdAt);

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
          <PdfText style={styles.title} value={t.financialReport} bold />
          <PdfText style={styles.shop} value={shop.shopName} bold />
          <PdfText style={styles.muted} value={`${t.reportingPeriod}: ${t.ranges[range]} | ${t.generated}: ${generatedAt}`} />
        </View>

        <View style={styles.summary}>
          <Metric label={t.salesReceived} value={money.format(report.totalRevenue)} />
          <Metric label={t.products} value={String(report.totalProducts)} />
          <Metric label={t.stockAvailable} value={String(report.totalStock)} />
          <Metric label={t.itemsRunningLow} value={String(report.lowStockCount)} />
        </View>

        <PdfText style={styles.sectionTitle} value={t.salesComparison} bold />
        <View style={styles.comparison}>
          <View><PdfText style={styles.muted} value={t.currentPeriod} /><PdfText style={styles.comparisonPrevious} value={comparison.currentDates} /><PdfText style={styles.comparisonValue} value={money.format(report.currentPeriodRevenue)} bold /></View>
          <View><PdfText style={styles.muted} value={comparison.previousLabel} /><PdfText style={styles.comparisonPrevious} value={comparison.previousDates} /><PdfText style={styles.comparisonValue} value={money.format(report.previousPeriodRevenue)} bold /></View>
          <View><PdfText style={styles.muted} value={t.difference} /><PdfText style={styles.comparisonTrend} value={comparison.signedAmount} bold /></View>
        </View>
        <PdfText style={[styles.muted, { marginBottom: 16 }]} value={comparison.message} />

        <PdfText style={styles.sectionTitle} value={t.salesDetails} bold />
        <View style={styles.table} wrap>
          <View fixed style={[styles.row, styles.tableHeader]}><PdfText style={styles.periodCell} value={t.period} bold /><PdfText style={styles.revenueCell} value={t.sales} bold /><PdfText style={styles.changeCell} value={t.change} bold /><PdfText style={styles.shareCell} value={t.share} bold /></View>
          {report.salesOverview.map((item, index) => <View wrap={false} key={item.label} style={[styles.row, index === report.salesOverview.length - 1 ? styles.lastRow : {}]}><PdfText style={styles.periodCell} value={item.label} /><PdfText style={styles.revenueCell} value={money.format(item.revenue)} /><PdfText style={styles.changeCell} value={bucketChange(index)} /><PdfText style={styles.shareCell} value={report.currentPeriodRevenue > 0 ? `${((item.revenue / report.currentPeriodRevenue) * 100).toFixed(1)}%` : '0%'} /></View>)}
        </View>

        <PdfText minPresenceAhead={70} style={styles.sectionTitle} value={t.stockStatus} bold />
        <View style={styles.table} wrap>
          <View fixed style={[styles.row, styles.tableHeader]}><PdfText style={styles.productCell} value={t.product} bold /><PdfText style={styles.statusCell} value={t.status} bold /><PdfText style={styles.unitsCell} value={t.quantity} bold /></View>
          {report.productStock.map((item, index) => <View wrap={false} key={item.id} style={[styles.row, index === report.productStock.length - 1 ? styles.lastRow : {}]}><PdfText style={styles.productCell} value={item.name} /><PdfText style={styles.statusCell} value={item.quantity === 0 ? t.outOfStock : item.quantity <= 5 ? t.lowStock : t.available} /><PdfText style={styles.unitsCell} value={item.quantity} /></View>)}
        </View>

        <PdfText style={styles.footer} fixed value={t.footer} />
      </Page>
    </Document>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryCard}><PdfText style={styles.metricLabel} value={label} /><PdfText style={styles.metricValue} value={value} bold /></View>;
}
