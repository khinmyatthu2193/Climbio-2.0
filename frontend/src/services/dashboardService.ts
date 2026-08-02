import { api } from './api';
import type { DashboardSummary, SalesRange } from '@/types/dashboard';

export const dashboardService = {
  summary: (range: SalesRange) => api.get<DashboardSummary>('/dashboard/summary', { params: { range } }).then((response) => response.data),
};
