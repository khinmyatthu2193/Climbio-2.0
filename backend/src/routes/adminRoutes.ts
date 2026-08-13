import { Router } from 'express';
import { z } from 'zod';
import { adminController } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireActiveAdmin } from '../middleware/approval.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { promptGalleryController } from '../controllers/promptGalleryController.js';
import { promptImageUpload } from '../middleware/promptUpload.js';

const idParams = z.object({ shopId: z.string().uuid() }).strict();
const promptIdParams = z.object({ id: z.string().uuid() }).strict();
const promptSchema = z.object({ title: z.string().trim().min(1).max(160), categoryId: z.string().uuid(), content: z.string().trim().min(1).max(20000), aiTools: z.array(z.string().trim().min(1).max(100)).min(1).max(10), exampleImageUrl: z.string().url().max(1000).nullable().optional(), status: z.enum(['DRAFT', 'PUBLISHED']) }).strict();
const promptUpdateSchema = promptSchema.partial().refine((data) => Object.keys(data).length > 0, 'Provide at least one field');
const promptCategorySchema = z.object({ name: z.string().trim().min(1).max(100), icon: z.string().trim().max(20).nullable().optional(), description: z.string().trim().max(2000).nullable().optional(), isActive: z.boolean().optional() }).strict();
const reviewSchema = z.object({
  action: z.enum(['APPROVE', 'REQUEST_CHANGES', 'DECLINE', 'SUSPEND', 'REACTIVATE', 'GENERAL_FEEDBACK', 'REOPEN']),
  feedback: z.string().trim().max(5000).optional(),
  reopenTo: z.enum(['PENDING', 'CHANGES_REQUESTED']).optional(),
}).strict().superRefine((value, context) => {
  if (['REQUEST_CHANGES', 'DECLINE', 'GENERAL_FEEDBACK'].includes(value.action) && !value.feedback) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['feedback'], message: 'Feedback is required for this action' });
  }
  if (value.action === 'REOPEN' && !value.reopenTo) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['reopenTo'], message: 'Choose the status to reopen this application into' });
  }
  if (value.action === 'REOPEN' && value.reopenTo === 'CHANGES_REQUESTED' && !value.feedback) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['feedback'], message: 'Feedback is required when reopening for changes' });
  }
});

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireActiveAdmin);
adminRoutes.get('/dashboard', adminController.dashboard);
adminRoutes.get('/applications', adminController.applications);
adminRoutes.get('/applications/:shopId', validateParams(idParams), adminController.application);
adminRoutes.post('/applications/:shopId/actions', validateParams(idParams), validateBody(reviewSchema), adminController.action);
adminRoutes.get('/shops', adminController.shops);
adminRoutes.get('/users', adminController.users);
adminRoutes.get('/audit-logs', adminController.auditLogs);
adminRoutes.get('/prompts', promptGalleryController.adminList);
adminRoutes.post('/prompt-images', promptImageUpload.single('image'), promptGalleryController.uploadImage);
adminRoutes.post('/prompts', validateBody(promptSchema), promptGalleryController.create);
adminRoutes.patch('/prompts/:id', validateParams(promptIdParams), validateBody(promptUpdateSchema), promptGalleryController.update);
adminRoutes.delete('/prompts/:id', validateParams(promptIdParams), promptGalleryController.remove);
adminRoutes.get('/prompt-categories', promptGalleryController.adminCategories);
adminRoutes.post('/prompt-categories', validateBody(promptCategorySchema), promptGalleryController.createCategory);
adminRoutes.patch('/prompt-categories/:id', validateParams(promptIdParams), validateBody(promptCategorySchema), promptGalleryController.updateCategory);
adminRoutes.delete('/prompt-categories/:id', validateParams(promptIdParams), promptGalleryController.removeCategory);
