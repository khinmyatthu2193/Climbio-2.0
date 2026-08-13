import { prisma } from '../config/prisma.js';

const LOW_STOCK_LIMIT = 5;
const BUSINESS_TIME_ZONE_OFFSET_MINUTES = 6 * 60 + 30;
const BUSINESS_TIME_ZONE_OFFSET_MS = BUSINESS_TIME_ZONE_OFFSET_MINUTES * 60 * 1000;
export type SalesRange = '7d' | '30d' | '6m';

const SALES_RANGE_CONFIG = {
  '7d': { buckets: 7, unit: 'day' },
  '30d': { buckets: 30, unit: 'day' },
  '6m': { buckets: 6, unit: 'month' },
} as const satisfies Record<SalesRange, { buckets: number; unit: 'day' | 'month' }>;

function monthKey(date: Date) {
  const local = new Date(date.getTime() + BUSINESS_TIME_ZONE_OFFSET_MS);
  return `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, '0')}`;
}

function dayKey(date: Date) {
  return new Date(date.getTime() + BUSINESS_TIME_ZONE_OFFSET_MS).toISOString().slice(0, 10);
}

function salesBuckets(range: SalesRange) {
  const config = SALES_RANGE_CONFIG[range];
  const current = new Date(Date.now() + BUSINESS_TIME_ZONE_OFFSET_MS);

  return Array.from({ length: config.buckets }, (_, index) => {
    const offset = config.buckets - index - 1;
    const date = config.unit === 'month'
      ? new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - offset, 1) - BUSINESS_TIME_ZONE_OFFSET_MS)
      : new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate() - offset) - BUSINESS_TIME_ZONE_OFFSET_MS);
    const displayDate = new Date(date.getTime() + BUSINESS_TIME_ZONE_OFFSET_MS);
    return {
      date,
      key: config.unit === 'month' ? monthKey(date) : dayKey(date),
      label: config.unit === 'month'
        ? displayDate.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' })
        : displayDate.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    };
  });
}

function normalizeSalesRange(range: SalesRange | undefined): SalesRange {
  return range && range in SALES_RANGE_CONFIG ? range : '7d';
}

export const reportService = {
  async dashboardSummary(userId: string, salesRange: SalesRange = '7d') {
    salesRange = normalizeSalesRange(salesRange);
    const buckets = salesBuckets(salesRange);
    const salesStart = buckets[0]!.date;
    const now = new Date();
    const previousSalesStart = new Date(salesStart.getTime() - (now.getTime() - salesStart.getTime()));

    const [productTotals, lowStockCount, revenue, productStock, recentSales, previousRevenue] = await Promise.all([
      prisma.product.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { quantity: true },
      }),
      prisma.product.count({
        where: { userId, quantity: { lte: LOW_STOCK_LIMIT } },
      }),
      prisma.invoice.aggregate({
        where: { userId, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.product.findMany({
        where: { userId },
        select: { id: true, name: true, quantity: true },
        orderBy: [{ quantity: 'asc' }, { name: 'asc' }],
        take: 10,
      }),
      prisma.invoice.findMany({
        where: { userId, status: 'PAID', createdAt: { gte: salesStart } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.invoice.aggregate({
        where: { userId, status: 'PAID', createdAt: { gte: previousSalesStart, lt: salesStart } },
        _sum: { total: true },
      }),
    ]);

    const bucketUnit = SALES_RANGE_CONFIG[salesRange].unit;
    const salesByBucket = new Map(buckets.map((bucket) => [bucket.key, 0]));
    for (const invoice of recentSales) {
      const key = bucketUnit === 'month' ? monthKey(invoice.createdAt) : dayKey(invoice.createdAt);
      salesByBucket.set(key, (salesByBucket.get(key) ?? 0) + invoice.total.toNumber());
    }
    const currentPeriodRevenue = recentSales.reduce((sum, invoice) => sum + invoice.total.toNumber(), 0);
    const previousPeriodRevenue = previousRevenue._sum.total?.toNumber() ?? 0;
    const revenueTrend = previousPeriodRevenue === 0
      ? currentPeriodRevenue > 0 ? 'NEW' : 'FLAT'
      : currentPeriodRevenue > previousPeriodRevenue ? 'UP' : currentPeriodRevenue < previousPeriodRevenue ? 'DOWN' : 'FLAT';
    const revenueChangePercent = previousPeriodRevenue > 0
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : null;

    return {
      totalProducts: productTotals._count.id,
      totalStock: productTotals._sum.quantity ?? 0,
      lowStockCount,
      totalRevenue: revenue._sum.total?.toNumber() ?? 0,
      currentPeriodRevenue,
      previousPeriodRevenue,
      revenueTrend,
      revenueChangePercent,
      productStock,
      salesOverview: buckets.map((bucket) => ({
        label: bucket.label,
        revenue: salesByBucket.get(bucket.key) ?? 0,
      })),
    };
  },
};
