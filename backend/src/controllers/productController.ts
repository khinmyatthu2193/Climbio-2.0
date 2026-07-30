import type { Request, Response } from 'express';
import { productImageService } from '../services/productImageService.js';
import { productService } from '../services/productService.js';

export const productController = {
  list: async (req: Request, res: Response) => res.json(await productService.list(req.user!.id)),

  get: async (req: Request, res: Response) =>
    res.json(await productService.get(req.user!.id, req.params.id as string)),

  create: async (req: Request, res: Response) => {
    const image = req.file ? await productImageService.upload(req.user!.id, req.file) : undefined;
    res.status(201).json(await productService.create(req.user!.id, req.body, image));
  },

  update: async (req: Request, res: Response) => {
    const image = req.file ? await productImageService.upload(req.user!.id, req.file) : undefined;
    res.json(await productService.update(req.user!.id, req.params.id as string, req.body, image));
  },

  remove: async (req: Request, res: Response) => {
    await productService.remove(req.user!.id, req.params.id as string);
    res.status(204).send();
  },
};
