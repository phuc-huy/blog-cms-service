import { initCronJobs } from '@/lib/init';

/**
 * This is an initialization endpoint that ensures cron jobs are running.
 * You can call this once when your server starts to guarantee cron jobs are active.
 */
export async function GET() {
  initCronJobs();
  return new Response(JSON.stringify({ message: 'Cron jobs initialized' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
