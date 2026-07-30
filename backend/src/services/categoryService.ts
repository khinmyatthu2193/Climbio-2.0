import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export const categoryService = {
  list(userId: string) {
    return prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  },

  create(userId: string, name: string) {
    return prisma.category.create({ data: { userId, name } });
  },

  async remove(userId: string, id: string) {
    const result = await prisma.category.deleteMany({ where: { id, userId } });
    if (!result.count) throw new AppError('Category not found', 404);
  },
};
