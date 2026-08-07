import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireApprovedShop } from '../middleware/approval.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { z } from 'zod';

const languageSchema = z.enum(['en', 'my']);
const analyzeSchema = z.object({ language: languageSchema.optional() }).strict();
const chatSchema = z.object({ question: z.string().trim().min(3).max(500), language: languageSchema.optional() }).strict();
const chatIdSchema = z.object({ id: z.string().uuid() }).strict();

export const aiRoutes = Router();
aiRoutes.use(requireAuth, requireApprovedShop);
aiRoutes.post('/analyze', validateBody(analyzeSchema), aiController.analyze);
aiRoutes.get('/chat', aiController.history);
aiRoutes.post('/chat', validateBody(chatSchema), aiController.chat);
aiRoutes.delete('/chat', aiController.clearHistory);
aiRoutes.delete('/chat/:id', validateParams(chatIdSchema), aiController.deleteMessage);
