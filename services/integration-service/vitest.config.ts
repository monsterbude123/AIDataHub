import { defineConfig } from 'vitest/config';

import { presets } from '../vitest-coverage-presets';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      thresholds: { ...presets['integration-service'] },
    },
  },
});
