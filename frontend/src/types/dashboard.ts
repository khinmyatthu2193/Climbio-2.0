export type SalesRange = '7d' | '30d' | '6m';

export interface DashboardSummary {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalRevenue: number;
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  revenueTrend: 'UP' | 'DOWN' | 'FLAT' | 'NEW';
  revenueChangePercent: number | null;
  productStock: Array<{ id: string; name: string; quantity: number }>;
  salesOverview: Array<{ label: string; revenue: number }>;
}
