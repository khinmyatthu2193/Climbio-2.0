import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

function allowlistedEmails() {
  return [...new Set((env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean))];
}

async function main() {
  const emails = allowlistedEmails();
  if (!emails.length) throw new Error('ADMIN_EMAILS must include at least one administrator email.');
  const bootstrapEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrapEmail && !emails.includes(bootstrapEmail)) throw new Error('ADMIN_EMAIL must also be included in ADMIN_EMAILS.');

  const downgraded = await prisma.user.findMany({
    where: { role: 'ADMIN', email: { notIn: emails } },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    if (downgraded.length) {
      await tx.user.updateMany({ where: { id: { in: downgraded.map((user) => user.id) } }, data: { role: 'SHOP_OWNER' } });
      await tx.refreshToken.updateMany({ where: { userId: { in: downgraded.map((user) => user.id) }, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    await tx.user.updateMany({ where: { email: { in: emails } }, data: { role: 'ADMIN', accountStatus: 'ACTIVE', publicEnabled: false } });

    if (bootstrapEmail && !(await tx.user.findUnique({ where: { email: bootstrapEmail }, select: { id: true } }))) {
      if (!env.ADMIN_PASSWORD || !env.ADMIN_NAME) throw new Error('ADMIN_PASSWORD and ADMIN_NAME are required to create ADMIN_EMAIL.');
      await tx.user.create({
        data: {
          email: bootstrapEmail,
          password: await bcrypt.hash(env.ADMIN_PASSWORD, 12),
          name: env.ADMIN_NAME,
          shopName: 'Climbio Administration',
          role: 'ADMIN',
          accountStatus: 'ACTIVE',
          approvalStatus: 'APPROVED',
          publicEnabled: false,
          setting: { create: {} },
        },
      });
    }
  });
  console.info(`[admin-bootstrap] synchronized ${emails.length} allowlisted admin email(s); downgraded ${downgraded.length} legacy administrator(s).`);
}

void main().catch((error: unknown) => {
  console.error('[admin-bootstrap] failed', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
