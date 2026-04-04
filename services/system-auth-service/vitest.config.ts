import { defineConfig } from 'vitest/config';

import { presets } from '../vitest-coverage-presets';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    /**
     * 依赖本地 SQLite 测试库与 Prisma migrate；默认跳过 DB 单测/E2E，仅跑无库用例。
     * 全量：VITEST_FULL=1 npm test
     */
    exclude:
      process.env.VITEST_FULL === '1'
        ? []
        : [
            'test/app.e2e.test.ts',
            'test/http.e2e.test.ts',
            'src/modules/**/*.service.test.ts',
          ],
    // SQLite doesn't handle concurrent writes well, so run tests sequentially
    threads: false,
    // Increase timeout for database operations
    testTimeout: 10000,
    hookTimeout: 10000,
    /** 与默认测试范围一致：仅统计 auth 子树，阈值见 vitest-coverage-presets */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/modules/auth/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      thresholds: { ...presets['system-auth-service'] },
    },
  },
});
