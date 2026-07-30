import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export const publicShopService = {
  async getBySlug(slug: string) {
    const shop = await prisma.user.findUnique({
      where: { slug },
      select: {
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
    if (!shop) throw new AppError('Shop not found', 404);

    const { products, setting, ...shopInfo } = shop;
    const categories = Array.from(
      new Map(products.flatMap((product) => product.category ? [[product.category.id, product.category]] : [])).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));

    return {
      shop: { ...shopInfo, currency: setting?.currency ?? 'MMK' },
      categories,
      products,
    };
  },
};
