import { Router } from 'express';
import { z } from 'zod';
import { publicShopController } from '../controllers/publicShopController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';

const slugParams = z.object({
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}).strict();
const statusSchema = z.object({ publicEnabled: z.boolean() }).strict();
const storeSchema = z.object({
  slug: z.string().trim().toLowerCase().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shopName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).nullable().optional(),
  shopAddress: z.string().trim().max(500).nullable().optional(),
}).strict();

export const publicShopRoutes = Router();
publicShopRoutes.get('/my-store', requireAuth, requireRole('ADMIN'), publicShopController.getMyStore);
publicShopRoutes.put('/my-store/status', requireAuth, requireRole('ADMIN'), validateBody(statusSchema), publicShopController.updateStatus);
publicShopRoutes.put('/my-store', requireAuth, requireRole('ADMIN'), validateBody(storeSchema), publicShopController.updateMyStore);
publicShopRoutes.get('/:slug', validateParams(slugParams), publicShopController.get);
