import { describe, it, expect } from 'vitest';
import { createLogger, DefaultLogger } from '../src/logger';

describe('logger', () => {
  it('should create a logger', () => {
    const logger = createLogger({ service: 'test' });
    expect(logger).toBeInstanceOf(DefaultLogger);
  });

  it('should create logger with traceId', () => {
    const logger = createLogger().withTrace('test-trace-id');
    expect(logger).toBeInstanceOf(DefaultLogger);
  });

  it('should allow method calls', () => {
    const logger = createLogger();
    // Just verify these don't throw
    expect(() => logger.debug('debug')).not.toThrow();
    expect(() => logger.info('info')).not.toThrow();
    expect(() => logger.warn('warn')).not.toThrow();
    expect(() => logger.error('error')).not.toThrow();
    expect(() => logger.error('error', new Error('test'))).not.toThrow();
  });
});
