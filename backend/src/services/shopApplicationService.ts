import { prisma } from '../config/prisma.js';
import { approvalNotificationService } from './approvalNotificationService.js';
import { AppError } from '../utils/AppError.js';
import { createUniqueShopSlug } from '../utils/shopSlug.js';

const shopSelect = {
  id: true, email: true, name: true, shopName: true, phone: true, shopLogo: true, shopAddress: true,
  businessCategory: true, businessDescription: true, businessPhone: true, businessEmail: true, cityTownship: true,
  ownerRole: true, businessRegistrationNumber: true, verificationDocument: true, websiteUrl: true,
  accountStatus: true, approvalStatus: true, submittedAt: true, approvedAt: true, suspendedAt: true, applicationVersion: true,
} as const;

type ApplicationUpdate = {
  name: string; shopName: string; businessCategory: string; businessDescription: string; businessPhone: string;
  businessEmail?: string; shopAddress: string; cityTownship: string; ownerRole: string;
  businessRegistrationNumber?: string; websiteUrl?: string; shopLogo?: string; verificationDocument?: string;
};

export const shopApplicationService = {
  async get(userId: string) {
    const shop = await prisma.user.findUnique({
      where: { id: userId }, select: {
        ...shopSelect,
        reviewsReceived: {
          select: { id: true, action: true, previousStatus: true, nextStatus: true, feedback: true, version: true, createdAt: true, admin: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!shop) throw new AppError('Application not found', 404);
    return shop;
  },

  async create(userId: string, input: ApplicationUpdate & { shopLogo: string; verificationDocument: string }) {
    const submittedAt = new Date();
    return prisma.$transaction(async (tx) => {
      const slug = await createUniqueShopSlug(tx, input.shopName, userId);
      const result = await tx.user.updateMany({
        where: { id: userId, role: 'SHOP_OWNER', submittedAt: null },
        data: {
          ...input,
          slug,
          businessEmail: input.businessEmail || null,
          businessRegistrationNumber: input.businessRegistrationNumber || null,
          websiteUrl: input.websiteUrl || null,
          approvalStatus: 'PENDING',
          submittedAt,
          publicEnabled: false,
        },
      });
      if (result.count !== 1) throw new AppError('A shop application has already been submitted for this account', 409);
      await tx.setting.upsert({
        where: { userId },
        create: { userId, companyName: input.shopName, companyLogo: input.shopLogo },
        update: { companyName: input.shopName, companyLogo: input.shopLogo },
      });
      return tx.user.findUniqueOrThrow({ where: { id: userId }, select: shopSelect });
    });
  },

  async update(userId: string, input: ApplicationUpdate) {
    const found = await prisma.user.findUnique({ where: { id: userId }, select: { approvalStatus: true } });
    if (!found) throw new AppError('Application not found', 404);
    if (found.approvalStatus !== 'CHANGES_REQUESTED') throw new AppError('Only applications with requested changes can be edited', 403);
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...input,
        businessEmail: input.businessEmail || null,
        businessRegistrationNumber: input.businessRegistrationNumber || null,
        websiteUrl: input.websiteUrl || null,
      },
      select: shopSelect,
    });
  },

  async resubmit(userId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const shop = await tx.user.findUnique({ where: { id: userId }, select: { approvalStatus: true, applicationVersion: true } });
      if (!shop) throw new AppError('Application not found', 404);
      if (shop.approvalStatus !== 'CHANGES_REQUESTED') throw new AppError('Only applications with requested changes can be resubmitted', 409);
      const version = shop.applicationVersion + 1;
      const updated = await tx.user.update({
        where: { id: userId },
        data: { approvalStatus: 'PENDING', submittedAt: new Date(), applicationVersion: version, publicEnabled: false },
        select: shopSelect,
      });
      await tx.shopReview.create({ data: { shopId: userId, action: 'RESUBMITTED', previousStatus: 'CHANGES_REQUESTED', nextStatus: 'PENDING', version } });
      return updated;
    });
    void approvalNotificationService.notify({ shopId: userId, action: 'RESUBMITTED' });
    return result;
  },
};
