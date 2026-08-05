import { Router } from 'express';
import { z } from 'zod';
import { shopApplicationController } from '../controllers/shopApplicationController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  shopName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).nullable().optional(),
  shopAddress: z.string().trim().max(500).nullable().optional(),
}).strict();

export const shopApplicationRoutes = Router();
shopApplicationRoutes.use(requireAuth);
shopApplicationRoutes.get('/', shopApplicationController.get);
shopApplicationRoutes.put('/', validateBody(applicationSchema), shopApplicationController.update);
shopApplicationRoutes.post('/resubmit', shopApplicationController.resubmit);
