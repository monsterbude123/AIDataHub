import type { QueueConfig, ID } from '@ai-datahub/contract';

export interface QueueRepository {
  create(queue: Omit<QueueConfig, 'queueId'>): Promise<{ queueId: ID }>;
  update(queue: QueueConfig): Promise<boolean>;
  delete(queueId: ID): Promise<boolean>;
  list(): Promise<QueueConfig[]>;
}

export class InMemoryQueueRepository implements QueueRepository {
  private queues: QueueConfig[] = [];
  private nextId = 1;

  async create(queue: Omit<QueueConfig, 'queueId'>): Promise<{ queueId: ID }> {
    const queueId = `queue-${this.nextId++}`;
    this.queues.push({
      ...queue,
      queueId,
    });
    return { queueId };
  }

  async update(queue: QueueConfig): Promise<boolean> {
    const idx = this.queues.findIndex((q) => q.queueId === queue.queueId);
    if (idx < 0) return false;
    this.queues = [
      ...this.queues.slice(0, idx),
      queue,
      ...this.queues.slice(idx + 1),
    ];
    return true;
  }

  async delete(queueId: ID): Promise<boolean> {
    const len = this.queues.length;
    this.queues = this.queues.filter((q) => q.queueId !== queueId);
    return this.queues.length < len;
  }

  async list(): Promise<QueueConfig[]> {
    return this.queues;
  }
}
