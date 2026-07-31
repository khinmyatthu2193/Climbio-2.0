import { api } from './api';
import type { AIAnalysisResponse } from '@/types/ai';

export const aiService = {
  analyze: () => api.post<AIAnalysisResponse>('/ai/analyze').then((response) => response.data),
};
