# 错误处理

## 通用错误码

| code                | 含义               | 建议处理                     |
| ------------------- | ------------------ | ---------------------------- |
| `INVALID_ARGUMENT`  | 参数错误           | 前端表单校验 + 提示用户修正  |
| `PERMISSION_DENIED` | 权限不足           | 跳转无权限页或提示联系管理员 |
| `NOT_FOUND`         | 资源不存在         | 提示资源已删除/不存在        |
| `HTTP_STATUS_ERROR` | 网关或服务状态异常 | 重试或降级                   |

## 业务常见错误码（示例）

| 领域      | code                                               |
| --------- | -------------------------------------------------- |
| Auth      | `USER_NOT_FOUND`, `TOKEN_INVALID`, `TOKEN_EXPIRED` |
| Data      | `DATA_ASSET_NOT_FOUND`, `LAYER_NOT_FOUND`          |
| Ops       | `ALERT_RULE_NOT_FOUND`, `EXECUTION_NOT_FOUND`      |
| Admin     | `PROJECT_NOT_FOUND`, `FUNCTION_NOT_FOUND`          |
| Sharing   | `DIRECTORY_NOT_FOUND`, `RESOURCE_NOT_FOUND`        |
| Analytics | `QUERY_NOT_FOUND`, `EXPORT_FAILED`                 |
| Security  | `RULE_NOT_FOUND`, `ENCRYPTION_TASK_NOT_FOUND`      |

## 前端建议封装

- 对 `Result<T>` 做统一解包函数
- 统一把 `error.code` 映射为本地化提示
- 保留 `traceId` 便于后端排障
