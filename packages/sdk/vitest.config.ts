import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/http/FetchHttpClient.ts', 'src/http/errors.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 25,
        statements: 80,
      },
    },
  },
});
