import type { Prisma, PrismaClient } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

export const SHOP_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyShopName(name: string) {
  const slug = name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
    .replace(/-$/g, '');
  return slug || 'shop';
}

export async function isShopSlugAvailable(db: DbClient, slug: string, shopId?: string) {
  const [current, historical] = await Promise.all([
    db.user.findFirst({ where: { slug, ...(shopId ? { id: { not: shopId } } : {}) }, select: { id: true } }),
    db.shopSlugHistory.findFirst({ where: { slug, ...(shopId ? { shopId: { not: shopId } } : {}) }, select: { id: true } }),
  ]);
  return !current && !historical;
}

export async function createUniqueShopSlug(db: DbClient, shopName: string, shopId?: string) {
  const base = slugifyShopName(shopName);
  for (let suffix = 1; suffix <= 10_000; suffix += 1) {
    const label = suffix === 1 ? '' : `-${suffix}`;
    const candidate = `${base.slice(0, 120 - label.length).replace(/-$/g, '')}${label}`;
    if (await isShopSlugAvailable(db, candidate, shopId)) return candidate;
  }
  throw new Error('Could not generate a unique public shop slug');
}
