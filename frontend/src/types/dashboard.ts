export interface DashboardSummary {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalRevenue: number;
  productStock: Array<{ id: string; name: string; quantity: number }>;
  salesOverview: Array<{ month: string; revenue: number }>;
}
