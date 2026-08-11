import type { Request, Response } from 'express';
import { shopApplicationService } from '../services/shopApplicationService.js';
import { storageService } from '../services/storageService.js';
import { AppError } from '../utils/AppError.js';

export const shopApplicationController = {
  get: async (req: Request, res: Response) => res.json(await shopApplicationService.get(req.user!.id)),
  create: async (req: Request, res: Response) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const logo = files?.shopLogo?.[0];
    const proof = files?.verificationDocument?.[0];
    if (!logo) throw new AppError('A shop logo is required', 422);
    if (!proof) throw new AppError('A business proof or verification document is required', 422);
    const [shopLogo, verificationDocument] = await Promise.all([
      storageService.uploadLogo(req.user!.id, logo),
      storageService.uploadVerificationDocument(req.user!.id, proof),
    ]);
    res.status(201).json(await shopApplicationService.create(req.user!.id, { ...req.body, shopLogo, verificationDocument }));
  },
  update: async (req: Request, res: Response) => res.json(await shopApplicationService.update(req.user!.id, req.body)),
  resubmit: async (req: Request, res: Response) => res.json(await shopApplicationService.resubmit(req.user!.id)),
};
