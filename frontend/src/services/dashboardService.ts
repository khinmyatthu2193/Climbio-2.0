import { api } from './api';
import type { DashboardSummary } from '@/types/dashboard';

export const dashboardService = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary').then((response) => response.data),
};
