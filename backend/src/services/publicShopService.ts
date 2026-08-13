import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { createUniqueShopSlug, slugifyShopName } from '../utils/shopSlug.js';

const publicStoreWhere = { publicEnabled: true, approvalStatus: 'APPROVED' as const, accountStatus: 'ACTIVE' as const };
const publicFrontendUrl = env.FRONTEND_URL.split(',')[0]!.trim().replace(/\/$/, '');

export const publicShopService = {
  async getBySlug(slug: string) {
    let shop = await prisma.user.findFirst({
      where: { slug, ...publicStoreWhere },
      select: {
        publicEnabled: true,
        slug: true,
        shopName: true,
        shopLogo: true,
        shopAddress: true,
        phone: true,
        businessPhone: true, businessEmail: true, facebookPageUrl: true, messengerUrl: true,
        viberContact: true, telegramContact: true, tiktokProfileUrl: true,
        setting: { select: { currency: true, shopPrimaryColor: true } },
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            price: true,
            quantity: true,
            category: { select: { id: true, name: true } },
          },
          orderBy: [{ quantity: 'desc' }, { name: 'asc' }],
        },
      },
    });
    if (!shop) {
      const historical = await prisma.shopSlugHistory.findUnique({
        where: { slug },
        select: { shop: { select: {
          publicEnabled: true, slug: true, shopName: true, shopLogo: true, shopAddress: true, phone: true,
          businessPhone: true, businessEmail: true, facebookPageUrl: true, messengerUrl: true,
          viberContact: true, telegramContact: true, tiktokProfileUrl: true,
          setting: { select: { currency: true, shopPrimaryColor: true } },
          products: { where: { isActive: true }, select: { id: true, name: true, description: true, image: true, price: true, quantity: true, category: { select: { id: true, name: true } } }, orderBy: [{ quantity: 'desc' }, { name: 'asc' }] },
          accountStatus: true, approvalStatus: true,
        } } },
      });
      if (historical?.shop.publicEnabled && historical.shop.accountStatus === 'ACTIVE' && historical.shop.approvalStatus === 'APPROVED') shop = historical.shop;
    }
    if (!shop || !shop.publicEnabled) throw new AppError('Shop not found', 404);

    const { products, setting, publicEnabled: _publicEnabled, ...shopInfo } = shop;
    const categories = Array.from(
      new Map(products.flatMap((product) => product.category ? [[product.category.id, product.category]] : [])).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));

    return {
      shop: { ...shopInfo, currency: setting?.currency ?? 'MMK', primaryColor: setting?.shopPrimaryColor ?? '#7c3aed' },
      canonicalSlug: shop.slug,
      categories,
      products,
    };
  },

  async getMyStore(userId: string) {
    let store = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        slug: true,
        publicEnabled: true,
        createdAt: true,
        shopName: true,
        shopLogo: true,
        shopAddress: true,
        phone: true,
        businessPhone: true, businessEmail: true, facebookPageUrl: true, messengerUrl: true,
        viberContact: true, telegramContact: true, tiktokProfileUrl: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    if (!store) throw new AppError('Shop not found', 404);

    const nameSlug = slugifyShopName(store.shopName);
    if (/^shop(?:-[a-f0-9]{10}|-\d+)?$/.test(store.slug) && nameSlug !== 'shop') {
      const currentSlug = store.slug;
      const shopName = store.shopName;
      const slug = await prisma.$transaction(async (tx) => {
        const nextSlug = await createUniqueShopSlug(tx, shopName, userId);
        if (nextSlug === currentSlug) return nextSlug;
        await tx.shopSlugHistory.upsert({
          where: { slug: currentSlug },
          create: { shopId: userId, slug: currentSlug },
          update: { shopId: userId },
        });
        await tx.user.update({ where: { id: userId }, data: { slug: nextSlug } });
        return nextSlug;
      });
      store = { ...store, slug };
    }

    const { _count, ...shopInfo } = store;
    return {
      slug: store.slug,
      publicUrl: `${publicFrontendUrl}/shop/${store.slug}`,
      publicEnabled: store.publicEnabled,
      productCount: _count.products,
      shopInfo: {
        shopName: shopInfo.shopName,
        shopLogo: shopInfo.shopLogo,
        shopAddress: shopInfo.shopAddress,
        phone: shopInfo.phone,
        businessPhone: shopInfo.businessPhone,
        businessEmail: shopInfo.businessEmail,
        facebookPageUrl: shopInfo.facebookPageUrl,
        messengerUrl: shopInfo.messengerUrl,
        viberContact: shopInfo.viberContact,
        telegramContact: shopInfo.telegramContact,
        tiktokProfileUrl: shopInfo.tiktokProfileUrl,
        createdAt: shopInfo.createdAt,
      },
    };
  },

  async updateStatus(userId: string, publicEnabled: boolean) {
    await prisma.user.update({ where: { id: userId }, data: { publicEnabled } });
    return this.getMyStore(userId);
  },

  async updateMyStore(userId: string, input: {
    shopName: string;
    phone?: string | null;
    businessPhone?: string | null; businessEmail?: string | null; facebookPageUrl?: string | null;
    messengerUrl?: string | null; viberContact?: string | null; telegramContact?: string | null; tiktokProfileUrl?: string | null;
    shopAddress?: string | null;
  }) {
    await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({ where: { id: userId }, select: { slug: true } });
      if (!current) throw new AppError('Shop not found', 404);
      const slug = await createUniqueShopSlug(tx, input.shopName, userId);
      if (current.slug !== slug) {
        await tx.shopSlugHistory.deleteMany({ where: { shopId: userId, slug } });
        await tx.shopSlugHistory.upsert({ where: { slug: current.slug }, create: { shopId: userId, slug: current.slug }, update: { shopId: userId } });
      }
      await tx.user.update({ where: { id: userId }, data: {
        slug,
        shopName: input.shopName,
        phone: input.phone,
        businessPhone: input.businessPhone,
        businessEmail: input.businessEmail,
        facebookPageUrl: input.facebookPageUrl,
        messengerUrl: input.messengerUrl,
        viberContact: input.viberContact,
        telegramContact: input.telegramContact,
        tiktokProfileUrl: input.tiktokProfileUrl,
        shopAddress: input.shopAddress,
        setting: {
          upsert: {
            create: { companyName: input.shopName },
            update: { companyName: input.shopName },
          },
        },
      } });
    });
    return this.getMyStore(userId);
  },
};
