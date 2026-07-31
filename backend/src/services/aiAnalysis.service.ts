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
  products: Array<{ name: string; category: string; sellingPrice: number; costPrice: number; stock: number }>;
  inventory: {
    totalProducts: number;
    totalStock: number;
    lowStockProducts: Array<{ name: string; stock: number }>;
    outOfStockProducts: Array<{ name: string; stock: number }>;
  };
  customers: {
    customerCount: number;
    repeatCustomers: number;
    purchaseHistory: Array<{ customer: string; transactions: number; totalSpent: number; lastPurchase: string }>;
  };
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

  const [shop, paidInvoices, recentInvoices, previousInvoices, topProductGroups, slowProducts, inventoryProducts, customerRecords, customerInvoices] = await prisma.$transaction([
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
    prisma.product.findMany({ where: { userId, isActive: true }, select: { name: true, quantity: true, price: true, costPrice: true, category: { select: { name: true } } }, take: 100 }),
    prisma.customer.count({ where: { userId } }),
    prisma.invoice.findMany({ where: { userId, status: 'PAID' }, select: { customerName: true, customerPhone: true, total: true, createdAt: true } }),
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
  const customerHistory = new Map<string, { customer: string; transactions: number; totalSpent: number; lastPurchase: Date }>();
  for (const invoice of customerInvoices) {
    const key = invoice.customerPhone?.trim() || invoice.customerName.trim().toLowerCase();
    customerFrequency.set(key, (customerFrequency.get(key) ?? 0) + 1);
    const current = customerHistory.get(key);
    customerHistory.set(key, {
      customer: invoice.customerName,
      transactions: (current?.transactions ?? 0) + 1,
      totalSpent: (current?.totalSpent ?? 0) + invoice.total.toNumber(),
      lastPurchase: !current || invoice.createdAt > current.lastPurchase ? invoice.createdAt : current.lastPurchase,
    });
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
    topProducts: topProductGroups.map((product) => ({ name: product.productName, unitsSold: product._sum?.quantity ?? 0 })),
    slowProducts: slowProducts.map((product) => ({ name: product.name, stock: product.quantity, sellingPrice: product.price.toNumber() })),
    products: inventoryProducts.map((product) => ({
      name: product.name,
      category: product.category?.name ?? 'Uncategorized',
      sellingPrice: product.price.toNumber(),
      costPrice: product.costPrice.toNumber(),
      stock: product.quantity,
    })),
    inventory: {
      totalProducts: inventoryProducts.length,
      totalStock: inventoryProducts.reduce((sum, product) => sum + product.quantity, 0),
      lowStockProducts: inventoryProducts.filter((product) => product.quantity > 0 && product.quantity <= LOW_STOCK_LIMIT).map((product) => ({ name: product.name, stock: product.quantity })),
      outOfStockProducts: inventoryProducts.filter((product) => product.quantity === 0).map((product) => ({ name: product.name, stock: 0 })),
    },
    customers: {
      customerCount: Math.max(customerRecords, customerFrequency.size),
      repeatCustomers: [...customerFrequency.values()].filter((count) => count > 1).length,
      purchaseHistory: [...customerHistory.values()]
        .sort((left, right) => right.totalSpent - left.totalSpent)
        .slice(0, 10)
        .map((customer) => ({ ...customer, totalSpent: round(customer.totalSpent), lastPurchase: customer.lastPurchase.toISOString() })),
    },
  };
}

function makeAsciiSafe<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value: unknown) => {
    if (typeof value !== 'string') return value;
    const cleaned = value
      .normalize('NFKD')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
    return cleaned || 'Non-English name';
  })) as T;
}

export function createBusinessAdvisorPrompt(data: BusinessAnalysisData) {
  const asciiData = makeAsciiSafe(data);

  return `You are Climbio AI Advisor, an expert retail business analyst.

Always respond in English.
Use clear, professional business English.
Do not use Myanmar language or any non-English characters.
If a shop or product name contains non-English characters, transliterate it into English characters.
Do not invent facts or numbers. If data is limited, say so clearly. Use the shop currency (${data.shop.currency}) for money.

SHOP DATA:
${JSON.stringify(asciiData, null, 2)}

Begin the final answer with the exact marker FINAL_REPORT_START on its own line. Do not write anything before that marker. After the marker, structure the response exactly with these Markdown headings:

## Business Performance Summary

## Important Problems

## Inventory Recommendations

## Sales Improvement Suggestions

## Action Plan

Under each heading, use short bullet points. Prioritize concrete observations from the data and specific actions the owner can take this week.`;
}

export function createBusinessConsultantPrompt(data: BusinessAnalysisData, question: string) {
  const context = makeAsciiSafe(data);
  const safeQuestion = makeAsciiSafe(question);
  return `You are Climbio AI Business Consultant.

You help small and medium shop owners make better business decisions.
You have access to the shop's real business data.

Always:
- Base conclusions only on strong evidence in the provided business context.
- Focus on sales, inventory, revenue, product performance, and observed customer purchase behavior.
- Give practical recommendations.
- Explain reasons clearly.
- Mention risks when necessary.
- Do not infer nationality, ethnicity, location, gender, income, or other personal characteristics from customer names or personal data.
- Do not interpret personal data beyond the aggregated purchase behavior explicitly provided.
- Avoid assumptions from weak signals. If an assumption is necessary, label it clearly as an assumption and explain the supporting evidence.
- When the available evidence is insufficient, state exactly: "More data is needed to provide an accurate recommendation."
- Do not invent facts, causes, trends, or numbers that are not supported by the context.
- Answer only the owner's business question. Do not behave as a general chatbot.
- Always answer in English using ASCII characters only.

BUSINESS CONTEXT:
${JSON.stringify(context, null, 2)}

OWNER QUESTION:
${safeQuestion}

Begin the final answer with CHAT_RESPONSE_START on its own line. Do not write anything before it. Then use exactly these Markdown headings with concise bullet points:

## Recommendation

## Analysis

## Risks / Considerations

## Suggested Next Steps`;
}
