import type { Request, Response } from 'express';
import { categoryService } from '../services/categoryService.js';

export const categoryController = {
  list: async (req: Request, res: Response) => res.json(await categoryService.list(req.user!.id)),

  create: async (req: Request, res: Response) =>
    res.status(201).json(await categoryService.create(req.user!.id, req.body.name)),

  remove: async (req: Request, res: Response) => {
    await categoryService.remove(req.user!.id, req.params.id as string);
    res.status(204).send();
  },
};
