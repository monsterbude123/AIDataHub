# 架构决策记录（ADR）

> 本文用于记录 AI DataHub（SDK + 微服务）建设过程中的关键架构与技术栈决策，便于后续追溯“为什么这么选”。
>
> 约定：
>
> - **状态**：PROPOSED / ACCEPTED / DEPRECATED
> - **影响范围**：Contract / SDK / Services / Tooling / Docs

---

## ADR-0001：交付形态采用“Contract + SDK + Microservices”

- **状态**：ACCEPTED
- **日期**：2026-03-30
- **影响范围**：Contract / SDK / Services / Docs

### 背景

项目当前已完成 DDD 的 16 个模块边界与 Contract First 的接口契约设计，并在 `src/types` 与 `src/modules/*` 形成了统一的 `Result<T>`/`SdkError`/`RequestMeta` 与模块 `*Client` 形态。

### 决策

- **Contract**：独立为可发布包，承载 DTO / error codes / 统一返回模型 / 幂等与追踪约定。
- **SDK**：独立为可发布包，提供对 Contract 的“可调用实现”（HTTP 传输/鉴权注入/重试与可观测性钩子）。
- **Microservices**：基于 Contract 搭建一组 Node.js 微服务（REST/JSON + NestJS），每个 bounded context 对应一个服务（可按 MVP 合并/拆分）。

### 结果

- 契约成为唯一真源，SDK 与服务端共享同一套类型定义，降低漂移风险。
- 允许并行开发：Contract 稳定后，SDK/服务可以各自推进。

---

## ADR-0002：运行环境限定为 Node.js only

- **状态**：ACCEPTED
- **日期**：2026-03-30
- **影响范围**：SDK / Services / Tooling

### 背景

SDK 与服务端主要面向企业内网服务集成与后端系统调用，不需要浏览器/Edge 兼容。

### 决策

- **Node.js LTS** 作为唯一运行时目标（SDK 与服务端一致）。
- SDK 可默认基于 Node 18+ 的 `fetch` 能力（必要时再引入 `undici` 增强）。

### 结果

- 依赖选择更自由（无需顾虑浏览器打包限制）。
- 更容易把“traceId/日志/OTel”在 SDK 与服务端打通。

---

## ADR-0003：服务端采用 REST/JSON + NestJS

- **状态**：ACCEPTED
- **日期**：2026-03-30
- **影响范围**：Services / Tooling / Docs

### 背景

需要一个企业化、模块化、DI 完整且易于标准化模板的微服务框架，用于快速复制服务骨架与统一中间件（鉴权、错误、日志、追踪）。

### 决策

- 服务端框架采用 **NestJS**。
- 协议采用 **REST/JSON**（对外更通用；内部服务间后续可再评估 gRPC/消息）。
- 统一约束：服务端不得向外泄漏原生异常栈；必须映射为 `SdkError`/`Result<T>` 的等价 HTTP 表达。

### 结果

- 形成可复制的服务模板，降低服务数量增长带来的维护成本。
- 与当前以 TypeScript interface 为核心的契约形态匹配。

---

## ADR-0004：统一错误模型与“不可静默异常”原则

- **状态**：ACCEPTED
- **日期**：2026-03-30
- **影响范围**：Contract / SDK / Services

### 背景

项目要求：不可以静默处理任何异常；同时需要 SDK 形态（不强依赖抛异常）来支持并行开发与 mock。

### 决策

- 统一返回模型：`Result<T>`（成功 `ok: true`，失败 `ok: false`），错误为 `SdkError`。
- **服务端**：任何异常必须被捕获并转换为结构化错误；至少包含 `code`/`message`/`level`，并尽可能附带 `traceId` 与 `details`。
- **SDK**：默认不抛异常（除非调用者显式选择 throw 模式），所有失败必须可观测（返回 `Result` + 可选日志/OTel hook）。

### 结果

- 错误表现一致、可观测、可测试，避免“吞错导致难定位”。

---

## ADR-0005：幂等与追踪约定（RequestMeta）

- **状态**：ACCEPTED
- **日期**：2026-03-30
- **影响范围**：Contract / SDK / Services

### 背景

微服务环境下必须具备端到端追踪与写操作幂等能力，以支撑重试/网络抖动/重复提交。

### 决策

- `RequestMeta.traceId`：贯穿 SDK → 服务端 → 下游依赖。
- `RequestMeta.idempotencyKey`：写操作建议支持，SDK 负责透传，服务端负责落地策略（缓存/数据库唯一键/幂等表）。

### 结果

- 可复制的可靠性基线，便于后续接入 OpenTelemetry 与统一日志检索。
