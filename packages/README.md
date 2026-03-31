# packages/

本目录用于承载可发布的 npm 包：

- `contract`：跨服务/跨 SDK 共享的 TypeScript 契约（DTO、错误码、Result、RequestMeta 等）
- `sdk`：对外调用 SDK（HTTP 传输、鉴权注入、重试/可观测性钩子）
- `shared`：Node-only 的共享基础设施（logger/config/otel/error 等）
