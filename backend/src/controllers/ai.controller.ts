import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { collectBusinessAnalysis, createBusinessAdvisorPrompt, createBusinessConsultantPrompt } from '../services/aiAnalysis.service.js';
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
    .normalize('NFKD')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\x7F]/g, '')
    .trim();
}

function ensureCompleteResponse(content: string, headings: string[], minimumLength: number) {
  if (content.length < minimumLength || !headings.every((heading) => content.includes(heading))) {
    throw new AppError('AI provider returned an incomplete business response. Please try again.', 502);
  }
}

export const aiController = {
  analyze: async (req: Request, res: Response) => {
    const shopId = req.user!.id;
    const overview = await collectBusinessAnalysis(shopId);
    const rawContent = await askAI(createBusinessAdvisorPrompt(overview));
    const content = normalizeResponse(rawContent, 'FINAL_REPORT_START', '## Business Performance Summary');
    const requiredHeadings = [
      '## Business Performance Summary',
      '## Important Problems',
      '## Inventory Recommendations',
      '## Sales Improvement Suggestions',
      '## Action Plan',
    ];
    ensureCompleteResponse(content, requiredHeadings, 300);
    const insight = await prisma.aIInsight.create({
      data: { shopId, type: 'SALES_ANALYSIS', content },
      select: { id: true, type: true, content: true, createdAt: true },
    });
    res.status(201).json({ insight, overview });
  },

  chat: async (req: Request, res: Response) => {
    const shopId = req.user!.id;
    const question = req.body.question as string;
    const context = await collectBusinessAnalysis(shopId);
    const rawAnswer = await askAI(createBusinessConsultantPrompt(context, question));
    const answer = normalizeResponse(rawAnswer, 'CHAT_RESPONSE_START', '## Recommendation');
    ensureCompleteResponse(answer, [
      '## Recommendation',
      '## Analysis',
      '## Risks / Considerations',
      '## Suggested Next Steps',
    ], 180);
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
