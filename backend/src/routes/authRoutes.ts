import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { logoUpload } from '../middleware/upload.js';

const password = z.string().min(8).max(72).regex(/[a-z]/, 'Must contain lowercase').regex(/[A-Z]/, 'Must contain uppercase').regex(/\d/, 'Must contain a number');
const registerSchema = z.object({
  email: z.string().email().max(255),
  password,
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(30),
  confirmPassword: z.string().min(1).max(72),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms and Privacy Policy' }) }),
}).strict().refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(72) }).strict();
const nullableText = (max: number) => z.string().trim().max(max).nullable().optional();
const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  shopName: z.string().trim().min(2).max(100),
  phone: nullableText(30),
  shopAddress: nullableText(500),
  currency: z.enum(['MMK', 'USD', 'THB']),
  invoiceFooter: nullableText(500),
}).strict();
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: password,
}).strict().refine((value) => value.currentPassword !== value.newPassword, {
  message: 'New password must be different',
  path: ['newPassword'],
});

export const authRoutes = Router();
authRoutes.post('/register', validateBody(registerSchema), authController.register);
authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.post('/refresh', authController.refresh);
authRoutes.post('/refresh-token', authController.refresh);
authRoutes.post('/logout', authController.logout);
authRoutes.get('/me', requireAuth, authController.me);
authRoutes.put('/profile', requireAuth, validateBody(profileSchema), authController.updateProfile);
authRoutes.put('/change-password', requireAuth, validateBody(changePasswordSchema), authController.changePassword);
authRoutes.post('/upload-logo', requireAuth, logoUpload.single('logo'), authController.uploadLogo);
