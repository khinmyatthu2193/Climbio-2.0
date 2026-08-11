import { api } from './api';
import type { ShopApplication } from '@/types/shopApplication';

export const shopApplicationService = {
  get: () => api.get<ShopApplication>('/shop-application').then((r) => r.data),
  create: (input: FormData) => api.post<ShopApplication>('/shop-application', input, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  update: (input: Pick<ShopApplication, 'name' | 'shopName' | 'phone' | 'shopAddress'>) => api.put<ShopApplication>('/shop-application', input).then((r) => r.data),
  resubmit: () => api.post<ShopApplication>('/shop-application/resubmit').then((r) => r.data),
};
