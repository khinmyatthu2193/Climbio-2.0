import type { Currency } from '@/types/auth';
import type { DashboardSummary, SalesRange } from '@/types/dashboard';
import type { Language } from '@/hooks/useLanguage';
import { getReportTranslations } from '@/utils/reportTranslations';
import { getSalesComparison } from '@/utils/salesComparison';

const REPORT_FONT = 'Noto Sans Myanmar';
const BRAND_PURPLE = '7C3AED';
const PALE_PURPLE = 'EDE9FE';
const BORDER_PURPLE = 'C4B5FD';
const TEXT = '1E293B';
const MUTED = '64748B';

export async function downloadFinancialReportExcel({ report, shopName, currency, range, createdAt, language = 'en' }: {
  report: DashboardSummary;
  shopName: string;
  currency: Currency;
  range: SalesRange;
  createdAt: Date;
  language?: Language;
}) {
  const { default: ExcelJS } = await import('exceljs');
  const t = getReportTranslations(language);
  const comparison = getSalesComparison(range, report, currency, language, createdAt);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Climbio';
  workbook.created = createdAt;
  workbook.modified = createdAt;
  workbook.title = `${t.financialReport} - ${shopName}`;

  const sheet = workbook.addWorksheet(t.financialReport.slice(0, 31), {
    views: [{ state: 'frozen', ySplit: 4 }],
    properties: { defaultRowHeight: 22 },
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  sheet.columns = [
    { key: 'first', width: 31 },
    { key: 'second', width: 27 },
    { key: 'third', width: 28 },
    { key: 'fourth', width: 25 },
  ];

  sheet.eachRow((row) => {
    row.font = { name: REPORT_FONT, size: 11, color: { argb: `FF${TEXT}` } };
    row.alignment = { vertical: 'middle', wrapText: true };
  });

  mergeAndSet(sheet, 'A1:D1', t.financialReport);
  styleTitle(sheet.getCell('A1'));
  sheet.getRow(1).height = 36;
  mergeAndSet(sheet, 'A2:D2', shopName);
  sheet.getCell('A2').font = { name: REPORT_FONT, size: 14, bold: true, color: { argb: `FF${BRAND_PURPLE}` } };
  sheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(2).height = 27;

  const locale = language === 'my' ? 'my-MM' : 'en-US';
  sheet.getCell('A3').value = t.reportingPeriod;
  sheet.getCell('B3').value = t.ranges[range];
  sheet.getCell('C3').value = t.generated;
  sheet.getCell('D3').value = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(createdAt);
  ['A3', 'C3'].forEach((address) => { sheet.getCell(address).font = { name: REPORT_FONT, bold: true, color: { argb: `FF${MUTED}` } }; });

  sectionRow(sheet, 5, t.businessSummary);
  const summary = [
    [t.salesReceived, report.totalRevenue, true],
    [t.products, report.totalProducts, false],
    [t.stockAvailable, report.totalStock, false],
    [t.itemsRunningLow, report.lowStockCount, false],
  ] as const;
  summary.forEach(([label, value, isCurrency], index) => {
    const row = 6 + index;
    sheet.getCell(row, 1).value = label;
    sheet.getCell(row, 2).value = value;
    sheet.mergeCells(row, 2, row, 4);
    styleBodyRow(sheet, row, index % 2 === 1);
    sheet.getCell(row, 1).font = { name: REPORT_FONT, bold: true, color: { argb: `FF${TEXT}` } };
    sheet.getCell(row, 2).font = { name: REPORT_FONT, bold: true, color: { argb: isCurrency ? 'FF047857' : `FF${TEXT}` } };
    sheet.getCell(row, 2).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(row, 2).numFmt = isCurrency ? currencyNumberFormat(currency) : '#,##0';
  });

  sectionRow(sheet, 11, t.salesComparison);
  const comparisonRows = [[`${t.currentPeriod}\n${comparison.currentDates}`, report.currentPeriodRevenue], [`${comparison.previousLabel}\n${comparison.previousDates}`, report.previousPeriodRevenue], [t.difference, comparison.amount]] as const;
  comparisonRows.forEach(([label, value], index) => { const row = 12 + index; sheet.getCell(row, 1).value = label; sheet.getCell(row, 2).value = value; sheet.mergeCells(row, 2, row, 4); styleBodyRow(sheet, row, index % 2 === 1); sheet.getCell(row, 2).numFmt = currencyNumberFormat(currency); });
  mergeAndSet(sheet, 'A15:D15', comparison.message); styleBodyRow(sheet, 15, true);
  sectionRow(sheet, 17, t.salesDetails);
  tableHeader(sheet, 18, [t.period, t.sales, t.change, t.share]);
  report.salesOverview.forEach((item, index) => {
    const rowNumber = 19 + index;
    const previous = index === 0 ? null : report.salesOverview[index - 1]!.revenue;
    const change = previous === null ? '-' : previous === 0 ? (item.revenue > 0 ? t.newValue : '-') : `${item.revenue >= previous ? '+' : ''}${(((item.revenue - previous) / previous) * 100).toFixed(1)}%`;
    const share = report.currentPeriodRevenue > 0 ? `${((item.revenue / report.currentPeriodRevenue) * 100).toFixed(1)}%` : '0%';
    sheet.addRow([item.label, item.revenue, change, share]);
    styleBodyRow(sheet, rowNumber, index % 2 === 1);
    sheet.getCell(rowNumber, 2).numFmt = currencyNumberFormat(currency);
    sheet.getCell(rowNumber, 2).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(rowNumber, 3).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getCell(rowNumber, 4).alignment = { horizontal: 'right', vertical: 'middle' };
  });

  const inventorySectionRow = 20 + report.salesOverview.length;
  sectionRow(sheet, inventorySectionRow, t.stockStatus);
  tableHeader(sheet, inventorySectionRow + 1, [t.product, t.status, t.quantity, '']);
  report.productStock.forEach((item, index) => {
    const rowNumber = inventorySectionRow + 2 + index;
    const status = item.quantity === 0 ? t.outOfStock : item.quantity <= 5 ? t.lowStock : t.available;
    sheet.addRow([item.name, status, item.quantity, '']);
    styleBodyRow(sheet, rowNumber, index % 2 === 1);
    sheet.getCell(rowNumber, 3).numFmt = '#,##0';
    sheet.getCell(rowNumber, 3).alignment = { horizontal: 'right', vertical: 'middle' };
  });

  const footerRow = inventorySectionRow + report.productStock.length + 3;
  mergeAndSet(sheet, `A${footerRow}:D${footerRow}`, t.footer);
  sheet.getCell(footerRow, 1).font = { name: REPORT_FONT, size: 9, italic: true, color: { argb: `FF${MUTED}` } };
  sheet.getCell(footerRow, 1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getRow(footerRow).height = 30;

  for (let row = 1; row <= footerRow; row += 1) {
    sheet.getRow(row).eachCell({ includeEmpty: true }, (workbookCell) => {
      workbookCell.font = { ...workbookCell.font, name: REPORT_FONT };
    });
  }

  const data = await workbook.xlsx.writeBuffer();
  const date = createdAt.toISOString().slice(0, 10);
  download(new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `financial-report-${date}.xlsx`);
}

function currencyNumberFormat(currency: Currency) {
  const decimals = currency === 'MMK' ? '0' : '0.00';
  return `"${currency} "#,##${decimals};[Red]-"${currency} "#,##${decimals}`;
}

function mergeAndSet(sheet: import('exceljs').Worksheet, range: string, value: string) {
  sheet.mergeCells(range);
  sheet.getCell(range.split(':')[0]!).value = value;
}

function styleTitle(cell: import('exceljs').Cell) {
  cell.font = { name: REPORT_FONT, size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND_PURPLE}` } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
}

function sectionRow(sheet: import('exceljs').Worksheet, rowNumber: number, label: string) {
  mergeAndSet(sheet, `A${rowNumber}:D${rowNumber}`, label);
  const cell = sheet.getCell(rowNumber, 1);
  cell.font = { name: REPORT_FONT, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
  cell.alignment = { vertical: 'middle' };
  sheet.getRow(rowNumber).height = 27;
}

function tableHeader(sheet: import('exceljs').Worksheet, rowNumber: number, labels: string[]) {
  const row = sheet.getRow(rowNumber);
  labels.forEach((label, index) => { row.getCell(index + 1).value = label; });
  row.height = 28;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: REPORT_FONT, bold: true, color: { argb: 'FF5B21B6' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PALE_PURPLE}` } };
    cell.border = { bottom: { style: 'thin', color: { argb: `FF${BORDER_PURPLE}` } } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
}

function styleBodyRow(sheet: import('exceljs').Worksheet, rowNumber: number, alternate: boolean) {
  const row = sheet.getRow(rowNumber);
  row.height = 25;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: REPORT_FONT, size: 11, color: { argb: `FF${TEXT}` } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: alternate ? 'FFFAFAFF' : 'FFFFFFFF' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFEDE9FE' } } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
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
