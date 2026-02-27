This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Redis cache & cron jobs

The project now includes a Redis service (see `docker-compose.yml`) that can be used for
application caching and scheduled background tasks.

### Setup
1. Install the new dependencies:

```bash
npm install redis node-cron
# or yarn add redis node-cron
```

2. Add Redis-related environment variables to `.env` (example shown):

```
REDIS_HOST=blog_cms_service_redis   # container name when using docker-compose
REDIS_PORT=6379
# or simply set REDIS_URL=redis://localhost:6379
```

You can import the helpers from `src/lib/redis.ts` and
   `src/utils/cache.ts` in any server-side code.  A cron helper is
   provided in `src/utils/cron.ts`.

### Auto-initialization (Recommended)

Cron jobs are **automatically started** when your Node server boots, courtesy of
`src/instrumentation.ts`. Nothing else is needed – just ensure `next.config.js`
has `experimental.instrumentationHook: true` (which it does).

### Manual initialization (Alternative)

If you prefer explicit control or need to initialize later, you can manually invoke
the cron startup from any server-side code:

```ts
import { initCronJobs } from '@/lib/init';

// Call this anywhere in server code to ensure cron jobs are running
initCronJobs();
```

Or use the dedicated endpoint: `GET /api/init-cron` to trigger initialization.

### Cache helpers

The following helpers wrap the Redis client with JSON serialization:

```ts
import { cacheGet, cacheSet } from '@/utils/cache';

// set value for 10 minutes
await cacheSet('user:123', { name: 'Alice' }, 600);
const user = await cacheGet<{ name: string }>('user:123');
```

### Cron examples

A couple of scheduled jobs are defined in `src/utils/cron.ts`:
- daily clearing of a `stats:daily` key
- every‑5‑minutes heartbeat or maintenance task

You can add more schedules using standard cron syntax.

```ts
// the file already exports startCronJobs(); just invoke it once as shown above
```

Keep in mind that cron jobs only run in the Node server environment, not in
client-side code.


This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
