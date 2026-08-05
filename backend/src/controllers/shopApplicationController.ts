import type { Request, Response } from 'express';
import { shopApplicationService } from '../services/shopApplicationService.js';

export const shopApplicationController = {
  get: async (req: Request, res: Response) => res.json(await shopApplicationService.get(req.user!.id)),
  update: async (req: Request, res: Response) => res.json(await shopApplicationService.update(req.user!.id, req.body)),
  resubmit: async (req: Request, res: Response) => res.json(await shopApplicationService.resubmit(req.user!.id)),
};
