# API 约定

## 统一响应格式

成功：

```json
{
  "ok": true,
  "data": {}
}
```

失败：

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ARGUMENT",
    "message": "参数错误",
    "level": "ERROR"
  }
}
```

## 分页约定

请求参数：

- `page`: 页码，从 `1` 开始
- `pageSize`: 每页数量

分页响应：

```json
{
  "ok": true,
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "items": []
  }
}
```

## 路径约定

- 统一经过网关前缀：
  - `/api/auth/*`
  - `/api/metadata/*`
  - `/api/data/*`
  - `/api/ops/*`
  - `/api/admin/*`
  - `/api/sharing/*`
  - `/api/analytics/*`
  - `/api/integration/*`
  - `/api/security/*`
