import { Router } from 'express';

import { prisma } from '../db/prisma';
import { normalizePagination } from '../utils/pagination';

export const articlesRouter = Router();

articlesRouter.get('/', async (req, res, next) => {
  try {
    const { source, page: pageParam, pageSize: pageSizeParam } = req.query;

    if (!source || typeof source !== 'string') {
      res.status(400).json({ error: 'source query parameter is required' });
      return;
    }

    const page = Number(pageParam ?? 1);
    const pageSize = Number(pageSizeParam ?? 20);
    const { page: safePage, pageSize: safePageSize } = normalizePagination(page, pageSize);

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where: { sourceKey: source },
        orderBy: { publishedAt: 'desc' },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        select: {
          id: true,
          title: true,
          summary: true,
          url: true,
          publishedAt: true
        }
      }),
      prisma.article.count({ where: { sourceKey: source } })
    ]);

    res.json({
      items,
      total,
      page: safePage,
      pageSize: safePageSize
    });
  } catch (error) {
    next(error);
  }
});
