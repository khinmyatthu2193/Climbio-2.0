import { api } from './api';
import type { AIAnalysisResponse, AIChatHistoryResponse, AIChatResponse } from '@/types/ai';
import type { Language } from '@/hooks/useLanguage';

export const aiService = {
  analyze: (language: Language = 'en') => api.post<AIAnalysisResponse>('/ai/analyze', { language }).then((response) => response.data),
  chat: ({ question, language }: { question: string; language: Language }) => api.post<AIChatResponse>('/ai/chat', { question, language }).then((response) => response.data),
  chatHistory: () => api.get<AIChatHistoryResponse>('/ai/chat').then((response) => response.data),
  deleteChatMessage: (id: string) => api.delete(`/ai/chat/${id}`),
  clearChatHistory: () => api.delete('/ai/chat'),
};
