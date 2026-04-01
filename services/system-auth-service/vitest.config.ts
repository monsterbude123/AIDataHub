import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    // SQLite doesn't handle concurrent writes well, so run tests sequentially
    threads: false,
    // Increase timeout for database operations
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
