import { Router } from 'express';
import { z } from 'zod';
import { productController } from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireApprovedShop } from '../middleware/approval.js';
import { productImageUpload } from '../middleware/productUpload.js';
import { validateBody, validateParams } from '../middleware/validate.js';

const idParams = z.object({ id: z.string().uuid() }).strict();
const nullableString = (max: number) =>
  z.preprocess((value) => value === '' ? null : value, z.string().trim().max(max).nullable().optional());
const nullableUuid = z.preprocess(
  (value) => value === '' ? null : value,
  z.string().uuid().nullable().optional(),
);
const money = z.coerce.number().finite().min(0).max(999_999_999_999.99);
const productSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: nullableString(2_000),
  price: money,
  costPrice: money,
  quantity: z.coerce.number().int().min(0).max(2_147_483_647),
  categoryId: nullableUuid,
}).strict();

export const productRoutes = Router();
productRoutes.use(requireAuth, requireApprovedShop);
productRoutes.get('/', productController.list);
productRoutes.get('/:id', validateParams(idParams), productController.get);
productRoutes.post('/', productImageUpload.single('image'), validateBody(productSchema), productController.create);
productRoutes.put('/:id', validateParams(idParams), productImageUpload.single('image'), validateBody(productSchema), productController.update);
productRoutes.delete('/:id', validateParams(idParams), productController.remove);
