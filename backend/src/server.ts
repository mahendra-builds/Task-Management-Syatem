import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.port, () => {
  console.info(`[backend] listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

const shutdown = async (signal: string): Promise<void> => {
  console.info(`[backend] received ${signal}, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[backend] forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[backend] unhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[backend] uncaughtException:', err);
  shutdown('uncaughtException');
});
