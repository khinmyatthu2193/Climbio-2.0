import type { Request, Response } from 'express';
import { reportService } from '../services/reportService.js';

export const dashboardController = {
  summary: async (req: Request, res: Response) =>
    res.json(await reportService.dashboardSummary(req.user!.id)),
};
