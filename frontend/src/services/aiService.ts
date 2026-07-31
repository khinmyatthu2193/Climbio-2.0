import { api } from './api';
import type { AIAnalysisResponse, AIChatHistoryResponse, AIChatResponse } from '@/types/ai';

export const aiService = {
  analyze: () => api.post<AIAnalysisResponse>('/ai/analyze').then((response) => response.data),
  chat: (question: string) => api.post<AIChatResponse>('/ai/chat', { question }).then((response) => response.data),
  chatHistory: () => api.get<AIChatHistoryResponse>('/ai/chat').then((response) => response.data),
};
