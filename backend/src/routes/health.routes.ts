import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const dbStart = Date.now();
  let dbOk = false;
  let dbLatencyMs = -1;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbOk = false;
  }

  res.json({
    success: true,
    status: 'ok',
    db: { ok: dbOk, latencyMs: dbOk ? dbLatencyMs : null },
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
