export interface BusinessAnalysisOverview {
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

export interface AIAnalysisResponse {
  insight: {
    id: string;
    type: 'DAILY_REPORT' | 'SALES_ANALYSIS' | 'INVENTORY_ALERT';
    content: string;
    createdAt: string;
  };
  overview: BusinessAnalysisOverview;
}
