# SecurityService - 数据安全服务

## 服务定位

数据安全与生命周期治理服务，负责脱敏管理、分级分类、行级权限、水印任务、加密任务、生命周期策略、归档恢复。

## 服务信息

| 项目     | 值                   |
| -------- | -------------------- |
| 服务名称 | security-service     |
| 端口     | 3006                 |
| 网关前缀 | `/api/security/*`    |
| 实现状态 | 🟡 部分已实现（MVP） |

## 包含模块

| 模块               | 职责                                               | Contract 来源                              |
| ------------------ | -------------------------------------------------- | ------------------------------------------ |
| **data-security**  | 脱敏算法/规则/配置、分级分类、行级权限、水印、加密 | `@ai-datahub/contract/DataSecurityClient`  |
| **data-lifecycle** | 冷热温分层策略、归档恢复、过期删除、生命周期报表   | `@ai-datahub/contract/DataLifecycleClient` |

## API 端点清单

### 脱敏算法管理 (`/api/security/masking/algorithms/*`)

| 方法 | 端点                               | 功能         |
| ---- | ---------------------------------- | ------------ |
| POST | `/api/security/masking/algorithms` | 创建脱敏算法 |
| GET  | `/api/security/masking/algorithms` | 列出脱敏算法 |

**算法类型**：

- `HASH` - 哈希脱敏
- `REDACT` - 遮蔽脱敏
- `CUSTOM` - 自定义脱敏

### 脱敏规则管理 (`/api/security/masking/rules/*`)

| 方法 | 端点                          | 功能         |
| ---- | ----------------------------- | ------------ |
| POST | `/api/security/masking/rules` | 创建脱敏规则 |
| GET  | `/api/security/masking/rules` | 列出脱敏规则 |

### 脱敏配置管理 (`/api/security/masking/configs/*`)

| 方法 | 端点                                    | 功能              |
| ---- | --------------------------------------- | ----------------- |
| POST | `/api/security/masking/configs`         | 创建/更新脱敏配置 |
| GET  | `/api/security/masking/configs`         | 列出脱敏配置      |
| POST | `/api/security/masking/configs/:id/run` | 执行静态脱敏      |

**脱敏模式**：

- `STATIC` - 静态脱敏（调度执行）
- `DYNAMIC` - 动态脱敏（查询时应用）

### 数据分级分类 (`/api/security/classification/*`)

| 方法 | 端点                                      | 功能             |
| ---- | ----------------------------------------- | ---------------- |
| POST | `/api/security/classification`            | 设置数据分级分类 |
| GET  | `/api/security/classification`            | 获取数据分级分类 |
| GET  | `/api/security/classification/levels`     | 获取分级字典     |
| GET  | `/api/security/classification/categories` | 获取分类字典     |

**分级分类**：

```typescript
{
  level: number;        // 安全等级
  category: string;     // 分类类别
  reason?: string;      // 定级原因
}
```

### 行级权限策略 (`/api/security/row-level-policies/*`)

| 方法   | 端点                                   | 功能                  |
| ------ | -------------------------------------- | --------------------- |
| POST   | `/api/security/row-level-policies`     | 创建/更新行级权限策略 |
| DELETE | `/api/security/row-level-policies/:id` | 删除行级权限策略      |
| GET    | `/api/security/row-level-policies`     | 列出行级权限策略      |

**策略定义**：

```typescript
{
  roleId: ID;
  dataAssetId: ID;
  filterExpression: string; // SQL谓词表达式
}
```

### 水印任务 (`/api/security/watermark/*`)

| 方法 | 端点                                | 功能                 |
| ---- | ----------------------------------- | -------------------- |
| POST | `/api/security/watermark/tasks`     | 创建水印任务         |
| GET  | `/api/security/watermark/tasks/:id` | 获取水印任务详情     |
| GET  | `/api/security/watermark/tasks`     | 列出水印任务（分页） |
| POST | `/api/security/watermark/parse`     | 解析水印             |

**水印类型**：

- `HIDDEN` - 隐式水印
- `FAKE_ROW` - 假行水印
- `FAKE_COL` - 假列水印

### 加密任务 (`/api/security/encryption/*`)

| 方法 | 端点                                     | 功能             |
| ---- | ---------------------------------------- | ---------------- |
| POST | `/api/security/encryption/tasks`         | 创建加密任务     |
| GET  | `/api/security/encryption/tasks/:id`     | 获取加密任务详情 |
| POST | `/api/security/encryption/tasks/:id/run` | 执行加密任务     |

**加密任务**：

```typescript
{
  type: 'ENCRYPT' | 'DECRYPT';
  dataAssetId: ID;
  columns: string[];
  algorithm: string;
  keyRef?: string;  // 密钥引用
}
```

---

### 生命周期策略 (`/api/security/lifecycle/policies/*`)

| 方法 | 端点                               | 功能                  |
| ---- | ---------------------------------- | --------------------- |
| POST | `/api/security/lifecycle/policies` | 创建/更新生命周期策略 |
| GET  | `/api/security/lifecycle/policies` | 列出生命周期策略      |

**分层类型**：`HOT`（热）| `WARM`（温）| `COLD`（冷）

**策略规则**：

```typescript
{
  name: string;
  tier: 'HOT' | 'WARM' | 'COLD';
  rules: Record<string, unknown>; // 分层规则（如天数阈值）
  enabled: boolean;
}
```

### 归档管理 (`/api/security/lifecycle/archive/*`)

| 方法 | 端点                                  | 功能                 |
| ---- | ------------------------------------- | -------------------- |
| POST | `/api/security/lifecycle/archive`     | 归档数据             |
| POST | `/api/security/lifecycle/restore`     | 恢复数据             |
| GET  | `/api/security/lifecycle/records`     | 列出归档记录（分页） |
| GET  | `/api/security/lifecycle/records/:id` | 获取归档记录详情     |

**归档状态**：`PENDING` | `RUNNING` | `SUCCESS` | `FAILED`

### 过期数据管理 (`/api/security/lifecycle/expired`)

| 方法 | 端点                              | 功能         |
| ---- | --------------------------------- | ------------ |
| POST | `/api/security/lifecycle/expired` | 删除过期数据 |

**请求参数**：

```typescript
{
  policyId: ID;
  dryRun?: boolean;  // true=仅模拟，不实际删除
}
```

### 生命周期报表 (`/api/security/lifecycle/report`)

| 方法 | 端点                             | 功能             |
| ---- | -------------------------------- | ---------------- |
| GET  | `/api/security/lifecycle/report` | 获取生命周期报表 |

**报表数据**：

```typescript
{
  points: Array<{
    time: ISODateTime;
    hot: number; // 热数据量
    warm: number; // 温数据量
    cold: number; // 冷数据量
  }>;
}
```

## 依赖服务

| 服务                 | 依赖原因                     |
| -------------------- | ---------------------------- |
| system-auth-service  | 用户认证、权限校验、角色查询 |
| data-service-service | 数据资产查询、数据访问       |
| ops-service          | 调度执行脱敏/加密任务        |
| integration-service  | 密钥管理（KMS）              |

## 目录结构

```
services/security-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   ├── common/
│   │   ├── errors/
│   │   └── guards/
│   └── modules/
│       ├── data-security/
│       │   ├── data-security.module.ts
│       │   ├── data-security.controller.ts
│       │   ├── data-security.service.ts
│       │   └── repositories/
│       │       ├── masking-algorithm.repository.ts
│       │       ├── masking-rule.repository.ts
│       │       ├── masking-config.repository.ts
│       │       ├── classification.repository.ts
│       │       ├── row-level-policy.repository.ts
│       │       ├── watermark-task.repository.ts
│       │       └── encryption-task.repository.ts
│       └── data-lifecycle/
│           ├── data-lifecycle.module.ts
│           ├── data-lifecycle.controller.ts
│           ├── data-lifecycle.service.ts
│           └── repositories/
│               ├── lifecycle-policy.repository.ts
│               └── archive-record.repository.ts
├── test/
├── package.json
└── tsconfig.json
```

## 数据存储建议

| 数据类型          | 存储选型           | 说明           |
| ----------------- | ------------------ | -------------- |
| 脱敏配置/分级分类 | PostgreSQL         | 结构化配置数据 |
| 行级权限策略      | PostgreSQL + Redis | 策略缓存加速   |
| 加密/水印任务     | PostgreSQL         | 任务状态管理   |
| 生命周期策略      | PostgreSQL         | 结构化配置     |
| 归档记录          | PostgreSQL         | 归档状态跟踪   |
| 加密密钥          | Vault/KMS          | 密钥安全管理   |
| 归档数据          | MinIO/OSS          | 冷数据对象存储 |

## 开发注意事项

1. **密钥安全**：加密密钥必须通过 KMS 管理，禁止明文存储
2. **动态脱敏**：动态脱敏需要集成数据访问层，实时应用规则
3. **行级权限**：行级权限策略需要下沉到查询引擎执行
4. **归档调度**：归档/恢复任务依赖 `ops-service` 调度能力
5. **合规审计**：所有安全操作需要记录审计日志

## 当前实现补充（MVP）

- 已启用服务内认证保护：除 `GET /health` 外必须携带 `Authorization: Bearer <token>`
- 已启用审计日志拦截：`POST/PUT/DELETE` 记录操作结果、traceId、userId、耗时
