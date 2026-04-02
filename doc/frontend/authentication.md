# 认证接入

## 认证方式

- 统一使用 JWT Bearer Token
- Header: `Authorization: Bearer <token>`

## 推荐 Header

| Header          | 必填 | 说明                            |
| --------------- | ---- | ------------------------------- |
| `Authorization` | 是   | Bearer Token                    |
| `x-trace-id`    | 否   | 链路追踪 ID，不传时后端自动生成 |
| `x-user-id`     | 否   | 部分服务用于审计透传            |

## 常见认证失败

- `401 Authorization header missing`
- `401 Invalid authorization header format`
- `401 Invalid or expired token`
