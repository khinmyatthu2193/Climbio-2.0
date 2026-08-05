import { Router } from 'express';
import { z } from 'zod';
import { adminController } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireActiveAdmin } from '../middleware/approval.js';
import { validateBody, validateParams } from '../middleware/validate.js';

const idParams = z.object({ shopId: z.string().uuid() }).strict();
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
