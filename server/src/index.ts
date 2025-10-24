import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';

import { env } from './env';
import { prisma } from './db/prisma';
import { logger } from './logger';
import { scheduleJobs } from './scheduler/cron';
import { sourcesRouter } from './routes/sources';
import { articlesRouter } from './routes/articles';
import { adminRouter } from './routes/admin';

const app = express();

app.use(express.json());
app.use(cors({ origin: '*', credentials: false }));
app.use(pinoHttp({ logger }));

app.get('/healthz', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});

app.use('/api/sources', sourcesRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/admin', adminRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(env.PORT ?? 3000);

app.listen(port, () => {
  logger.info(`API server listening on port ${port}`);
  scheduleJobs();
});
