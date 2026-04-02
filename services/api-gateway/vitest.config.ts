import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    threads: false,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
