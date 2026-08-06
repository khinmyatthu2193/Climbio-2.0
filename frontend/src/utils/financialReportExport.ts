import type { Currency } from '@/types/auth';
import type { DashboardSummary, SalesRange } from '@/types/dashboard';

const rangeLabels: Record<SalesRange, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '6m': 'Last 6 months' };

function escapeXml(value: string | number) {
  return String(value).replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);
}

function cell(value: string | number, type: 'String' | 'Number' = 'String') {
  return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

export function downloadFinancialReportExcel({ report, shopName, currency, range, createdAt }: {
  report: DashboardSummary;
  shopName: string;
  currency: Currency;
  range: SalesRange;
  createdAt: Date;
}) {
  const date = createdAt.toISOString().slice(0, 10);
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'MMK' ? 0 : 2 });
  const rows = [
    `<Row>${cell('Financial Report')}${cell(shopName)}</Row>`,
    `<Row>${cell('Reporting period')}${cell(rangeLabels[range])}</Row>`,
    `<Row>${cell('Generated')}${cell(createdAt.toLocaleString())}</Row>`,
    '<Row></Row>',
    `<Row>${cell('Summary')}${cell('Value')}</Row>`,
    `<Row>${cell('Paid revenue')}${cell(report.totalRevenue, 'Number')}</Row>`,
    `<Row>${cell('Products')}${cell(report.totalProducts, 'Number')}</Row>`,
    `<Row>${cell('Stock on hand')}${cell(report.totalStock, 'Number')}</Row>`,
    `<Row>${cell('Low-stock items')}${cell(report.lowStockCount, 'Number')}</Row>`,
    '<Row></Row>',
    `<Row>${cell('Paid sales revenue')}${cell(money.format(report.totalRevenue))}</Row>`,
    `<Row>${cell('Period')}${cell('Revenue')}</Row>`,
    ...report.salesOverview.map((item) => `<Row>${cell(item.label)}${cell(item.revenue, 'Number')}</Row>`),
    '<Row></Row>',
    `<Row>${cell('Inventory snapshot')}${cell('Units in stock')}</Row>`,
    `<Row>${cell('Product')}${cell('Quantity')}</Row>`,
    ...report.productStock.map((item) => `<Row>${cell(item.name)}${cell(item.quantity, 'Number')}</Row>`),
  ];
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Financial Report"><Table>${rows.join('')}</Table></Worksheet></Workbook>`;
  download(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }), `financial-report-${date}.xls`);
}

export function download(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
