import { Prisma, PromptStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

type PromptInput = { title: string; categoryId: string; content: string; aiTools: string[]; exampleImageUrl?: string | null; status: PromptStatus };
type CategoryInput = { name: string; icon?: string | null; description?: string | null; isActive?: boolean };

const includeCategory = { category: true } as const;

export const promptGalleryService = {
  listPublished(search?: string, categoryId?: string, aiTool?: string) {
    const term = search?.trim();
    const where: Prisma.AIPromptWhereInput = {
      status: 'PUBLISHED', category: { isActive: true },
      ...(categoryId ? { categoryId } : {}),
      ...(aiTool ? { aiTools: { has: aiTool } } : {}),
      ...(term ? { OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
        { category: { name: { contains: term, mode: 'insensitive' } } },
      ] } : {}),
    };
    return prisma.aIPrompt.findMany({ where, include: includeCategory, orderBy: [{ createdAt: 'desc' }, { title: 'asc' }] });
  },
  async publishedById(id: string) {
    const prompt = await prisma.aIPrompt.findFirst({ where: { id, status: 'PUBLISHED', category: { isActive: true } }, include: includeCategory });
    if (!prompt) throw new AppError('Prompt not found', 404);
    return prompt;
  },
  listActiveCategories() { return prisma.promptCategory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }); },
  async tools() {
    const rows = await prisma.aIPrompt.findMany({ where: { status: 'PUBLISHED', category: { isActive: true } }, select: { aiTools: true } });
    return [...new Set(rows.flatMap(({ aiTools }) => aiTools))].sort((a, b) => a.localeCompare(b));
  },
  adminList() { return prisma.aIPrompt.findMany({ include: includeCategory, orderBy: { updatedAt: 'desc' } }); },
  adminCategories() { return prisma.promptCategory.findMany({ include: { _count: { select: { prompts: true } } }, orderBy: { name: 'asc' } }); },
  async createPrompt(data: PromptInput) {
    await ensureCategory(data.categoryId);
    return prisma.aIPrompt.create({ data, include: includeCategory });
  },
  async updatePrompt(id: string, data: Partial<PromptInput>) {
    if (data.categoryId) await ensureCategory(data.categoryId);
    await ensurePrompt(id);
    return prisma.aIPrompt.update({ where: { id }, data, include: includeCategory });
  },
  async deletePrompt(id: string) { await ensurePrompt(id); await prisma.aIPrompt.delete({ where: { id } }); },
  createCategory(data: CategoryInput) { return prisma.promptCategory.create({ data }); },
  async updateCategory(id: string, data: CategoryInput) { await ensureCategory(id); return prisma.promptCategory.update({ where: { id }, data }); },
  async deleteCategory(id: string) {
    await ensureCategory(id);
    const count = await prisma.aIPrompt.count({ where: { categoryId: id } });
    if (count) throw new AppError('Move or delete prompts in this category first', 409);
    await prisma.promptCategory.delete({ where: { id } });
  },
};

async function ensureCategory(id: string) { if (!await prisma.promptCategory.findUnique({ where: { id }, select: { id: true } })) throw new AppError('Prompt category not found', 404); }
async function ensurePrompt(id: string) { if (!await prisma.aIPrompt.findUnique({ where: { id }, select: { id: true } })) throw new AppError('Prompt not found', 404); }
