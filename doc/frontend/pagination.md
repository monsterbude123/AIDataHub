# 分页规范

## 请求

查询参数：

- `page`：页码，默认 `1`
- `pageSize`：每页大小，默认 `20`
- 可选附加筛选参数（`keyword`、`orgId`、`status` 等）

## 响应

```json
{
  "ok": true,
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "items": []
  }
}
```

## 前端处理建议

- `total === 0` 时显示空状态
- 翻页状态与 URL 查询参数保持同步
- 筛选条件变化时重置 `page=1`
