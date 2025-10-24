import { Router } from 'express';

import { prisma } from '../db/prisma';

export const sourcesRouter = Router();

sourcesRouter.get('/', async (_req, res, next) => {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { name: 'asc' },
      select: {
        key: true,
        name: true
      }
    });
    res.json(sources);
  } catch (error) {
    next(error);
  }
});
