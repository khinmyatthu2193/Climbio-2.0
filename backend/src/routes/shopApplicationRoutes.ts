import { Router } from 'express';
import { z } from 'zod';
import { shopApplicationController } from '../controllers/shopApplicationController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { applicationUpload } from '../middleware/upload.js';

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  shopName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).nullable().optional(),
  shopAddress: z.string().trim().max(500).nullable().optional(),
}).strict();

const createApplicationSchema = z.object({
  shopName: z.string().trim().min(2).max(100),
  businessCategory: z.string().trim().min(2).max(100),
  businessDescription: z.string().trim().min(20).max(2000),
  businessPhone: z.string().trim().min(5).max(30),
  businessEmail: z.union([z.string().trim().email().max(255), z.literal('')]).optional(),
  shopAddress: z.string().trim().min(5).max(500),
  cityTownship: z.string().trim().min(2).max(100),
  ownerRole: z.string().trim().min(2).max(100),
  businessRegistrationNumber: z.string().trim().max(100).optional(),
  websiteUrl: z.union([z.string().trim().url().max(500), z.literal('')]).optional(),
}).strict();

export const shopApplicationRoutes = Router();
shopApplicationRoutes.use(requireAuth);
shopApplicationRoutes.get('/', shopApplicationController.get);
shopApplicationRoutes.post('/', applicationUpload.fields([{ name: 'shopLogo', maxCount: 1 }, { name: 'verificationDocument', maxCount: 1 }]), validateBody(createApplicationSchema), shopApplicationController.create);
shopApplicationRoutes.put('/', validateBody(applicationSchema), shopApplicationController.update);
shopApplicationRoutes.post('/resubmit', shopApplicationController.resubmit);
