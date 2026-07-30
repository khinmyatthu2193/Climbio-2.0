import type { Request, Response } from 'express';
import { publicShopService } from '../services/publicShopService.js';

export const publicShopController = {
  get: async (req: Request, res: Response) =>
    res.json(await publicShopService.getBySlug(req.params.slug as string)),

  getMyStore: async (req: Request, res: Response) =>
    res.json(await publicShopService.getMyStore(req.user!.id)),

  updateStatus: async (req: Request, res: Response) =>
    res.json(await publicShopService.updateStatus(req.user!.id, req.body.publicEnabled)),

  updateMyStore: async (req: Request, res: Response) =>
    res.json(await publicShopService.updateMyStore(req.user!.id, req.body)),
};
