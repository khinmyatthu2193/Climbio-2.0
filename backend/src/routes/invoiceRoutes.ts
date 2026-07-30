import { Router } from 'express';
import { z } from 'zod';
import { invoiceController } from '../controllers/invoiceController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';

const idParams = z.object({ id: z.string().uuid() }).strict();
const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(2_147_483_647),
}).strict();
const createInvoiceSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerPhone: z.preprocess(
    (value) => value === '' ? null : value,
    z.string().trim().max(30).nullable().optional(),
  ),
  discount: z.coerce.number().finite().min(0).max(999_999_999_999.99).default(0),
  items: z.array(itemSchema).min(1).max(100),
}).strict().superRefine((value, context) => {
  const ids = value.items.map((item) => item.productId);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Each product can only be added once' });
  }
});
const statusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
}).strict();

export const invoiceRoutes = Router();
invoiceRoutes.use(requireAuth);
invoiceRoutes.get('/', invoiceController.list);
invoiceRoutes.get('/:id', validateParams(idParams), invoiceController.get);
invoiceRoutes.post('/', validateBody(createInvoiceSchema), invoiceController.create);
invoiceRoutes.put('/:id/status', validateParams(idParams), validateBody(statusSchema), invoiceController.updateStatus);
