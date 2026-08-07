import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { analysisHeadings, chatHeadings, collectBusinessAnalysis, createBusinessAdvisorPrompt, createBusinessConsultantPrompt, isLikelyPromptInjection, type AIResponseLanguage } from '../services/aiAnalysis.service.js';
import { askAI } from '../services/openrouter.service.js';
import { AppError } from '../utils/AppError.js';

function normalizeResponse(rawContent: string, marker: string, firstHeading: string) {
  const markerIndex = rawContent.lastIndexOf(marker);
  const headingIndex = rawContent.lastIndexOf(firstHeading);
  const extractedContent = markerIndex >= 0
    ? rawContent.slice(markerIndex + marker.length).trim()
    : headingIndex >= 0
      ? rawContent.slice(headingIndex).trim()
      : rawContent.trim();
  return extractedContent
    .normalize('NFKC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function resolveLanguage(value: unknown, question = ''): AIResponseLanguage {
  if (value === 'my') return 'my';
  if (value === 'en') return 'en';
  return /[\u1000-\u109F\uAA60-\uAA7F]/u.test(question) ? 'my' : 'en';
}

function ensureCompleteResponse(content: string, headings: string[], minimumLength: number) {
  if (content.length < minimumLength || !headings.every((heading) => content.includes(heading))) {
    throw new AppError('AI provider returned an incomplete business response. Please try again.', 502);
  }
}

export const aiController = {
  analyze: async (req: Request, res: Response) => {
    const shopId = req.user!.id;
    console.info('[ai] analyze endpoint reached', { openRouterKeyConfigured: Boolean(process.env.OPENROUTER_API_KEY) });
    const language = resolveLanguage(req.body.language);
    const overview = await collectBusinessAnalysis(shopId);
    const requiredHeadings = analysisHeadings[language];
    const rawContent = await askAI(createBusinessAdvisorPrompt(overview, language));
    const content = normalizeResponse(rawContent, 'FINAL_REPORT_START', requiredHeadings[0]!);
    ensureCompleteResponse(content, requiredHeadings, 300);
    const insight = await prisma.aIInsight.create({
      data: { shopId, type: 'SALES_ANALYSIS', content },
      select: { id: true, type: true, content: true, createdAt: true },
    });
    res.status(201).json({ insight, overview });
  },

  chat: async (req: Request, res: Response) => {
    const shopId = req.user!.id;
    console.info('[ai] chat endpoint reached', { openRouterKeyConfigured: Boolean(process.env.OPENROUTER_API_KEY) });
    const question = req.body.question as string;
    if (isLikelyPromptInjection(question)) {
      throw new AppError('Please ask a question about your Climbio business data.', 400);
    }
    const language = resolveLanguage(req.body.language, question);
    const context = await collectBusinessAnalysis(shopId);
    const requiredHeadings = chatHeadings[language];
    const rawAnswer = await askAI({ ...createBusinessConsultantPrompt(context, question, language), maxTokens: 1_200 });
    const answer = normalizeResponse(rawAnswer, 'CHAT_RESPONSE_START', requiredHeadings[0]!);
    ensureCompleteResponse(answer, requiredHeadings, language === 'my' ? 100 : 180);
    const message = await prisma.aIChatHistory.create({
      data: { shopId, question, answer },
      select: { id: true, question: true, answer: true, createdAt: true },
    });
    res.status(201).json({ message });
  },

  history: async (req: Request, res: Response) => {
    const messages = await prisma.aIChatHistory.findMany({
      where: { shopId: req.user!.id },
      select: { id: true, question: true, answer: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ messages: messages.reverse() });
  },
};
