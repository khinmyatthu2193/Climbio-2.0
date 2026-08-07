import axios from 'axios';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export interface AIRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

export async function askAI({ systemPrompt, userPrompt, maxTokens = 1_600 }: AIRequest) {
  if (!env.OPENROUTER_API_KEY) {
    console.error('[openrouter] request skipped: API key is not configured');
    throw new AppError('AI analysis is not configured', 503);
  }

  try {
    console.info('[openrouter] request started', { model: env.OPENROUTER_MODEL });
    const { data } = await axios.post<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: env.OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: maxTokens,
        reasoning: { exclude: true },
      },
      {
        // Free providers can queue requests for a while before generation starts.
        timeout: 180_000,
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': env.FRONTEND_URL,
          'X-Title': 'Climbio AI Business Advisor',
        },
      },
    );

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new AppError('AI provider returned an empty analysis', 502);
    console.info('[openrouter] request completed', { model: env.OPENROUTER_MODEL });
    return content;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (axios.isAxiosError(error)) {
      const providerMessage = typeof error.response?.data === 'object'
        && error.response?.data
        && 'error' in error.response.data
        ? String((error.response.data as { error?: { message?: string } }).error?.message ?? '')
        : '';
      console.error('OpenRouter request failed', error.response?.status, providerMessage || error.message);
      throw new AppError('AI analysis is temporarily unavailable. Please try again later.', 502);
    }
    throw new AppError('AI analysis could not be completed', 502);
  }
}
