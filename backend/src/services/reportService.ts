import { prisma } from '../config/prisma.js';

const LOW_STOCK_LIMIT = 5;
export type SalesRange = '7d' | '30d' | '6m';

const SALES_RANGE_CONFIG = {
  '7d': { buckets: 7, unit: 'day' },
  '30d': { buckets: 30, unit: 'day' },
  '6m': { buckets: 6, unit: 'month' },
} as const satisfies Record<SalesRange, { buckets: number; unit: 'day' | 'month' }>;

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function dayStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function salesBuckets(range: SalesRange) {
  const config = SALES_RANGE_CONFIG[range];
  const now = new Date();
  const current = config.unit === 'month' ? monthStart(now) : dayStart(now);

  return Array.from({ length: config.buckets }, (_, index) => {
    const offset = config.buckets - index - 1;
    const date = config.unit === 'month'
      ? new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - offset, 1))
      : new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate() - offset));
    return {
      date,
      key: config.unit === 'month' ? monthKey(date) : dayKey(date),
      label: config.unit === 'month'
        ? date.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' })
        : date.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    };
  });
}

function normalizeSalesRange(range: SalesRange | undefined): SalesRange {
  return range && range in SALES_RANGE_CONFIG ? range : '6m';
}

export const reportService = {
  async dashboardSummary(userId: string, salesRange: SalesRange = '6m') {
    salesRange = normalizeSalesRange(salesRange);
    const buckets = salesBuckets(salesRange);
    const salesStart = buckets[0]!.date;

    const [productTotals, lowStockCount, revenue, productStock, recentSales] = await Promise.all([
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
        orderBy: [{ quantity: 'desc' }, { name: 'asc' }],
        take: 10,
      }),
      prisma.invoice.findMany({
        where: { userId, status: 'PAID', createdAt: { gte: salesStart } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const bucketUnit = SALES_RANGE_CONFIG[salesRange].unit;
    const salesByBucket = new Map(buckets.map((bucket) => [bucket.key, 0]));
    for (const invoice of recentSales) {
      const key = bucketUnit === 'month' ? monthKey(invoice.createdAt) : dayKey(invoice.createdAt);
      salesByBucket.set(key, (salesByBucket.get(key) ?? 0) + invoice.total.toNumber());
    }

    return {
      totalProducts: productTotals._count.id,
      totalStock: productTotals._sum.quantity ?? 0,
      lowStockCount,
      totalRevenue: revenue._sum.total?.toNumber() ?? 0,
      productStock,
      salesOverview: buckets.map((bucket) => ({
        label: bucket.label,
        revenue: salesByBucket.get(bucket.key) ?? 0,
      })),
    };
  },
};
