#!/usr/bin/env node
/**
 * 串行执行各微服务 `test:coverage`，任一失败则退出码 1。
 * 阈值见 services/vitest-coverage-presets.ts 与 doc/plans/m2-services-coverage-rollout.md
 */
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const workspaces = [
  '@ai-datahub/api-gateway',
  '@ai-datahub/ops-service',
  '@ai-datahub/sharing-service',
  '@ai-datahub/integration-service',
  '@ai-datahub/security-service',
  '@ai-datahub/analytics-service',
  '@ai-datahub/admin-service',
  '@ai-datahub/task-scheduler-service',
  '@ai-datahub/metadata-service',
  '@ai-datahub/data-service-service',
  '@ai-datahub/system-auth-service',
];

let failed = false;
for (const w of workspaces) {
  // eslint-disable-next-line no-console
  console.log(`\n========== ${w} test:coverage ==========\n`);
  try {
    execSync(`npm -w ${w} run test:coverage`, { cwd: root, stdio: 'inherit' });
  } catch {
    // eslint-disable-next-line no-console
    console.error(`\n[run-services-coverage] FAILED: ${w}\n`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
