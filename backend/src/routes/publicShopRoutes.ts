import { Router } from 'express';
import { z } from 'zod';
import { publicShopController } from '../controllers/publicShopController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireApprovedShop } from '../middleware/approval.js';
import { validateBody, validateParams } from '../middleware/validate.js';

const slugParams = z.object({
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}).strict();
const statusSchema = z.object({ publicEnabled: z.boolean() }).strict();
const socialUrl = (hosts: string[], message: string, pathPattern?: RegExp) => z.string().trim().max(500).url(message).refine((value) => {
  try {
    const url = new URL(value);
    return hosts.includes(url.hostname.toLowerCase().replace(/^www\./, '')) && (!pathPattern || pathPattern.test(url.pathname));
  } catch { return false; }
}, message).nullable().optional();
const phoneContact = z.string().trim().max(30).regex(/^\+?[0-9\s()-]+$/, 'Please enter a valid business phone number.').refine((value) => value.replace(/\D/g, '').length >= 7, 'Please enter a valid business phone number.').nullable().optional();
const telegramContact = z.string().trim().max(500).refine((value) => /^@[a-zA-Z0-9_]{5,32}$/.test(value) || /^https:\/\/(?:t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32}\/?$/.test(value), 'Telegram username or link is invalid.').nullable().optional();
const viberContact = z.string().trim().max(500).refine((value) => /^\+?[0-9]{7,15}$/.test(value) || /^viber:\/\/(?:chat|add)\?/.test(value), 'Enter a Viber phone number or deep link').nullable().optional();
const storeSchema = z.object({
  shopName: z.string().trim().min(2).max(100),
  phone: phoneContact,
  businessPhone: phoneContact,
  businessEmail: z.string().trim().email('Please enter a valid business email address.').max(255).nullable().optional(),
  facebookPageUrl: socialUrl(['facebook.com'], 'Facebook Page URL is invalid. Please enter a valid Facebook page link.', /^\/.+/),
  messengerUrl: socialUrl(['m.me', 'messenger.com'], 'Messenger URL is invalid. Please use a valid Messenger link.', /^\/.+/),
  viberContact,
  telegramContact,
  tiktokProfileUrl: socialUrl(['tiktok.com'], 'TikTok URL is invalid. Please enter a valid TikTok profile URL.', /^\/@[A-Za-z0-9._-]+\/?$/),
  shopAddress: z.string().trim().max(500).nullable().optional(),
}).strict();

export const publicShopRoutes = Router();
publicShopRoutes.get('/my-store', requireAuth, requireApprovedShop, publicShopController.getMyStore);
publicShopRoutes.put('/my-store/status', requireAuth, requireApprovedShop, validateBody(statusSchema), publicShopController.updateStatus);
publicShopRoutes.put('/my-store', requireAuth, requireApprovedShop, validateBody(storeSchema), publicShopController.updateMyStore);
publicShopRoutes.get('/:slug', validateParams(slugParams), publicShopController.get);
