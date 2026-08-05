import type { Request, Response } from 'express';
import { adminService } from '../services/adminService.js';

const number = (value: unknown, fallback: number) => typeof value === 'string' ? Number(value) || fallback : fallback;

export const adminController = {
  dashboard: async (_req: Request, res: Response) => res.json(await adminService.dashboard()),
  applications: async (req: Request, res: Response) => res.json(await adminService.listApplications({ page: number(req.query.page, 1), pageSize: number(req.query.pageSize, 20), search: req.query.search as string | undefined, status: req.query.status as never, sort: req.query.sort as never })),
  application: async (req: Request, res: Response) => res.json(await adminService.getApplication(req.params.shopId as string)),
  action: async (req: Request, res: Response) => res.json(await adminService.review(req.user!.id, req.params.shopId as string, req.body)),
  shops: async (req: Request, res: Response) => res.json(await adminService.listShops({ page: number(req.query.page, 1), pageSize: number(req.query.pageSize, 20), search: req.query.search as string | undefined, status: req.query.status as never, sort: req.query.sort as never })),
  users: async (req: Request, res: Response) => res.json(await adminService.listUsers({ page: number(req.query.page, 1), pageSize: number(req.query.pageSize, 20), search: req.query.search as string | undefined })),
  auditLogs: async (req: Request, res: Response) => res.json(await adminService.auditLogs({ page: number(req.query.page, 1), pageSize: number(req.query.pageSize, 20), action: req.query.action as string | undefined })),
};
