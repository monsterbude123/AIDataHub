import amqp from 'amqplib';
import { getAppEnv, getEnvOrDefault } from './config';

export type EventPayload = Record<string, unknown>;

export interface EventMessage<T extends EventPayload = EventPayload> {
  type: string;
  timestamp: string;
  payload: T;
}

export interface EventBus {
  publish<T extends EventPayload>(type: string, payload: T): void;
  subscribe<T extends EventPayload>(
    type: string,
    handler: (event: EventMessage<T>) => void
  ): () => void;
}

type EventBusBackend = 'memory' | 'rabbitmq';

class InMemoryEventBus implements EventBus {
  private readonly listeners = new Map<
    string,
    Set<(event: EventMessage) => void>
  >();

  publish<T extends EventPayload>(type: string, payload: T): void {
    const handlers = this.listeners.get(type);
    if (!handlers || handlers.size === 0) return;
    const event: EventMessage<T> = {
      type,
      timestamp: new Date().toISOString(),
      payload,
    };
    for (const h of handlers) h(event as EventMessage);
  }

  subscribe<T extends EventPayload>(
    type: string,
    handler: (event: EventMessage<T>) => void
  ): () => void {
    const handlers = this.listeners.get(type) ?? new Set();
    handlers.add(handler as (event: EventMessage) => void);
    this.listeners.set(type, handlers);
    return () => {
      const current = this.listeners.get(type);
      if (!current) return;
      current.delete(handler as (event: EventMessage) => void);
      if (current.size === 0) this.listeners.delete(type);
    };
  }
}

class RabbitMqEventBus implements EventBus {
  private connectionPromise: Promise<amqp.ChannelModel> | null = null;
  private readonly exchange: string;
  private readonly serviceName: string;

  constructor() {
    this.exchange = getEnvOrDefault('EVENT_BUS_EXCHANGE', 'aidatahub.events');
    this.serviceName = getEnvOrDefault('SERVICE_NAME', 'unknown-service');
  }

  private getConnection(): Promise<amqp.ChannelModel> {
    if (this.connectionPromise) return this.connectionPromise;
    const url = getEnvOrDefault(
      'RABBITMQ_URL',
      'amqp://guest:guest@127.0.0.1:5672'
    );
    this.connectionPromise = amqp.connect(url);
    return this.connectionPromise;
  }

  publish<T extends EventPayload>(type: string, payload: T): void {
    void this.getConnection()
      .then(async (conn) => {
        const channel = await conn.createChannel();
        await channel.assertExchange(this.exchange, 'topic', { durable: true });
        const enriched = {
          type,
          timestamp: new Date().toISOString(),
          service: this.serviceName,
          traceId: String(payload.traceId ?? 'n/a'),
          payload,
        };
        channel.publish(
          this.exchange,
          type,
          Buffer.from(JSON.stringify(enriched)),
          {
            contentType: 'application/json',
            persistent: true,
          }
        );
        await channel.close();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(
          JSON.stringify({
            level: 'error',
            service: 'shared-eventbus',
            traceId: 'mq-publish',
            message: `RabbitMQ publish failed for ${type}`,
            error: error instanceof Error ? error.message : String(error),
          })
        );
      });
  }

  subscribe<T extends EventPayload>(
    type: string,
    handler: (event: EventMessage<T>) => void
  ): () => void {
    let closed = false;
    let channelRef: amqp.Channel | null = null;
    void this.getConnection()
      .then(async (conn) => {
        const channel = await conn.createChannel();
        channelRef = channel;
        await channel.assertExchange(this.exchange, 'topic', { durable: true });
        const queue = `${this.serviceName}.${type}`.replace(/[^\w.-]/g, '_');
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, this.exchange, type);
        await channel.consume(queue, (msg) => {
          if (!msg || closed) return;
          try {
            const parsed = JSON.parse(
              msg.content.toString()
            ) as EventMessage<T>;
            handler(parsed);
            channel.ack(msg);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(
              JSON.stringify({
                level: 'error',
                service: 'shared-eventbus',
                traceId: 'mq-consume',
                message: `RabbitMQ consume failed for ${type}`,
                error: error instanceof Error ? error.message : String(error),
              })
            );
            channel.nack(msg, false, false);
          }
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(
          JSON.stringify({
            level: 'error',
            service: 'shared-eventbus',
            traceId: 'mq-subscribe',
            message: `RabbitMQ subscribe failed for ${type}`,
            error: error instanceof Error ? error.message : String(error),
          })
        );
      });

    return () => {
      closed = true;
      void channelRef?.close().catch(() => undefined);
    };
  }
}

export function createInMemoryEventBus(): EventBus {
  return new InMemoryEventBus();
}

export function createRabbitMqEventBus(): EventBus {
  return new RabbitMqEventBus();
}

export function createEventBusFromEnv(): EventBus {
  const appEnv = getAppEnv();
  const backend = (
    getEnvOrDefault('EVENT_BUS_BACKEND', '') || ''
  ).toLowerCase() as EventBusBackend;
  const shouldUseRabbit =
    backend === 'rabbitmq' || (!backend && appEnv === 'prod');
  if (!shouldUseRabbit) return createInMemoryEventBus();
  try {
    return createRabbitMqEventBus();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        level: 'error',
        service: 'shared-eventbus',
        traceId: 'mq-bootstrap',
        message: 'Fallback to in-memory event bus',
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return createInMemoryEventBus();
  }
}
