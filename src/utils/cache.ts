import redis from '../lib/redis';

/**
 * Simple wrapper helpers around Redis keys for JSON-able values.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch (err) {
    // in case the stored value is not JSON
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<void> {
  const str = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, str, 'EX', ttlSeconds);
  } else {
    await redis.set(key, str);
  }
}

export async function cacheDel(key: string): Promise<number> {
  return redis.del(key);
}

/**
 * Delete all Redis keys matching a glob pattern (e.g. "posts:*").
 * Uses KEYS + DEL — fine for moderate key counts typical in this app.
 * Returns the number of keys deleted.
 */
export async function cacheDelPattern(pattern: string): Promise<number> {
  const keys = await redis.keys(pattern);
  if (keys.length === 0) return 0;
  return redis.del(keys);
}
