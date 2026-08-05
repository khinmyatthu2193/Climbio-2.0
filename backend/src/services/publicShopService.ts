import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const publicShopService = {
  async getBySlug(slug: string) {
    const shop = await prisma.user.findFirst({
      where: { slug, publicEnabled: true, approvalStatus: 'APPROVED', accountStatus: 'ACTIVE' },
      select: {
        publicEnabled: true,
        slug: true,
        shopName: true,
        shopLogo: true,
        shopAddress: true,
        phone: true,
        setting: { select: { currency: true } },
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
    if (!shop || !shop.publicEnabled) throw new AppError('Shop not found', 404);

    const { products, setting, publicEnabled: _publicEnabled, ...shopInfo } = shop;
    const categories = Array.from(
      new Map(products.flatMap((product) => product.category ? [[product.category.id, product.category]] : [])).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));

    return {
      shop: { ...shopInfo, currency: setting?.currency ?? 'MMK' },
      categories,
      products,
    };
  },

  async getMyStore(userId: string) {
    const store = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        slug: true,
        publicEnabled: true,
        createdAt: true,
        shopName: true,
        shopLogo: true,
        shopAddress: true,
        phone: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    if (!store) throw new AppError('Shop not found', 404);

    const { _count, ...shopInfo } = store;
    return {
      slug: store.slug,
      publicUrl: `${env.FRONTEND_URL.replace(/\/$/, '')}/shop/${store.slug}`,
      publicEnabled: store.publicEnabled,
      productCount: _count.products,
      shopInfo: {
        shopName: shopInfo.shopName,
        shopLogo: shopInfo.shopLogo,
        shopAddress: shopInfo.shopAddress,
        phone: shopInfo.phone,
        createdAt: shopInfo.createdAt,
      },
    };
  },

  async updateStatus(userId: string, publicEnabled: boolean) {
    await prisma.user.update({ where: { id: userId }, data: { publicEnabled } });
    return this.getMyStore(userId);
  },

  async updateMyStore(userId: string, input: {
    slug: string;
    shopName: string;
    phone?: string | null;
    shopAddress?: string | null;
  }) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        slug: input.slug,
        shopName: input.shopName,
        phone: input.phone,
        shopAddress: input.shopAddress,
        setting: {
          upsert: {
            create: { companyName: input.shopName },
            update: { companyName: input.shopName },
          },
        },
      },
    });
    return this.getMyStore(userId);
  },
};
