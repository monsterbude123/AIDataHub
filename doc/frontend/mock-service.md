# Mock 服务方案（MSW）

## 目标

在后端未就绪或联调窗口不足时，前端可通过 Mock 独立开发。

## 推荐方案

- 使用 `MSW`（Mock Service Worker）
- 在开发环境按需启用

## handlers 示例

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/metadata/assets/asset_1/versions', () =>
    HttpResponse.json({
      ok: true,
      data: { page: 1, pageSize: 20, total: 1, items: [{ id: 'v1' }] },
    })
  ),
  http.get('/api/admin/projects', () =>
    HttpResponse.json({
      ok: true,
      data: {
        page: 1,
        pageSize: 20,
        total: 1,
        items: [{ id: 'p1', name: 'demo', code: 'demo', orgId: 'org_1' }],
      },
    })
  ),
];
```

## 启动建议

- 本地开发默认开启 MSW
- 联调环境关闭 MSW，走真实网关地址
