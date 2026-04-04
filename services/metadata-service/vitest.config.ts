import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

import { presets } from '../vitest-coverage-presets';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    /** 依赖 Prisma 全量生成与 DB；默认 CI/覆盖率门禁跳过，本地联调可设 VITEST_FULL=1 */
    exclude:
      process.env.VITEST_FULL === '1'
        ? []
        : ['test/metadata.e2e.test.ts', 'test/health.e2e.test.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      thresholds: { ...presets['metadata-service'] },
    },
  },
  plugins: [
    swc.vite({
      jsc: {
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        target: 'es2020',
      },
    }),
  ],
});
