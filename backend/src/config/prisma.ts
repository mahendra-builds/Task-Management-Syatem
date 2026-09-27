import { PrismaClient } from '@prisma/client';
import { env } from './env';

export const prisma = new PrismaClient({
  log: env.isProduction ? ['error'] : ['query', 'warn', 'error'],
});

export type { Prisma } from '@prisma/client';
