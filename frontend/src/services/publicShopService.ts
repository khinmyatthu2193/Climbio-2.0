import { api } from './api';
import type { PublicShopResponse } from '@/types/publicShop';

export const publicShopService = {
  get: (slug: string) => api.get<PublicShopResponse>(`/shop/${encodeURIComponent(slug)}`).then((response) => response.data),
};
