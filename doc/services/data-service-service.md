# data-service-service（数据服务发布）开发计划

## 1. 职责边界

- 对应 bounded context：`data-service`
- 范围：技术层通用数据 API 服务（发布/下线、授权、限流、调用日志）
- 不包含：跨机构共享交换业务流程（归 `data-sharing`）

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
