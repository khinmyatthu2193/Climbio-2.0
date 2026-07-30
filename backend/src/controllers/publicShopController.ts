import type { Request, Response } from 'express';
import { publicShopService } from '../services/publicShopService.js';

export const publicShopController = {
  get: async (req: Request, res: Response) =>
    res.json(await publicShopService.getBySlug(req.params.slug as string)),
};
