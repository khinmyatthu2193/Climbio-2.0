export type SalesRange = '7d' | '30d' | '6m';

export interface DashboardSummary {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  invoiceCount: number;
  publicStoreStatus: 'ACTIVE' | 'INACTIVE';
  totalRevenue: number;
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  revenueTrend: 'UP' | 'DOWN' | 'FLAT' | 'NEW';
  revenueChangePercent: number | null;
  productStock: Array<{ id: string; name: string; quantity: number }>;
  bestSellers: Array<{ id: string | null; name: string; quantitySold: number; revenue: number }>;
  categoryDemand: Array<{ name: string; quantitySold: number; revenue: number }>;
  salesOverview: Array<{ label: string; revenue: number }>;
}
