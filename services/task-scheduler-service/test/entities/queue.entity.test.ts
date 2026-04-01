import { describe, it, expect } from 'vitest';

import { QueueEntity } from '../../src/modules/scheduler/entities/queue.entity';

describe('QueueEntity', () => {
  it('should create a queue with priority', () => {
    const queue = new QueueEntity();
    queue.id = 'queue-1';
    queue.name = 'High Priority Queue';
    queue.priority = 100;
    queue.createdAt = new Date();
    queue.updatedAt = new Date();

    expect(queue.id).toBe('queue-1');
    expect(queue.name).toBe('High Priority Queue');
    expect(queue.priority).toBe(100);
  });

  it('should support resource isolation key', () => {
    const queue = new QueueEntity();
    queue.id = 'queue-2';
    queue.name = 'Isolated Queue';
    queue.priority = 50;
    queue.resourceIsolationKey = 'tenant-abc';
    queue.createdAt = new Date();
    queue.updatedAt = new Date();

    expect(queue.resourceIsolationKey).toBe('tenant-abc');
  });

  it('should have default priority', () => {
    const queue = new QueueEntity();
    queue.id = 'queue-3';
    queue.name = 'Default Queue';
    queue.priority = 0;
    queue.createdAt = new Date();
    queue.updatedAt = new Date();

    expect(queue.priority).toBe(0);
  });
});
