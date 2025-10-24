import cron from 'node-cron';

import { ingestAllFeeds } from '../jobs/ingest';
import { logger } from '../logger';

export function scheduleJobs() {
  cron.schedule(
    '0 0 * * *',
    async () => {
      logger.info('Running scheduled ingest job');
      await ingestAllFeeds();
    },
    {
      timezone: 'Asia/Dhaka'
    }
  );
}
