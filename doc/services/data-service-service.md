# data-service-service（数据服务聚合服务）

> **MVP 架构说明**：此服务当前聚合了多个 bounded context，采用"先合并后拆分"策略。各模块可按需独立拆分为微服务。

## 0. 包含模块（bounded context）

| 模块                     | 职责                                             | API 前缀                    | 拆分条件             |
| ------------------------ | ------------------------------------------------ | --------------------------- | -------------------- |
| **cost-management**      | 成本管理、配额、优化建议                         | `/api/cost-management`      | 成本核算独立运营时   |
| **data-governance-core** | 数据治理核心：标准定义、字典、数据模型、审计任务 | `/api/data-governance-core` | 治理规则复杂度增加时 |
| **data-governance-ops**  | 数据治理运营：质量规则、标签、执行任务           | `/api/data-governance-ops`  | 运营流程自动化时     |
| **data-integration**     | 数据源管理、连接测试、元数据采集、SQL 执行       | `/api/data-integration`     | 数据接入规模增长时   |

## 1. 职责边界

### data-service（主服务）

- 对应 bounded context：`data-service`
- 范围：技术层通用数据 API 服务（发布/下线、授权、限流、调用日志）
- 不包含：跨机构共享交换业务流程（归 `data-sharing`）

### data-integration 模块

- 范围：数据源管理、连接测试、接入任务提交、初始元数据采集、探查、SQL 开发执行
- 不包含：元数据全生命周期管理（归 `metadata-service`）

## 2. 依赖

- **契约**：`@ai-datahub/contract` 的 `DataServiceClient` 与相关 DTO
- **共享基础设施**：`@ai-datahub/shared`（traceId、错误映射）
- **下游**：
  - 查询执行引擎适配（SQL 解释/执行、下载任务）：由实现层适配
  - 限流实现：Redis（建议）或本地令牌桶（MVP 可先本地）

## 3. API（第一阶段 MVP）

- `POST /data-services` → `createDataService`
- `PATCH /data-services/:serviceId` → `updateDataService`
- `POST /data-services/:serviceId/publish` → `publishDataService`
- `GET /data-services/:serviceId` → `getDataService`
- `GET /data-services/search` → `searchDataService`
- `POST /data-services/:serviceId/authorizations` → `addAuthorization`
- `POST /data-services/:serviceCode/authorizations/check` → `checkAuthorization`
- `POST /data-services/:serviceCode:invoke` → `invokeDataService`
- `GET /data-services/:serviceId/call-logs` → `getServiceCallLogs`

## 4. 数据存储（建议）

- 服务定义：PostgreSQL（服务表、字段、配置 JSON）
- 授权与密钥：PostgreSQL + KMS/密钥托管（MVP 可先存引用/哈希）
- 调用日志：ClickHouse（建议）或 PostgreSQL（MVP）

## 5. 里程碑

- M1：服务模板跑通（health + traceId + Result）
- M2：服务发布与检索（create/get/search/publish）
- M3：授权与限流（add/check + rate-limit）
- M4：调用日志与统计（logs）
