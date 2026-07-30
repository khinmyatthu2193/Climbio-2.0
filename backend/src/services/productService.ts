import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  costPrice: number;
  quantity: number;
  categoryId?: string | null;
}

const includeCategory = { category: { select: { id: true, name: true } } } as const;

async function ensureOwnedCategory(userId: string, categoryId?: string | null) {
  if (!categoryId) return;
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId }, select: { id: true } });
  if (!category) throw new AppError('Category not found', 404);
}

export const productService = {
  list(userId: string) {
    return prisma.product.findMany({
      where: { userId },
      include: includeCategory,
      orderBy: { createdAt: 'desc' },
    });
  },

  async get(userId: string, id: string) {
    const product = await prisma.product.findFirst({ where: { id, userId }, include: includeCategory });
    if (!product) throw new AppError('Product not found', 404);
    return product;
  },

  async create(userId: string, input: ProductInput, image?: string) {
    await ensureOwnedCategory(userId, input.categoryId);
    return prisma.product.create({
      data: { ...input, userId, image },
      include: includeCategory,
    });
  },

  async update(userId: string, id: string, input: ProductInput, image?: string) {
    await this.get(userId, id);
    await ensureOwnedCategory(userId, input.categoryId);
    return prisma.product.update({
      where: { id },
      data: { ...input, ...(image ? { image } : {}) },
      include: includeCategory,
    });
  },

  async remove(userId: string, id: string) {
    const result = await prisma.product.deleteMany({ where: { id, userId } });
    if (!result.count) throw new AppError('Product not found', 404);
  },
};
