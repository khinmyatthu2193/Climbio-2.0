import type { Request, Response } from 'express';
import type { InvoiceStatus } from '@prisma/client';
import { invoiceService } from '../services/invoiceService.js';

export const invoiceController = {
  list: async (req: Request, res: Response) => res.json(await invoiceService.list(req.user!.id)),

  get: async (req: Request, res: Response) =>
    res.json(await invoiceService.get(req.user!.id, req.params.id as string)),

  create: async (req: Request, res: Response) =>
    res.status(201).json(await invoiceService.create(req.user!.id, req.body)),

  updateStatus: async (req: Request, res: Response) =>
    res.json(await invoiceService.updateStatus(
      req.user!.id,
      req.params.id as string,
      req.body.status as InvoiceStatus,
    )),

  remove: async (req: Request, res: Response) => {
    await invoiceService.remove(req.user!.id, req.params.id as string);
    res.status(204).send();
  },
};
