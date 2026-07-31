import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const aiRoutes = Router();
aiRoutes.use(requireAuth);
aiRoutes.post('/analyze', aiController.analyze);
