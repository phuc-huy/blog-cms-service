/**
 * Instrumentation runs automatically when the Node.js server starts.
 * This is the recommended way to initialize background services like cron jobs.
 *
 * For this to work, you need to add this to next.config.js:
 * instrumental: true
 */
import { initCronJobs } from "./lib/init"

export async function register() {
    console.log("[instrumentation] initializing cron jobs...")
    initCronJobs()
}
