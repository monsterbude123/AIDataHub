/**
 * 各微服务 Vitest 覆盖率阈值（行/语句为主，分支略低以避免纯类型分支噪声）。
 * 数值随 `doc/plans/m2-services-coverage-rollout.md` 分波抬升；调整时请同步该文档与 CI。
 */
export const presets = {
  'api-gateway': {
    lines: 80,
    statements: 80,
    branches: 65,
    functions: 75,
  },
  'ops-service': {
    lines: 80,
    statements: 80,
    branches: 55,
    functions: 90,
  },
  'sharing-service': {
    lines: 68,
    statements: 68,
    branches: 50,
    functions: 62,
  },
  'integration-service': {
    lines: 80,
    statements: 80,
    branches: 72,
    functions: 88,
  },
  'security-service': {
    lines: 62,
    statements: 62,
    branches: 55,
    functions: 58,
  },
  'analytics-service': {
    lines: 65,
    statements: 65,
    branches: 55,
    functions: 82,
  },
  'admin-service': {
    lines: 72,
    statements: 72,
    branches: 50,
    functions: 68,
  },
  /** 默认仅跑无 DB 用例时 src 覆盖率仍低；阈值仅约束 auth 子包，见 vitest.config */
  'system-auth-service': {
    lines: 15,
    statements: 15,
    branches: 10,
    functions: 15,
  },
  'task-scheduler-service': {
    lines: 80,
    statements: 80,
    branches: 65,
    functions: 75,
  },
  'metadata-service': {
    lines: 15,
    statements: 15,
    branches: 12,
    functions: 14,
  },
  'data-service-service': {
    lines: 28,
    statements: 28,
    branches: 22,
    functions: 10,
  },
} as const;

export type ServicePresetKey = keyof typeof presets;
