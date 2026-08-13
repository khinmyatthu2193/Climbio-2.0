import { api } from './api';
import type { AIPrompt, PromptCategory, PromptInput } from '@/types/promptGallery';

export const promptGalleryService = {
  list: (filters: { search?: string; categoryId?: string; aiTool?: string }) => api.get<AIPrompt[]>('/prompt-gallery', { params: filters }).then((r) => r.data),
  detail: (id: string) => api.get<AIPrompt>(`/prompt-gallery/${id}`).then((r) => r.data),
  categories: () => api.get<PromptCategory[]>('/prompt-gallery/categories').then((r) => r.data),
  tools: () => api.get<string[]>('/prompt-gallery/tools').then((r) => r.data),
  adminList: () => api.get<AIPrompt[]>('/admin/prompts').then((r) => r.data),
  adminCategories: () => api.get<PromptCategory[]>('/admin/prompt-categories').then((r) => r.data),
  create: (input: PromptInput) => api.post<AIPrompt>('/admin/prompts', input).then((r) => r.data),
  update: (id: string, input: Partial<PromptInput>) => api.patch<AIPrompt>(`/admin/prompts/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/admin/prompts/${id}`),
  uploadImage: (file: File) => {
    const data = new FormData();
    data.append('image', file);
    return api.postForm<{ imageUrl: string }>('/admin/prompt-images', data).then((response) => response.data.imageUrl);
  },
  createCategory: (input: { name: string; icon?: string; description?: string }) => api.post('/admin/prompt-categories', input),
  updateCategory: (id: string, input: { name: string; icon?: string | null; description?: string | null; isActive?: boolean }) => api.patch(`/admin/prompt-categories/${id}`, input),
  removeCategory: (id: string) => api.delete(`/admin/prompt-categories/${id}`),
};
