import { Router } from 'express';
import { z } from 'zod';
import { publicShopController } from '../controllers/publicShopController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireApprovedShop } from '../middleware/approval.js';
import { validateBody, validateParams } from '../middleware/validate.js';

const slugParams = z.object({
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}).strict();
const statusSchema = z.object({ publicEnabled: z.boolean() }).strict();
const storeSchema = z.object({
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens only'),
  shopName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).nullable().optional(),
  shopAddress: z.string().trim().max(500).nullable().optional(),
}).strict();

export const publicShopRoutes = Router();
publicShopRoutes.get('/my-store', requireAuth, requireApprovedShop, publicShopController.getMyStore);
publicShopRoutes.put('/my-store/status', requireAuth, requireApprovedShop, validateBody(statusSchema), publicShopController.updateStatus);
publicShopRoutes.put('/my-store', requireAuth, requireApprovedShop, validateBody(storeSchema), publicShopController.updateMyStore);
publicShopRoutes.get('/:slug', validateParams(slugParams), publicShopController.get);
