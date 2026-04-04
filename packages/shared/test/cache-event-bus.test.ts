import { describe, expect, it } from 'vitest';

import {
  createInMemoryEventBus,
  createMemoryCache,
  createCacheFromEnv,
  createEventBusFromEnv,
} from '../src/index';

describe('cache/event-bus infra', () => {
  it('memory cache should set/get/expire/delete', async () => {
    const cache = createMemoryCache({ defaultTtlMs: 5 });
    cache.set('k1', { v: 1 });
    expect(cache.get<{ v: number }>('k1')?.v).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(cache.get('k1')).toBeUndefined();

    cache.set('k2', 'x', 1_000);
    expect(cache.get('k2')).toBe('x');
    cache.del('k2');
    expect(cache.get('k2')).toBeUndefined();
  });

  it('event bus should publish/subscribe/unsubscribe', () => {
    const bus = createInMemoryEventBus();
    const received: Array<{ type: string; id: string }> = [];
    const off = bus.subscribe<{ id: string }>(
      'ops.etl.connection.created',
      (e) => {
        received.push({ type: e.type, id: String(e.payload.id) });
      }
    );

    bus.publish('ops.etl.connection.created', { id: 'ec_1' });
    expect(received).toEqual([
      { type: 'ops.etl.connection.created', id: 'ec_1' },
    ]);

    off();
    bus.publish('ops.etl.connection.created', { id: 'ec_2' });
    expect(received).toHaveLength(1);
  });

  it('should create memory cache/event bus by default in dev', () => {
    process.env.APP_ENV = 'dev';
    process.env.CACHE_BACKEND = 'memory';
    process.env.EVENT_BUS_BACKEND = 'memory';
    const cache = createCacheFromEnv();
    const bus = createEventBusFromEnv();

    cache.set('k', 'v', 1_000);
    expect(cache.get('k')).toBe('v');
    const messages: string[] = [];
    bus.subscribe<{ id: string }>('evt', (e) =>
      messages.push(String(e.payload.id))
    );
    bus.publish('evt', { id: '1' });
    expect(messages).toEqual(['1']);
  });
});
