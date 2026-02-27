import { createClient } from 'redis';

// connection string can be provided via REDIS_URL or built from host/port
const redisUrl = process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

const redis = createClient({ url: redisUrl });

redis.on('error', (err) => {
  console.error('[redis] connection error', err);
});

// make sure we connect right away so callers can use the client directly
redis.connect().catch((err) => {
  console.error('[redis] failed to connect', err);
});

export default redis;
