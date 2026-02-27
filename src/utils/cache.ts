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
