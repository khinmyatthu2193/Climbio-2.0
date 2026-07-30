import { prisma } from '../config/prisma.js';

const LOW_STOCK_LIMIT = 5;
const SALES_MONTHS = 6;

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function salesMonthRange() {
  const current = monthStart(new Date());
  return Array.from({ length: SALES_MONTHS }, (_, index) => {
    const offset = SALES_MONTHS - index - 1;
    return new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - offset, 1));
  });
}

export const reportService = {
  async dashboardSummary(userId: string) {
    const months = salesMonthRange();
    const salesStart = months[0];

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

    const salesByMonth = new Map(months.map((month) => [monthKey(month), 0]));
    for (const invoice of recentSales) {
      const key = monthKey(invoice.createdAt);
      salesByMonth.set(key, (salesByMonth.get(key) ?? 0) + invoice.total.toNumber());
    }

    return {
      totalProducts: productTotals._count.id,
      totalStock: productTotals._sum.quantity ?? 0,
      lowStockCount,
      totalRevenue: revenue._sum.total?.toNumber() ?? 0,
      productStock,
      salesOverview: months.map((month) => ({
        month: month.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        revenue: salesByMonth.get(monthKey(month)) ?? 0,
      })),
    };
  },
};
