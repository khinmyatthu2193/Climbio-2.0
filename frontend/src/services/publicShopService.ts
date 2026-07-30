import { api } from './api';
import type { MyPublicStore, PublicShopResponse, UpdatePublicStoreInput } from '@/types/publicShop';

export const publicShopService = {
  get: (slug: string) => api.get<PublicShopResponse>(`/shop/${encodeURIComponent(slug)}`).then((response) => response.data),
  getMyStore: () => api.get<MyPublicStore>('/shop/my-store').then((response) => response.data),
  updateStatus: (publicEnabled: boolean) =>
    api.put<MyPublicStore>('/shop/my-store/status', { publicEnabled }).then((response) => response.data),
  updateMyStore: (input: UpdatePublicStoreInput) =>
    api.put<MyPublicStore>('/shop/my-store', input).then((response) => response.data),
};
