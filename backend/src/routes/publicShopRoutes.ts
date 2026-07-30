import { Router } from 'express';
import { z } from 'zod';
import { publicShopController } from '../controllers/publicShopController.js';
import { validateParams } from '../middleware/validate.js';

const slugParams = z.object({
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}).strict();

export const publicShopRoutes = Router();
publicShopRoutes.get('/:slug', validateParams(slugParams), publicShopController.get);
