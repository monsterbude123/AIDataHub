---
name: frontend-integration-deliverables
overview: 面向前端团队的接入交付物规划，包括 Swagger 文档配置、前端接入指南、SDK 使用说明、Mock 服务方案。
todos:
  - id: swagger-config-check
    content: 检查各服务 Swagger 配置是否完整，确保 API 文档可用
    status: completed
  - id: api-conventions-doc
    content: 编写 API 约定文档（统一响应格式、认证方式、分页规范）
    status: completed
  - id: error-codes-doc
    content: 编写错误码速查表，覆盖所有服务的错误码
    status: completed
  - id: sdk-usage-guide
    content: 编写 SDK 安装、配置、使用指南
    status: completed
  - id: service-api-docs
    content: 编写各服务的 API 文档（9个服务）
    status: completed
  - id: mock-service-setup
    content: 提供 MSW Mock handlers，支持前端独立开发
    status: completed
  - id: contract-package-publish
    content: 确认 @ai-datahub/contract 包发布，前端可安装使用
    status: pending
isProject: false
---

# 前端接入交付物规划

> 目标：为前端团队提供完整的接入文档和工具，支持前端与后端并行开发。

> 实施进度（2026-04-02）：
>
> - 已完成 `doc/frontend/` 交付文档目录（总览/接入指南/API 索引/Mock 方案）
> - 已完成 Swagger 配置检查报告：`doc/frontend/swagger-check-report.md`
> - `@ai-datahub/sdk` 已具备 9 个领域客户端对接能力，发布准备流程已落地

---

## 交付物清单

| 交付物                   | 目标用户        | 目的                 | 优先级 | 状态    | 对应计划                                            |
| ------------------------ | --------------- | -------------------- | ------ | ------- | --------------------------------------------------- |
| **@ai-datahub/sdk**      | 前端开发        | 类型安全调用后端服务 | P0     | 待开发  | [SDK开发计划](./2026-04-02-sdk-development-plan.md) |
| **@ai-datahub/contract** | 前端 TypeScript | 类型定义复用         | P0     | ✅ 已有 | -                                                   |
| **Swagger UI 在线文档**  | 前端开发        | API 接口查看、调试   | P0     | 需验证  | -                                                   |
| **SDK 使用指南**         | 前端开发        | SDK 安装、配置、使用 | P0     | 待编写  | -                                                   |
| **API 约定文档**         | 前端开发        | 理解统一调用方式     | P1     | 待编写  | -                                                   |
| **错误码速查表**         | 前端开发        | 错误处理参考         | P1     | 待编写  | -                                                   |
| **Mock 服务**            | 前端开发/测试   | 独立开发调试         | P1     | 待规划  | -                                                   |

---

## 一、Swagger 文档配置检查

### 1.1 各服务 Swagger 配置要求

每个服务的 `main.ts` 应包含：

```typescript
const config = new DocumentBuilder()
  .setTitle('{ServiceName} API')
  .setDescription('服务描述')
  .setVersion('1.0')
  .addBearerAuth() // JWT 认证
  .addServer('http://localhost:{port}')
  .addTag('TagName', '分组描述')
  .build();
```

### 1.2 Controller 注解规范

```typescript
@ApiTags('ResourceName') // Swagger 分组
@Controller('api/xxx')
export class XxxController {
  @Post('resource')
  @ApiOperation({ summary: '操作摘要' })
  @ApiBody({ type: CreateXxxDto })
  @ApiResponse({ status: 201, description: '创建成功', type: XxxResponseDto })
  @ApiResponse({ status: 400, description: '参数错误' })
  async create(@Body() dto: CreateXxxDto): Promise<Result<Xxx>> {
    // ...
  }
}
```

### 1.3 服务 Swagger 检查清单

| 服务                 | 端口 | Swagger 路径 | 检查项           |
| -------------------- | ---- | ------------ | ---------------- |
| api-gateway          | 3000 | `/api/docs`  | 聚合所有服务文档 |
| system-auth-service  | 4001 | `/api/docs`  | 认证相关接口     |
| metadata-service     | 4002 | `/api/docs`  | 元数据接口       |
| data-service-service | 4003 | `/api/docs`  | 数据服务接口     |
| ops-service          | 3001 | `/api/docs`  | 运维调度接口     |
| integration-service  | 3002 | `/api/docs`  | 集成接口         |
| admin-service        | 3003 | `/api/docs`  | 系统管理接口     |
| sharing-service      | 3004 | `/api/docs`  | 共享交换接口     |
| analytics-service    | 3005 | `/api/docs`  | 自助分析接口     |
| security-service     | 3006 | `/api/docs`  | 安全生命周期接口 |

---

## 二、前端接入指南文档结构

```
doc/
└── frontend/
    ├── README.md                    # 前端接入总览
    ├── getting-started.md           # 快速开始
    ├── authentication.md            # 认证接入
    ├── api-conventions.md           # API 约定
    ├── error-handling.md            # 错误处理
    ├── pagination.md                # 分页规范
    ├── sdk-usage.md                 # SDK 使用指南
    └── api/
        ├── auth-api.md              # 认证服务 API
        ├── metadata-api.md          # 元数据服务 API
        ├── data-api.md              # 数据服务 API
        ├── ops-api.md               # 运维服务 API
        ├── admin-api.md             # 管理服务 API
        ├── sharing-api.md           # 共享服务 API
        ├── analytics-api.md         # 分析服务 API
        ├── integration-api.md       # 集成服务 API
        └── security-api.md          # 安全服务 API
```

---

## 三、核心文档内容模板

### 3.1 API 约定文档 (`api-conventions.md`)

```markdown
# API 约定

## 统一响应格式

所有接口返回统一的 `Result<T>` 格式：

### 成功响应

\`\`\`json
{
"ok": true,
"data": { ... },
"traceId": "abc123"
}
\`\`\`

### 失败响应

\`\`\`json
{
"ok": false,
"error": {
"code": "INVALID_ARGUMENT",
"message": "参数错误",
"level": "WARN"
},
"traceId": "abc123"
}
\`\`\`

## 认证方式

- Bearer Token (JWT)
- Header: `Authorization: Bearer <token>`

## 请求头

| Header        | 必填 | 说明                   |
| ------------- | ---- | ---------------------- |
| Authorization | 是   | Bearer Token           |
| X-Trace-Id    | 否   | 追踪ID，不传则自动生成 |
| Content-Type  | 是   | application/json       |

## 分页请求

\`\`\`json
{
"page": 1,
"pageSize": 20
}
\`\`\`

## 分页响应

\`\`\`json
{
"ok": true,
"data": {
"items": [...],
"total": 100,
"page": 1,
"pageSize": 20
}
}
\`\`\`
```

### 3.2 错误码速查表 (`error-codes.md`)

```markdown
# 错误码速查表

## 通用错误码

| 错误码            | 说明       | HTTP 状态码 |
| ----------------- | ---------- | ----------- |
| INVALID_ARGUMENT  | 参数错误   | 400         |
| PERMISSION_DENIED | 权限不足   | 403         |
| NOT_FOUND         | 资源不存在 | 404         |
| INTERNAL_ERROR    | 内部错误   | 500         |

## 认证服务错误码

| 错误码           | 说明         |
| ---------------- | ------------ |
| USER_NOT_FOUND   | 用户不存在   |
| INVALID_PASSWORD | 密码错误     |
| TOKEN_EXPIRED    | Token 已过期 |
| TOKEN_INVALID    | Token 无效   |

## 元数据服务错误码

| 错误码               | 说明           |
| -------------------- | -------------- |
| DATASOURCE_NOT_FOUND | 数据源不存在   |
| CONNECTION_FAILED    | 连接失败       |
| METADATA_SYNC_FAILED | 元数据同步失败 |

## 数据服务错误码

| 错误码               | 说明           |
| -------------------- | -------------- |
| DATA_ASSET_NOT_FOUND | 数据资产不存在 |
| LAYER_NOT_FOUND      | 分层目录不存在 |

## 运维服务错误码

| 错误码               | 说明           |
| -------------------- | -------------- |
| ALERT_RULE_NOT_FOUND | 告警规则不存在 |
| EXECUTION_NOT_FOUND  | 执行记录不存在 |
| DAG_NOT_FOUND        | DAG 不存在     |

## 共享服务错误码

| 错误码              | 说明       |
| ------------------- | ---------- |
| DIRECTORY_NOT_FOUND | 目录不存在 |
| RESOURCE_NOT_FOUND  | 资源不存在 |
| APPROVAL_REQUIRED   | 需要审批   |
| APPROVAL_REJECTED   | 审批被拒绝 |

## 分析服务错误码

| 错误码          | 说明       |
| --------------- | ---------- |
| QUERY_NOT_FOUND | 查询不存在 |
| EXPORT_FAILED   | 导出失败   |

## 安全服务错误码

| 错误码            | 说明       |
| ----------------- | ---------- |
| RULE_NOT_FOUND    | 规则不存在 |
| ENCRYPTION_FAILED | 加密失败   |
| POLICY_NOT_FOUND  | 策略不存在 |
```

---

## 四、SDK 接入指南

> **SDK 开发计划**：详见 [`2026-04-02-sdk-development-plan.md`](./2026-04-02-sdk-development-plan.md)

### 4.1 安装

```bash
npm install @ai-datahub/sdk @ai-datahub/contract
```

### 4.2 快速配置

```typescript
import { createClient } from '@ai-datahub/sdk';

const api = createClient({
  baseUrl: '/api',
  getToken: () => localStorage.getItem('token'),
  onUnauthorized: () => {
    window.location.href = '/login';
  },
});

// 调用示例
const result = await api.metadata.listDataSources({ page: 1, pageSize: 20 });

if (result.ok) {
  console.log(result.data.items);
} else {
  console.error(result.error.message);
}
```

### 4.3 按服务使用

```typescript
// 统一入口
const api = createClient(config);
await api.auth.login(...);
await api.metadata.listDataSources(...);
await api.data.listAssets(...);
await api.ops.listAlertRules(...);
await api.admin.listProjects(...);
await api.sharing.listServices(...);
await api.analytics.listQueries(...);
await api.integration.listConnectors(...);
await api.security.listMaskingRules(...);

// 或按模块导入
import { AuthClient } from '@ai-datahub/sdk/auth';
import { MetadataClient } from '@ai-datahub/sdk/metadata';
// ... 其他模块
```

### 4.4 类型定义

```typescript
import type {
  Result,
  PageResult,
  ID,
  ISODateTime,
  DataSource,
  DataAsset,
  AlertRule,
  Project,
  SavedQuery,
} from '@ai-datahub/contract';
```

### 4.5 SDK 开发进度

| SDK 模块          | 开发波次 | 预计完成 |
| ----------------- | -------- | -------- |
| HTTP 客户端核心   | Wave 0   | Day 2    |
| AuthClient        | Wave 1   | Day 3    |
| MetadataClient    | Wave 1   | Day 4    |
| DataClient        | Wave 1   | Day 5    |
| OpsClient         | Wave 2   | Day 7    |
| AdminClient       | Wave 2   | Day 8    |
| SharingClient     | Wave 2   | Day 9    |
| AnalyticsClient   | Wave 3   | Day 10   |
| IntegrationClient | Wave 3   | Day 11   |
| SecurityClient    | Wave 3   | Day 12   |

---

## 五、Mock 服务方案

### 5.1 方案对比

| 方案                  | 优点         | 缺点             | 推荐度     |
| --------------------- | ------------ | ---------------- | ---------- |
| **内存 Mock（现有）** | 无需额外部署 | 需启动后端服务   | ⭐⭐⭐     |
| **Mock Server**       | 前端独立开发 | 需维护 Mock 数据 | ⭐⭐⭐⭐   |
| **MSW**               | 浏览器层拦截 | 学习成本         | ⭐⭐⭐⭐⭐ |

### 5.2 推荐 MSW 方案

```typescript
// frontend/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // ==================== 认证服务 ====================
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: { token: 'mock-token', user: { id: '1', name: 'Test User' } },
      })
    );
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: { id: '1', name: 'Test User', email: 'test@example.com' },
      })
    );
  }),

  // ==================== 元数据服务 ====================
  rest.get('/api/metadata/data-sources', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: {
          items: [
            { id: '1', name: 'MySQL Prod', type: 'MYSQL', status: 'ACTIVE' },
            {
              id: '2',
              name: 'PostgreSQL Dev',
              type: 'POSTGRESQL',
              status: 'ACTIVE',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
      })
    );
  }),

  // ==================== 数据服务 ====================
  rest.get('/api/data/assets', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: {
          items: [
            { id: '1', name: '用户表', type: 'TABLE', layerId: 'layer-1' },
            { id: '2', name: '订单表', type: 'TABLE', layerId: 'layer-1' },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
      })
    );
  }),

  // ==================== 运维服务 ====================
  rest.get('/api/ops/alerts/rules', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: [
          { id: '1', name: '超时告警', type: 'TIMEOUT', enabled: true },
          {
            id: '2',
            name: '异常告警',
            type: 'INCREMENT_ANOMALY',
            enabled: true,
          },
        ],
      })
    );
  }),

  rest.get('/api/ops/scheduler/dags', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: {
          items: [
            { dagId: '1', name: '每日数据同步', status: 'ACTIVE' },
            { dagId: '2', name: '每周报表生成', status: 'ACTIVE' },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
      })
    );
  }),

  // ==================== 管理服务 ====================
  rest.get('/api/admin/projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: {
          items: [
            { id: '1', name: '数据中台项目', code: 'DATAHUB', orgId: 'org-1' },
            { id: '2', name: 'BI分析项目', code: 'BI', orgId: 'org-1' },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
      })
    );
  }),

  // ==================== 共享服务 ====================
  rest.get('/api/sharing/directories', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: [
          { id: '1', name: '业务数据', code: 'BIZ', parentId: null },
          { id: '2', name: '基础数据', code: 'BASE', parentId: null },
        ],
      })
    );
  }),

  rest.get('/api/sharing/services', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: {
          items: [
            {
              id: '1',
              name: '用户信息查询',
              type: 'API_PROXY',
              status: 'PUBLISHED',
            },
            {
              id: '2',
              name: '订单数据交换',
              type: 'TABLE_EXCHANGE',
              status: 'PUBLISHED',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
      })
    );
  }),

  // ==================== 分析服务 ====================
  rest.get('/api/analytics/queries', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: {
          items: [
            { id: '1', name: '每日销售额', tags: ['销售', '日报'] },
            { id: '2', name: '用户活跃度', tags: ['用户', '分析'] },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
      })
    );
  }),

  // ==================== 集成服务 ====================
  rest.get('/api/integration/connectors', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: [
          {
            id: '1',
            name: '企业邮箱',
            type: 'NOTIFICATION',
            provider: 'SMTP',
            enabled: true,
          },
          {
            id: '2',
            name: '钉钉通知',
            type: 'NOTIFICATION',
            provider: 'DINGTALK',
            enabled: true,
          },
        ],
      })
    );
  }),

  // ==================== 安全服务 ====================
  rest.get('/api/security/masking/rules', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: [
          {
            id: '1',
            name: '手机号脱敏',
            pattern: 'PHONE',
            algorithmId: 'algo-1',
          },
          {
            id: '2',
            name: '邮箱脱敏',
            pattern: 'EMAIL',
            algorithmId: 'algo-2',
          },
        ],
      })
    );
  }),

  rest.get('/api/security/lifecycle/policies', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        data: [
          { id: '1', name: '热数据策略', tier: 'HOT', enabled: true },
          { id: '2', name: '冷数据归档', tier: 'COLD', enabled: true },
        ],
      })
    );
  }),
];
```

### 5.3 MSW 配置

```typescript
// frontend/mocks/browser.ts
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// frontend/src/main.ts
async function enableMocking() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('../mocks/browser');
    return worker.start();
  }
}

enableMocking().then(() => {
  // 启动应用
});
```

---

## 六、交付时间表

| 里程碑   | 交付物                                       | 预计时间 | 负责人    | 依赖 |
| -------- | -------------------------------------------- | -------- | --------- | ---- |
| **M0.1** | Swagger 文档配置检查报告                     | 1天      | 后端      | -    |
| **M0.2** | API 约定文档                                 | 1天      | 后端      | -    |
| **M0.3** | 错误码速查表                                 | 1天      | 后端      | -    |
| **M0.4** | SDK 基础设施                                 | 2天      | 后端      | M0.1 |
| **M0.5** | SDK Wave 1（Auth/Metadata/Data）             | 3天      | 后端      | M0.4 |
| **M0.6** | SDK Wave 2（Ops/Admin/Sharing）              | 4天      | 后端      | M0.5 |
| **M0.7** | SDK Wave 3（Analytics/Integration/Security） | 3天      | 后端      | M0.6 |
| **M0.8** | Mock 服务（MSW handlers）                    | 2天      | 后端      | M0.7 |
| **M0.9** | SDK 发布 + 前端接入验证                      | 2天      | 后端+前端 | M0.8 |

> SDK 详细开发计划：[`2026-04-02-sdk-development-plan.md`](./2026-04-02-sdk-development-plan.md)

---

## 七、需要前端团队确认的事项

### SDK 相关

1. **TypeScript 版本**：确保 `@ai-datahub/contract` 和 `@ai-datahub/sdk` 兼容
2. **状态管理**：是否需要 SDK 提供 React Hooks（useQuery、useMutation 等）
3. **错误处理偏好**：异常抛出 vs Result 返回

### 环境相关

4. **API Gateway 地址**：开发环境访问地址
5. **Mock 方案**：MSW / Mock Server / 其他
6. **文档格式**：Markdown / Notion / 其他

---

## 八、网关路由汇总

| 服务                 | 网关前缀             | 后端服务地址                      |
| -------------------- | -------------------- | --------------------------------- |
| system-auth-service  | `/api/auth/*`        | `http://auth-service:4001`        |
| metadata-service     | `/api/metadata/*`    | `http://metadata-service:4002`    |
| data-service-service | `/api/data/*`        | `http://data-service:4003`        |
| ops-service          | `/api/ops/*`         | `http://ops-service:3001`         |
| integration-service  | `/api/integration/*` | `http://integration-service:3002` |
| admin-service        | `/api/admin/*`       | `http://admin-service:3003`       |
| sharing-service      | `/api/sharing/*`     | `http://sharing-service:3004`     |
| analytics-service    | `/api/analytics/*`   | `http://analytics-service:3005`   |
| security-service     | `/api/security/*`    | `http://security-service:3006`    |

---

## 相关文档

- SDK 开发计划：[`2026-04-02-sdk-development-plan.md`](./2026-04-02-sdk-development-plan.md)
- 领域服务计划：[`2026-04-02-domain-services-plan.md`](./2026-04-02-domain-services-plan.md)
- 后续工作规划：[`2026-04-02-post-domain-services-roadmap.md`](./2026-04-02-post-domain-services-roadmap.md)
- 架构全景：`doc/ARCHITECTURE.md`
- 服务规划：`doc/services/README.md`
