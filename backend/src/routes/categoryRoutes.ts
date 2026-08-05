import { Router } from 'express';
import { z } from 'zod';
import { categoryController } from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireApprovedShop } from '../middleware/approval.js';
import { validateBody, validateParams } from '../middleware/validate.js';

const idParams = z.object({ id: z.string().uuid() }).strict();
const categorySchema = z.object({ name: z.string().trim().min(1).max(100) }).strict();

export const categoryRoutes = Router();
categoryRoutes.use(requireAuth, requireApprovedShop);
categoryRoutes.get('/', categoryController.list);
categoryRoutes.post('/', validateBody(categorySchema), categoryController.create);
categoryRoutes.delete('/:id', validateParams(idParams), categoryController.remove);
