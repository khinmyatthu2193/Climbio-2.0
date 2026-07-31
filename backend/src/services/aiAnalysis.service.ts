import { prisma } from '../config/prisma.js';

const LOW_STOCK_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1_000;

export interface BusinessAnalysisData {
  shop: { name: string; currency: string };
  sales: {
    totalSales: number;
    revenue: number;
    last30DaysRevenue: number;
    previous30DaysRevenue: number;
    revenueTrendPercent: number | null;
    recentDailyTrend: Array<{ date: string; revenue: number }>;
  };
  topProducts: Array<{ name: string; unitsSold: number }>;
  slowProducts: Array<{ name: string; stock: number; sellingPrice: number }>;
  inventory: {
    totalProducts: number;
    totalStock: number;
    lowStockProducts: Array<{ name: string; stock: number }>;
    outOfStockProducts: Array<{ name: string; stock: number }>;
  };
  customers: { customerCount: number; repeatCustomers: number };
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function collectBusinessAnalysis(userId: string): Promise<BusinessAnalysisData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * DAY_MS);
  const sevenDaysAgo = new Date(now.getTime() - 6 * DAY_MS);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [shop, paidInvoices, recentInvoices, previousInvoices, topProductGroups, slowProducts, inventoryProducts, customerRecords, customerInvoices] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { shopName: true, setting: { select: { currency: true } } } }),
    prisma.invoice.findMany({ where: { userId, status: 'PAID' }, select: { total: true } }),
    prisma.invoice.findMany({ where: { userId, status: 'PAID', createdAt: { gte: thirtyDaysAgo } }, select: { total: true, createdAt: true } }),
    prisma.invoice.findMany({ where: { userId, status: 'PAID', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, select: { total: true } }),
    prisma.invoiceItem.groupBy({
      by: ['productName'],
      where: { invoice: { userId, status: 'PAID' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.product.findMany({
      where: { userId, isActive: true, invoiceItems: { none: { invoice: { userId, status: 'PAID', createdAt: { gte: sixtyDaysAgo } } } } },
      select: { name: true, quantity: true, price: true },
      orderBy: [{ quantity: 'desc' }, { name: 'asc' }],
      take: 5,
    }),
    prisma.product.findMany({ where: { userId, isActive: true }, select: { name: true, quantity: true } }),
    prisma.customer.count({ where: { userId } }),
    prisma.invoice.findMany({ where: { userId, status: 'PAID' }, select: { customerName: true, customerPhone: true } }),
  ]);

  const revenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total.toNumber(), 0);
  const currentRevenue = recentInvoices.reduce((sum, invoice) => sum + invoice.total.toNumber(), 0);
  const previousRevenue = previousInvoices.reduce((sum, invoice) => sum + invoice.total.toNumber(), 0);
  const dailyRevenue = new Map<string, number>();
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(sevenDaysAgo.getTime() + offset * DAY_MS);
    dailyRevenue.set(date.toISOString().slice(0, 10), 0);
  }
  for (const invoice of recentInvoices) {
    const key = invoice.createdAt.toISOString().slice(0, 10);
    if (dailyRevenue.has(key)) dailyRevenue.set(key, (dailyRevenue.get(key) ?? 0) + invoice.total.toNumber());
  }
  const customerFrequency = new Map<string, number>();
  for (const invoice of customerInvoices) {
    const key = invoice.customerPhone?.trim() || invoice.customerName.trim().toLowerCase();
    customerFrequency.set(key, (customerFrequency.get(key) ?? 0) + 1);
  }

  return {
    shop: { name: shop.shopName, currency: shop.setting?.currency ?? 'MMK' },
    sales: {
      totalSales: paidInvoices.length,
      revenue: round(revenue),
      last30DaysRevenue: round(currentRevenue),
      previous30DaysRevenue: round(previousRevenue),
      revenueTrendPercent: previousRevenue > 0 ? round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : null,
      recentDailyTrend: [...dailyRevenue].map(([date, dailyTotal]) => ({ date, revenue: round(dailyTotal) })),
    },
    topProducts: topProductGroups.map((product) => ({ name: product.productName, unitsSold: product._sum.quantity ?? 0 })),
    slowProducts: slowProducts.map((product) => ({ name: product.name, stock: product.quantity, sellingPrice: product.price.toNumber() })),
    inventory: {
      totalProducts: inventoryProducts.length,
      totalStock: inventoryProducts.reduce((sum, product) => sum + product.quantity, 0),
      lowStockProducts: inventoryProducts.filter((product) => product.quantity > 0 && product.quantity <= LOW_STOCK_LIMIT).map((product) => ({ name: product.name, stock: product.quantity })),
      outOfStockProducts: inventoryProducts.filter((product) => product.quantity === 0).map((product) => ({ name: product.name, stock: 0 })),
    },
    customers: {
      customerCount: Math.max(customerRecords, customerFrequency.size),
      repeatCustomers: [...customerFrequency.values()].filter((count) => count > 1).length,
    },
  };
}

export function createBusinessAdvisorPrompt(data: BusinessAnalysisData) {
  return `You are Climbio Business Advisor, an expert retail business analyst helping small shop owners.

Analyze the shop data below. Respond entirely in Myanmar language using simple, practical business terms that a small shop owner can understand. Do not invent facts or numbers. If data is limited, say so clearly. Use the shop currency (${data.shop.currency}) for money.

SHOP DATA:
${JSON.stringify(data, null, 2)}

Begin the final answer with the exact marker FINAL_REPORT_START on its own line. Do not write anything before that marker. Then return a concise report with exactly these five headings:
1. Business Performance Summary
2. Important Problems
3. Inventory Recommendations
4. Sales Improvement Suggestions
5. Action Plan

Under each heading, use short bullet points. Prioritize concrete observations from the data and specific actions the owner can take this week.`;
}
