import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

let server: ReturnType<typeof app.listen>;

async function start() {
  console.info('[startup] configuration', {
    nodeEnv: env.NODE_ENV,
    databaseUrlConfigured: Boolean(env.DATABASE_URL),
    openRouterKeyConfigured: Boolean(env.OPENROUTER_API_KEY),
    openRouterModel: env.OPENROUTER_MODEL,
    frontendOriginCount: env.FRONTEND_URL.split(',').length,
  });
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.info('[startup] database connection successful');
  } catch (error) {
    console.error('[startup] database connection failed', {
      errorType: error instanceof Error ? error.name : 'UnknownError',
      code: typeof error === 'object' && error && 'code' in error ? String(error.code) : undefined,
    });
    process.exit(1);
  }
  server = app.listen(env.PORT, () => console.log(`Climbio API listening on port ${env.PORT}`));
}

void start();
const shutdown = async () => {
  if (!server) {
    await prisma.$disconnect();
    process.exit(0);
  }
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
