import cron from 'node-cron';
import { cacheDel } from './cache';

/**
 * Example cronjob setup.  You can start this during server bootstrap (e.g. inside
 * an API route that runs once or in the top-level app entrypoint).
 */
export function startCronJobs() {
  // clear a cache key every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[cron] clearing `stats:daily` cache');
    await cacheDel('stats:daily');
  });

  // run a generic background task every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[cron] five-minute heartbeat');
    // ... your maintenance code here, e.g. pre‑populate a cache
  });
}
