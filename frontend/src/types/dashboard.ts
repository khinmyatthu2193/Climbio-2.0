export type SalesRange = '7d' | '30d' | '6m';

export interface DashboardSummary {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalRevenue: number;
  productStock: Array<{ id: string; name: string; quantity: number }>;
  salesOverview: Array<{ label: string; revenue: number }>;
}
