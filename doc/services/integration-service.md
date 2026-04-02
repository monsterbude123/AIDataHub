# IntegrationService - 系统集成服务

## 服务定位

外部系统连接器管理服务，负责统一管理 IDP、通知渠道、消息队列、文件存储等连接器，并提供通知发送、消息发布、文件上传下载能力。

## 服务信息

| 项目     | 值                   |
| -------- | -------------------- |
| 服务名称 | integration-service  |
| 端口     | 3002                 |
| 网关前缀 | `/api/integration/*` |
| 实现状态 | 📋 规划中            |

## 包含模块

| 模块                   | 职责                                     | Contract 来源                                  |
| ---------------------- | ---------------------------------------- | ---------------------------------------------- |
| **system-integration** | 连接器管理、通知发送、消息发布、文件存储 | `@ai-datahub/contract/SystemIntegrationClient` |

## API 端点清单

### 连接器管理 (`/api/integration/connectors/*`)

| 方法 | 端点                                   | 功能            |
| ---- | -------------------------------------- | --------------- |
| POST | `/api/integration/connectors`          | 创建/更新连接器 |
| GET  | `/api/integration/connectors`          | 列出连接器      |
| POST | `/api/integration/connectors/:id/test` | 测试连接器      |

**连接器类型**：

- `IDP` - 身份认证提供商（OAuth2、LDAP等）
- `NOTIFICATION` - 通知渠道（邮件、短信、钉钉、企业微信）
- `MESSAGE_QUEUE` - 消息队列（Kafka、RocketMQ）
- `FILE_STORAGE` - 文件存储（MinIO、OSS）

### 通知发送 (`/api/integration/notify`)

| 方法 | 端点                      | 功能     |
| ---- | ------------------------- | -------- |
| POST | `/api/integration/notify` | 发送通知 |

**请求参数**：

```typescript
{
  connectorId: ID;           // 通知连接器ID
  channel: 'EMAIL' | 'SMS' | 'DINGTALK' | 'WECHAT_WORK';
  to: string[];              // 接收者列表
  subject?: string;          // 邮件主题
  content: string;           // 通知内容
  options?: Record<string, unknown>;  // 扩展配置（模板、变量等）
}
```

### 消息发布 (`/api/integration/publish`)

| 方法 | 端点                       | 功能           |
| ---- | -------------------------- | -------------- |
| POST | `/api/integration/publish` | 发布消息到队列 |

**请求参数**：

```typescript
{
  connectorId: ID;           // 消息队列连接器ID
  topic: string;             // 主题
  key?: string;              // 消息键
  payload: Record<string, unknown>;  // 消息体
  headers?: Record<string, string>;  // 消息头
}
```

### 文件存储 (`/api/integration/files/*`)

| 方法 | 端点                                  | 功能         |
| ---- | ------------------------------------- | ------------ |
| POST | `/api/integration/files/upload`       | 上传文件     |
| GET  | `/api/integration/files/download-url` | 获取下载链接 |

## 依赖服务

| 服务                | 依赖原因           |
| ------------------- | ------------------ |
| system-auth-service | 用户认证、权限校验 |

## 目录结构

```
services/integration-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   ├── common/
│   │   ├── errors/
│   │   └── guards/
│   └── modules/
│       └── system-integration/
│           ├── system-integration.module.ts
│           ├── system-integration.controller.ts
│           ├── system-integration.service.ts
│           └── repositories/
│               └── connector.repository.ts
├── test/
├── package.json
└── tsconfig.json
```

## 数据存储建议

| 数据类型   | 存储选型   | 说明               |
| ---------- | ---------- | ------------------ |
| 连接器配置 | PostgreSQL | 加密存储敏感配置   |
| 连接器密钥 | Vault/KMS  | 敏感凭证需加密托管 |
| 上传文件   | MinIO/OSS  | 对象存储           |

## 开发注意事项

1. **密钥安全**：连接器配置中的敏感信息必须加密存储
2. **连接池管理**：消息队列、数据库等连接需维护连接池
3. **异步发送**：通知、消息发布建议异步处理，支持重试
4. **限流保护**：外部调用需有限流保护
