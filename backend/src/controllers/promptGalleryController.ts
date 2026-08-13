import type { Request, Response } from 'express';
import { promptGalleryService } from '../services/promptGalleryService.js';
import { storageService } from '../services/storageService.js';
import { AppError } from '../utils/AppError.js';

export const promptGalleryController = {
  list: async (req: Request, res: Response) => res.json(await promptGalleryService.listPublished(req.query.search as string | undefined, req.query.categoryId as string | undefined, req.query.aiTool as string | undefined)),
  detail: async (req: Request, res: Response) => res.json(await promptGalleryService.publishedById(req.params.id as string)),
  categories: async (_req: Request, res: Response) => res.json(await promptGalleryService.listActiveCategories()),
  tools: async (_req: Request, res: Response) => res.json(await promptGalleryService.tools()),
  adminList: async (_req: Request, res: Response) => res.json(await promptGalleryService.adminList()),
  adminCategories: async (_req: Request, res: Response) => res.json(await promptGalleryService.adminCategories()),
  create: async (req: Request, res: Response) => res.status(201).json(await promptGalleryService.createPrompt(req.body)),
  update: async (req: Request, res: Response) => res.json(await promptGalleryService.updatePrompt(req.params.id as string, req.body)),
  remove: async (req: Request, res: Response) => { await promptGalleryService.deletePrompt(req.params.id as string); res.status(204).send(); },
  createCategory: async (req: Request, res: Response) => res.status(201).json(await promptGalleryService.createCategory(req.body)),
  updateCategory: async (req: Request, res: Response) => res.json(await promptGalleryService.updateCategory(req.params.id as string, req.body)),
  removeCategory: async (req: Request, res: Response) => { await promptGalleryService.deleteCategory(req.params.id as string); res.status(204).send(); },
  uploadImage: async (req: Request, res: Response) => {
    if (!req.file) throw new AppError('Choose an image to upload', 422);
    res.status(201).json({ imageUrl: await storageService.uploadPromptImage(req.user!.id, req.file) });
  },
};
