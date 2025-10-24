import { Router } from 'express';

import { manualIngest } from '../jobs/ingest';

export const adminRouter = Router();

adminRouter.post('/ingest', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? req.query.token?.toString();
    await manualIngest(token);
    res.json({ status: 'queued' });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next(error);
  }
});
