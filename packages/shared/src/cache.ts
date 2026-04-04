import { createClient, type RedisClientType } from 'redis';
import { getAppEnv, getEnvOrDefault, getNumericEnvOrDefault } from './config';

type CacheEntry<T> = {
  value: T;
  expireAt: number;
};

export interface CacheClient {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlMs?: number): void;
  del(key: string): void;
  clear(): void;
}

type CacheBackend = 'memory' | 'redis';

function logCacheError(message: string, error: unknown): void {
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: 'error',
      service: 'shared-cache',
      traceId: 'cache-bootstrap',
      message,
      error: error instanceof Error ? error.message : String(error),
    })
  );
}

export type MemoryCacheOptions = {
  defaultTtlMs?: number;
};

class InMemoryCacheClient implements CacheClient {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlMs: number;

  constructor(options: MemoryCacheOptions = {}) {
    this.defaultTtlMs = options.defaultTtlMs ?? 30_000;
  }

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expireAt) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const expireAt = Date.now() + Math.max(1, ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, expireAt });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

class RedisCacheClient implements CacheClient {
  private readonly client: RedisClientType;
  private ready = false;
  private readonly defaultTtlMs: number;
  private readonly shadow = new Map<string, CacheEntry<unknown>>();

  constructor(options: MemoryCacheOptions = {}) {
    const host = getEnvOrDefault('REDIS_HOST', '127.0.0.1');
    const port = getNumericEnvOrDefault('REDIS_PORT', 6379);
    const password = getEnvOrDefault('REDIS_PASSWORD', '');
    this.defaultTtlMs = options.defaultTtlMs ?? 30_000;
    this.client = createClient({
      socket: { host, port },
      password: password || undefined,
    });
    this.client.on('error', (error) => {
      this.ready = false;
      logCacheError('Redis client error', error);
    });
    this.client
      .connect()
      .then(() => {
        this.ready = true;
      })
      .catch((error) => {
        this.ready = false;
        logCacheError('Redis connect failed', error);
      });
  }

  get<T>(key: string): T | undefined {
    const hit = this.shadow.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expireAt) {
      this.shadow.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = Math.max(1, ttlMs ?? this.defaultTtlMs);
    this.shadow.set(key, { value, expireAt: Date.now() + ttl });
    if (!this.ready) return;
    void this.client
      .set(key, JSON.stringify(value), { PX: ttl })
      .catch((error) => {
        logCacheError(`Redis set failed for key=${key}`, error);
      });
  }

  del(key: string): void {
    this.shadow.delete(key);
    if (!this.ready) return;
    void this.client.del(key).catch((error) => {
      logCacheError(`Redis del failed for key=${key}`, error);
    });
  }

  clear(): void {
    this.shadow.clear();
    if (!this.ready) return;
    void this.client.flushDb().catch((error) => {
      logCacheError('Redis clear failed', error);
    });
  }
}

export function createMemoryCache(
  options: MemoryCacheOptions = {}
): CacheClient {
  return new InMemoryCacheClient(options);
}

export function createRedisCache(
  options: MemoryCacheOptions = {}
): CacheClient {
  return new RedisCacheClient(options);
}

export function createCacheFromEnv(
  options: MemoryCacheOptions = {}
): CacheClient {
  const appEnv = getAppEnv();
  const backend = (
    getEnvOrDefault('CACHE_BACKEND', '') || ''
  ).toLowerCase() as CacheBackend;
  const shouldUseRedis = backend === 'redis' || (!backend && appEnv === 'prod');
  if (!shouldUseRedis) return createMemoryCache(options);
  try {
    return createRedisCache(options);
  } catch (error) {
    logCacheError('Fallback to memory cache', error);
    return createMemoryCache(options);
  }
}
