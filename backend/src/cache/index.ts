// cache/index.ts — Redis cache-aside wrapper
import redis from '../config/redis';

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Non-fatal — cache failures should never crash the app
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Non-fatal
  }
}

export { CacheKeys } from './keys';
export { TTL } from './ttl';
