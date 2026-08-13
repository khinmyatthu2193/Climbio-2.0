import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { User } from '@/types/auth';
import type { DashboardSummary, SalesRange } from '@/types/dashboard';

const styles = StyleSheet.create({
  page: { padding: 42, color: '#172033', fontFamily: 'Helvetica', fontSize: 10 },
  header: { borderBottomWidth: 2, borderBottomColor: '#8b5cf6', paddingBottom: 16, marginBottom: 20 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 22, color: '#6d28d9', marginBottom: 5 },
  shop: { fontFamily: 'Helvetica-Bold', fontSize: 12, marginBottom: 4 },
  muted: { color: '#64748b' },
  summary: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  summaryCard: { width: '25%', backgroundColor: '#f5f3ff', borderRadius: 7, padding: 10 },
  metricLabel: { color: '#64748b', fontSize: 8, marginBottom: 5 },
  metricValue: { color: '#4c1d95', fontFamily: 'Helvetica-Bold', fontSize: 12 },
  sectionTitle: { color: '#4c1d95', fontFamily: 'Helvetica-Bold', fontSize: 12, marginBottom: 8 },
  comparison: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 7, padding: 10, marginBottom: 20 },
  comparisonValue: { fontFamily: 'Helvetica-Bold', color: '#172033', marginTop: 3 },
  comparisonTrend: { fontFamily: 'Helvetica-Bold', color: '#047857', textAlign: 'right' },
  comparisonPrevious: { color: '#64748b', fontSize: 8, marginTop: 3, textAlign: 'right' },
  table: { borderWidth: 1, borderColor: '#ddd6fe', borderRadius: 5, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ede9fe', minHeight: 27, alignItems: 'center' },
  lastRow: { borderBottomWidth: 0 },
  tableHeader: { backgroundColor: '#f5f3ff', color: '#5b21b6', fontFamily: 'Helvetica-Bold' },
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

const rangeLabels: Record<SalesRange, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '6m': 'Last 6 months' };

export function FinancialReportPdfDocument({ report, shop, range, createdAt }: {
  report: DashboardSummary;
  shop: User;
  range: SalesRange;
  createdAt: Date;
}) {
  const currency = shop.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'MMK' ? 0 : 2 });
  const generatedAt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(createdAt);
  const trendText = report.revenueTrend === 'NEW'
    ? 'New revenue this period'
    : report.revenueTrend === 'UP'
      ? Math.abs(report.revenueChangePercent ?? 0) >= 1000 && report.previousPeriodRevenue > 0
        ? `${(report.currentPeriodRevenue / report.previousPeriodRevenue).toFixed(1)}x the previous period`
        : `Up ${Math.abs(report.revenueChangePercent ?? 0).toFixed(1)}% from previous period`
      : report.revenueTrend === 'DOWN'
        ? `Down ${Math.abs(report.revenueChangePercent ?? 0).toFixed(1)}% from previous period`
        : 'Unchanged from previous period';

  const bucketChange = (index: number) => {
    if (index === 0) return '-';
    const current = report.salesOverview[index]!.revenue;
    const previous = report.salesOverview[index - 1]!.revenue;
    if (previous === 0) return current > 0 ? 'New' : '-';
    return `${current >= previous ? '+' : ''}${(((current - previous) / previous) * 100).toFixed(1)}%`;
  };

  return (
    <Document title={`Financial Report - ${shop.shopName}`} author={shop.shopName} subject="Financial report">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FINANCIAL REPORT</Text>
          <Text style={styles.shop}>{shop.shopName}</Text>
          <Text style={styles.muted}>Reporting period: {rangeLabels[range]} | Generated: {generatedAt}</Text>
        </View>

        <View style={styles.summary}>
          <Metric label="Paid revenue" value={money.format(report.totalRevenue)} />
          <Metric label="Products" value={String(report.totalProducts)} />
          <Metric label="Stock on hand" value={String(report.totalStock)} />
          <Metric label="Low-stock items" value={String(report.lowStockCount)} />
        </View>

        <View style={styles.comparison}>
          <View><Text style={styles.muted}>Revenue in selected period</Text><Text style={styles.comparisonValue}>{money.format(report.currentPeriodRevenue)}</Text></View>
          <View><Text style={styles.comparisonTrend}>{trendText}</Text><Text style={styles.comparisonPrevious}>Previous equivalent period: {money.format(report.previousPeriodRevenue)}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Paid sales revenue</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.tableHeader]}><Text style={styles.periodCell}>Period</Text><Text style={styles.revenueCell}>Revenue</Text><Text style={styles.changeCell}>Change</Text><Text style={styles.shareCell}>Share</Text></View>
          {report.salesOverview.map((item, index) => <View key={item.label} style={[styles.row, index === report.salesOverview.length - 1 ? styles.lastRow : {}]}><Text style={styles.periodCell}>{item.label}</Text><Text style={styles.revenueCell}>{money.format(item.revenue)}</Text><Text style={styles.changeCell}>{bucketChange(index)}</Text><Text style={styles.shareCell}>{report.currentPeriodRevenue > 0 ? `${((item.revenue / report.currentPeriodRevenue) * 100).toFixed(1)}%` : '0%'}</Text></View>)}
        </View>

        <Text style={styles.sectionTitle}>Inventory snapshot</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.tableHeader]}><Text style={styles.productCell}>Product</Text><Text style={styles.statusCell}>Status</Text><Text style={styles.unitsCell}>Units</Text></View>
          {report.productStock.map((item, index) => <View key={item.id} style={[styles.row, index === report.productStock.length - 1 ? styles.lastRow : {}]}><Text style={styles.productCell}>{item.name}</Text><Text style={styles.statusCell}>{item.quantity === 0 ? 'Out of stock' : item.quantity <= 5 ? 'Low stock' : 'In stock'}</Text><Text style={styles.unitsCell}>{item.quantity}</Text></View>)}
        </View>

        <Text style={styles.footer} fixed>Generated by Climbio. Revenue is based on paid invoices only.</Text>
      </Page>
    </Document>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryCard}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}
