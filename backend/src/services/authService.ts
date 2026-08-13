import bcrypt from 'bcryptjs';
import { Prisma, type Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../utils/tokens.js';
import { createUniqueShopSlug } from '../utils/shopSlug.js';

const publicUser = {
  id: true,
  email: true,
  name: true,
  shopName: true,
  shopLogo: true,
  shopAddress: true,
  phone: true,
  role: true,
  accountStatus: true,
  approvalStatus: true,
  submittedAt: true,
  approvedAt: true,
  setting: {
    select: { currency: true, invoiceFooter: true, companyName: true, companyLogo: true, theme: true },
  },
} satisfies Prisma.UserSelect;

const refreshExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

async function issueSession(user: { id: string; email: string; role: Role }) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: refreshExpiry() },
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: { email: string; password: string; confirmPassword: string; name: string; phone: string; termsAccepted: true }) {
    const email = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new AppError('An account with this email already exists', 409);
    const password = await bcrypt.hash(input.password, 12);
    const slug = await createUniqueShopSlug(prisma, input.name);
    const user = await prisma.user.create({
      data: { email, password, name: input.name, phone: input.phone, shopName: input.name, slug, role: 'SHOP_OWNER', accountStatus: 'ACTIVE', approvalStatus: 'PENDING', submittedAt: null, publicEnabled: false, setting: { create: {} } },
      select: publicUser,
    });
    return { user, ...await issueSession(user) };
  },

  async login(input: { email: string; password: string }) {
    const found = await prisma.user.findUnique({ where: { email: input.email.trim().toLowerCase() } });
    if (!found || !(await bcrypt.compare(input.password, found.password))) {
      throw new AppError('Invalid email or password', 401);
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: found.id }, select: publicUser });
    return { user, ...await issueSession(user) };
  },

  async refresh(rawToken: string) {
    let payload;
    try { payload = verifyRefreshToken(rawToken); } catch { throw new AppError('Invalid refresh token', 401); }
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(rawToken) } });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || stored.userId !== payload.sub) {
      throw new AppError('Refresh token is expired or revoked', 401);
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: publicUser });
    if (!user) throw new AppError('User not found', 401);
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return { user, ...await issueSession(user) };
  },

  async logout(rawToken?: string) {
    if (!rawToken) return;
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  getUser(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicUser });
  },

  async updateProfile(id: string, input: {
    name: string;
    shopName: string;
    phone?: string | null;
    shopAddress?: string | null;
    currency: 'MMK' | 'USD' | 'THB';
    invoiceFooter?: string | null;
  }) {
    const { currency, invoiceFooter, ...profile } = input;
    return prisma.user.update({
      where: { id },
      data: {
        ...profile,
        setting: {
          upsert: {
            create: { currency, invoiceFooter, companyName: profile.shopName },
            update: { currency, invoiceFooter, companyName: profile.shopName },
          },
        },
      },
      select: publicUser,
    });
  },

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: { password: true } });
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new AppError('Current password is incorrect', 400);
    }
    const password = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { password } }),
      prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  },

  async updateLogo(id: string, logoUrl: string) {
    return prisma.user.update({
      where: { id },
      data: {
        shopLogo: logoUrl,
        setting: {
          upsert: {
            create: { companyLogo: logoUrl },
            update: { companyLogo: logoUrl },
          },
        },
      },
      select: publicUser,
    });
  },
};
