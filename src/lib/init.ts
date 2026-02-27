import { startCronJobs } from '../utils/cron';

/**
 * Call this from a part of the server that always runs once on startup.
 * In Next.js with the App Router you could import it in a route or an edge
 * runtime that is guaranteed to execute on the server side first.
 *
 * Example:
 *    // app/api/_init/route.ts
 *    import '../../lib/init';
 *    export async function GET(req, res) { return new Response('ok'); }
 */

// guard to ensure jobs are started only once when the module is imported multiple times
let _cronStarted = false;
export function initCronJobs() {
  if (_cronStarted) return;
  _cronStarted = true;
  startCronJobs();
}

// automatically start when this module is first imported
initCronJobs();

