import { Router } from 'express';
import { z } from 'zod';
import { promptGalleryController as controller } from '../controllers/promptGalleryController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireApprovedShop } from '../middleware/approval.js';
import { validateParams } from '../middleware/validate.js';

const idParams = z.object({ id: z.string().uuid() }).strict();
export const promptGalleryRoutes = Router();
promptGalleryRoutes.use(requireAuth, requireApprovedShop);
promptGalleryRoutes.get('/categories', controller.categories);
promptGalleryRoutes.get('/tools', controller.tools);
promptGalleryRoutes.get('/', controller.list);
promptGalleryRoutes.get('/:id', validateParams(idParams), controller.detail);
