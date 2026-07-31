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

export interface AIChatMessage {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface AIChatResponse { message: AIChatMessage }
export interface AIChatHistoryResponse { messages: AIChatMessage[] }

export interface AIAnalysisResponse {
  insight: {
    id: string;
    type: 'DAILY_REPORT' | 'SALES_ANALYSIS' | 'INVENTORY_ALERT';
    content: string;
    createdAt: string;
  };
  overview: BusinessAnalysisOverview;
}
