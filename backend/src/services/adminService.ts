import type { Prisma, ShopApprovalStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { approvalNotificationService } from './approvalNotificationService.js';
import { AppError } from '../utils/AppError.js';

type PageInput = { page: number; pageSize: number; search?: string; status?: ShopApprovalStatus; sort?: 'submittedAt' | 'shopName' | 'createdAt' };
type ReviewAction = 'APPROVE' | 'REQUEST_CHANGES' | 'DECLINE' | 'SUSPEND' | 'REACTIVATE' | 'GENERAL_FEEDBACK' | 'REOPEN';

const safeShop = {
  id: true, email: true, name: true, shopName: true, phone: true, shopLogo: true, shopAddress: true,
  role: true, accountStatus: true, approvalStatus: true, submittedAt: true, approvedAt: true, suspendedAt: true, applicationVersion: true, createdAt: true,
} satisfies Prisma.UserSelect;

function page(input: Partial<PageInput>) {
  return { page: Math.max(1, input.page ?? 1), pageSize: Math.min(100, Math.max(1, input.pageSize ?? 20)) };
}

function searchWhere(search?: string): Prisma.UserWhereInput {
  if (!search?.trim()) return {};
  const contains = search.trim();
  return { OR: [{ shopName: { contains, mode: 'insensitive' } }, { name: { contains, mode: 'insensitive' } }, { email: { contains, mode: 'insensitive' } }] };
}

async function getApplication(shopId: string) {
  const item = await prisma.user.findFirst({
    where: { id: shopId, role: 'SHOP_OWNER' },
    select: { ...safeShop, reviewsReceived: { select: { id: true, action: true, previousStatus: true, nextStatus: true, feedback: true, version: true, createdAt: true, admin: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } } },
  });
  if (!item) throw new AppError('Application not found', 404);
  return item;
}

export const adminService = {
  async dashboard() {
    const shopWhere: Prisma.UserWhereInput = { role: 'SHOP_OWNER' };
    const [pending, approved, changesRequested, declined, suspended, recentApplications, recentActivity] = await Promise.all([
      prisma.user.count({ where: { ...shopWhere, approvalStatus: 'PENDING' } }),
      prisma.user.count({ where: { ...shopWhere, approvalStatus: 'APPROVED' } }),
      prisma.user.count({ where: { ...shopWhere, approvalStatus: 'CHANGES_REQUESTED' } }),
      prisma.user.count({ where: { ...shopWhere, approvalStatus: 'DECLINED' } }),
      prisma.user.count({ where: { ...shopWhere, approvalStatus: 'SUSPENDED' } }),
      prisma.user.findMany({ where: shopWhere, select: safeShop, orderBy: { submittedAt: 'desc' }, take: 8 }),
      prisma.shopReview.findMany({ select: { id: true, action: true, feedback: true, createdAt: true, shop: { select: { id: true, shopName: true } }, admin: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);
    return { counts: { pending, approved, changesRequested, declined, suspended }, recentApplications, recentActivity };
  },

  async listApplications(input: PageInput) {
    const paging = page(input);
    const where: Prisma.UserWhereInput = { role: 'SHOP_OWNER', ...(input.status ? { approvalStatus: input.status } : {}), ...searchWhere(input.search) };
    const orderBy = input.sort === 'shopName' ? { shopName: 'asc' as const } : { submittedAt: 'desc' as const };
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, select: safeShop, orderBy, skip: (paging.page - 1) * paging.pageSize, take: paging.pageSize }),
      prisma.user.count({ where }),
    ]);
    return { items, total, ...paging };
  },

  getApplication,

  async review(adminId: string, shopId: string, input: { action: ReviewAction; feedback?: string; reopenTo?: 'PENDING' | 'CHANGES_REQUESTED' }) {
    const feedback = input.feedback?.trim() || undefined;
    const result = await prisma.$transaction(async (tx) => {
      const shop = await tx.user.findFirst({ where: { id: shopId, role: 'SHOP_OWNER' }, select: { approvalStatus: true, applicationVersion: true } });
      if (!shop) throw new AppError('Application not found', 404);
      const previousStatus = shop.approvalStatus;
      let nextStatus: ShopApprovalStatus | undefined;
      let action: 'APPROVED' | 'CHANGES_REQUESTED' | 'DECLINED' | 'SUSPENDED' | 'REACTIVATED' | 'GENERAL_FEEDBACK' | 'REOPENED';
      let accountStatus: 'ACTIVE' | 'SUSPENDED' | undefined;
      const now = new Date();

      if (input.action === 'APPROVE' && ['PENDING', 'CHANGES_REQUESTED'].includes(previousStatus)) { nextStatus = 'APPROVED'; action = 'APPROVED'; accountStatus = 'ACTIVE'; }
      else if (input.action === 'REQUEST_CHANGES' && ['PENDING', 'CHANGES_REQUESTED'].includes(previousStatus)) { nextStatus = 'CHANGES_REQUESTED'; action = 'CHANGES_REQUESTED'; }
      else if (input.action === 'DECLINE' && ['PENDING', 'CHANGES_REQUESTED'].includes(previousStatus)) { nextStatus = 'DECLINED'; action = 'DECLINED'; }
      else if (input.action === 'SUSPEND' && previousStatus === 'APPROVED') { nextStatus = 'SUSPENDED'; action = 'SUSPENDED'; accountStatus = 'SUSPENDED'; }
      else if (input.action === 'REACTIVATE' && previousStatus === 'SUSPENDED') { nextStatus = 'APPROVED'; action = 'REACTIVATED'; accountStatus = 'ACTIVE'; }
      else if (input.action === 'GENERAL_FEEDBACK') { action = 'GENERAL_FEEDBACK'; }
      else if (input.action === 'REOPEN' && previousStatus === 'DECLINED' && input.reopenTo) { nextStatus = input.reopenTo; action = 'REOPENED'; }
      else throw new AppError('This action is not valid for the current application status', 409);

      if (['DECLINE', 'REQUEST_CHANGES', 'GENERAL_FEEDBACK'].includes(input.action) && !feedback) throw new AppError('Feedback is required for this action', 422);
      if (input.action === 'REOPEN' && input.reopenTo === 'CHANGES_REQUESTED' && !feedback) throw new AppError('Feedback is required when reopening for changes', 422);

      if (nextStatus) {
        await tx.user.update({ where: { id: shopId }, data: {
          approvalStatus: nextStatus,
          ...(accountStatus ? { accountStatus } : {}),
          ...(nextStatus === 'APPROVED' ? { approvedAt: now, suspendedAt: null } : {}),
          ...(nextStatus === 'SUSPENDED' ? { suspendedAt: now, publicEnabled: false } : {}),
        } });
        if (nextStatus === 'SUSPENDED') await tx.refreshToken.updateMany({ where: { userId: shopId, revokedAt: null }, data: { revokedAt: now } });
      }
      await tx.shopReview.create({ data: { shopId, adminId, action, previousStatus, nextStatus: nextStatus ?? previousStatus, feedback, version: shop.applicationVersion } });
      return shopId;
    });
    void approvalNotificationService.notify({ shopId, action: input.action });
    return getApplication(result);
  },

  async listShops(input: PageInput) { return this.listApplications(input); },

  async listUsers(input: PageInput) {
    const paging = page(input);
    const where: Prisma.UserWhereInput = searchWhere(input.search);
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, select: safeShop, orderBy: { createdAt: 'desc' }, skip: (paging.page - 1) * paging.pageSize, take: paging.pageSize }),
      prisma.user.count({ where }),
    ]);
    return { items, total, ...paging };
  },

  async auditLogs(input: { page?: number; pageSize?: number; search?: string; action?: string }) {
    const paging = page(input);
    const where: Prisma.ShopReviewWhereInput = { ...(input.action ? { action: input.action as never } : {}) };
    const [items, total] = await Promise.all([
      prisma.shopReview.findMany({ where, select: { id: true, action: true, previousStatus: true, nextStatus: true, feedback: true, createdAt: true, shop: { select: { id: true, shopName: true, email: true } }, admin: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip: (paging.page - 1) * paging.pageSize, take: paging.pageSize }),
      prisma.shopReview.count({ where }),
    ]);
    return { items, total, ...paging };
  },
};
