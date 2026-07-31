import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { collectBusinessAnalysis, createBusinessAdvisorPrompt } from '../services/aiAnalysis.service.js';
import { askAI } from '../services/openrouter.service.js';
import { AppError } from '../utils/AppError.js';

export const aiController = {
  analyze: async (req: Request, res: Response) => {
    const shopId = req.user!.id;
    const overview = await collectBusinessAnalysis(shopId);
    const rawContent = await askAI(createBusinessAdvisorPrompt(overview));
    const marker = 'FINAL_REPORT_START';
    const markerIndex = rawContent.lastIndexOf(marker);
    const headingIndex = rawContent.lastIndexOf('## Business Performance Summary');
    const extractedContent = markerIndex >= 0
      ? rawContent.slice(markerIndex + marker.length).trim()
      : headingIndex >= 0
        ? rawContent.slice(headingIndex).trim()
        : rawContent.trim();
    const content = extractedContent
      .normalize('NFKD')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/[^\x00-\x7F]/g, '')
      .trim();
    const requiredHeadings = [
      '## Business Performance Summary',
      '## Important Problems',
      '## Inventory Recommendations',
      '## Sales Improvement Suggestions',
      '## Action Plan',
    ];
    if (content.length < 300 || /[^\x00-\x7F]/.test(content) || !requiredHeadings.every((heading) => content.includes(heading))) {
      throw new AppError('AI provider returned an incomplete business analysis. Please try again.', 502);
    }
    const insight = await prisma.aIInsight.create({
      data: { shopId, type: 'SALES_ANALYSIS', content },
      select: { id: true, type: true, content: true, createdAt: true },
    });
    res.status(201).json({ insight, overview });
  },
};
