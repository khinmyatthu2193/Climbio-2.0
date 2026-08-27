import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

let server: ReturnType<typeof app.listen>;

const DATABASE_CONNECT_ATTEMPTS = 5;

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function connectToDatabase() {
  for (let attempt = 1; attempt <= DATABASE_CONNECT_ATTEMPTS; attempt += 1) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.info('[startup] database connection successful');
      return;
    } catch (error) {
      const finalAttempt = attempt === DATABASE_CONNECT_ATTEMPTS;
      console.error('[startup] database connection failed', {
        attempt,
        maxAttempts: DATABASE_CONNECT_ATTEMPTS,
        errorType: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'Unknown database error',
        code: typeof error === 'object' && error && 'code' in error ? String(error.code) : undefined,
      });
      if (finalAttempt) throw error;
      await delay(500 * 2 ** (attempt - 1));
    }
  }
}

async function start() {
  console.info('[startup] configuration', {
    nodeEnv: env.NODE_ENV,
    databaseUrlConfigured: Boolean(env.DATABASE_URL),
    databaseConnectionLimit: env.DATABASE_CONNECTION_LIMIT,
    openRouterKeyConfigured: Boolean(env.OPENROUTER_API_KEY),
    openRouterModel: env.OPENROUTER_MODEL,
    frontendOriginCount: env.FRONTEND_URL.split(',').length,
  });
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('[startup] database unavailable after retries');
    await prisma.$disconnect();
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
