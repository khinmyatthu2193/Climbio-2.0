import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function databaseUrlWithConnectionLimit() {
  const url = new URL(env.DATABASE_URL);
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', String(env.DATABASE_CONNECTION_LIMIT));
  }
  return url.toString();
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: { url: databaseUrlWithConnectionLimit() },
  },
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
