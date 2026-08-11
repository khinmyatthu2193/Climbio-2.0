import { Router } from 'express';
import { z } from 'zod';
import { shopApplicationController } from '../controllers/shopApplicationController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { applicationUpload } from '../middleware/upload.js';

const applicationFields = {
  name: z.string().trim().min(2).max(100),
  shopName: z.string().trim().min(2).max(100),
  businessCategory: z.string().trim().min(2).max(100),
  businessDescription: z.string().trim().min(20).max(1000),
  businessPhone: z.string().trim().min(7).max(30).regex(/^\+?[0-9\s()-]+$/).refine((value) => value.replace(/\D/g, '').length >= 7),
  businessEmail: z.union([z.string().trim().email().max(255), z.literal('')]).optional(),
  shopAddress: z.string().trim().min(5).max(300),
  cityTownship: z.string().trim().min(2).max(100),
  ownerRole: z.string().trim().min(2).max(80),
  businessRegistrationNumber: z.string().trim().max(100).optional(),
  websiteUrl: z.union([z.string().trim().url().max(500), z.literal('')]).optional(),
};

const createApplicationSchema = z.object(applicationFields).strict();
const updateApplicationSchema = z.object(applicationFields).strict();

export const shopApplicationRoutes = Router();
shopApplicationRoutes.use(requireAuth);
shopApplicationRoutes.get('/', shopApplicationController.get);
shopApplicationRoutes.post('/', applicationUpload.fields([{ name: 'shopLogo', maxCount: 1 }, { name: 'verificationDocument', maxCount: 1 }]), validateBody(createApplicationSchema), shopApplicationController.create);
shopApplicationRoutes.put('/', applicationUpload.fields([{ name: 'shopLogo', maxCount: 1 }, { name: 'verificationDocument', maxCount: 1 }]), validateBody(updateApplicationSchema), shopApplicationController.update);
shopApplicationRoutes.post('/resubmit', shopApplicationController.resubmit);
