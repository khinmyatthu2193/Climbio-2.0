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
    const headingIndex = rawContent.lastIndexOf('1. Business Performance Summary');
    const content = markerIndex >= 0
      ? rawContent.slice(markerIndex + marker.length).trim()
      : headingIndex >= 0
        ? rawContent.slice(headingIndex).trim()
        : rawContent.trim();
    if (content.length < 300 || !/[\u1000-\u109F]/.test(content)) {
      throw new AppError('AI provider returned an incomplete business analysis. Please try again.', 502);
    }
    const insight = await prisma.aIInsight.create({
      data: { shopId, type: 'SALES_ANALYSIS', content },
      select: { id: true, type: true, content: true, createdAt: true },
    });
    res.status(201).json({ insight, overview });
  },
};
