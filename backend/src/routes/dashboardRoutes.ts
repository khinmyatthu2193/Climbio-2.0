import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireApprovedShop } from '../middleware/approval.js';

export const dashboardRoutes = Router();
dashboardRoutes.get('/summary', requireAuth, requireApprovedShop, dashboardController.summary);
