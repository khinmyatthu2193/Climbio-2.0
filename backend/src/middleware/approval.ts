import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function requireActiveAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError('Authentication required', 401));
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { role: true, accountStatus: true } });
  if (!user || user.role !== 'ADMIN' || user.accountStatus !== 'ACTIVE') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
}

export async function requireApprovedShop(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError('Authentication required', 401));
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { accountStatus: true, approvalStatus: true } });
  if (!user || user.accountStatus !== 'ACTIVE' || user.approvalStatus !== 'APPROVED') {
    return next(new AppError('Your shop must be approved and active before you can use this feature', 403));
  }
  next();
}
