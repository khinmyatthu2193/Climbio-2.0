import { api } from './api';
import type { AdminDashboard, AdminShop, ApplicationDetail, Paged, ReviewAction } from '@/types/admin';
import type { ShopApprovalStatus } from '@/types/auth';

type ListInput = { page?: number; pageSize?: number; search?: string; status?: ShopApprovalStatus; sort?: 'submittedAt' | 'shopName' };
const params = (input: ListInput) => ({ ...input, status: input.status || undefined });

export const adminService = {
  dashboard: () => api.get<AdminDashboard>('/admin/dashboard').then((r) => r.data),
  applications: (input: ListInput) => api.get<Paged<AdminShop>>('/admin/applications', { params: params(input) }).then((r) => r.data),
  application: (id: string) => api.get<ApplicationDetail>(`/admin/applications/${id}`).then((r) => r.data),
  action: (id: string, input: { action: ReviewAction; feedback?: string; reopenTo?: 'PENDING' | 'CHANGES_REQUESTED' }) => api.post<ApplicationDetail>(`/admin/applications/${id}/actions`, input).then((r) => r.data),
  shops: (input: ListInput) => api.get<Paged<AdminShop>>('/admin/shops', { params: params(input) }).then((r) => r.data),
  users: (input: Omit<ListInput, 'status'>) => api.get<Paged<AdminShop>>('/admin/users', { params: input }).then((r) => r.data),
  auditLogs: (input: { page?: number; pageSize?: number; action?: string }) => api.get<Paged<unknown>>('/admin/audit-logs', { params: input }).then((r) => r.data),
};
